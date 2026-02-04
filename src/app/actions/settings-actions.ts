"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettingsAction() {
    try {
        const settings: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM SystemSettings WHERE id = 'global'`);

        if (settings.length === 0) {
            const defaultSettings = {
                id: 'global',
                timezone: "UTC+05:30 (India Standard Time)",
                currency: "INR",
                mfaEnabled: 1,
                sessionTimeout: 0,
                allowedDomains: "*",
                smtpHost: "",
                smtpPort: 587,
                smtpUser: "",
                smtpPass: "",
                smtpSender: "noreply@pre-school.com",
                backupEnabled: 1,
                backupFrequency: "DAILY",
                maintenanceMode: 0
            };
            await prisma.$executeRawUnsafe(
                `INSERT INTO SystemSettings (id, timezone, currency, mfaEnabled, sessionTimeout, allowedDomains, smtpHost, smtpPort, smtpUser, smtpPass, smtpSender, backupEnabled, backupFrequency, maintenanceMode, updatedAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                defaultSettings.id, defaultSettings.timezone, defaultSettings.currency,
                defaultSettings.mfaEnabled, defaultSettings.sessionTimeout, defaultSettings.allowedDomains,
                defaultSettings.smtpHost, defaultSettings.smtpPort, defaultSettings.smtpUser,
                defaultSettings.smtpPass, defaultSettings.smtpSender, defaultSettings.backupEnabled,
                defaultSettings.backupFrequency, defaultSettings.maintenanceMode
            );
            return { success: true, data: { ...defaultSettings, mfaEnabled: true, sessionTimeout: false, backupEnabled: true, maintenanceMode: false } };
        }

        const s = settings[0];
        return {
            success: true,
            data: {
                ...s,
                mfaEnabled: Boolean(s.mfaEnabled),
                sessionTimeout: Boolean(s.sessionTimeout),
                backupEnabled: Boolean(s.backupEnabled),
                maintenanceMode: Boolean(s.maintenanceMode)
            }
        };
    } catch (error: any) {
        console.error("getSystemSettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function saveSystemSettingsAction(data: any) {
    try {
        await prisma.$executeRawUnsafe(`
            INSERT INTO SystemSettings (
                id, timezone, currency, mfaEnabled, sessionTimeout, allowedDomains, 
                smtpHost, smtpPort, smtpUser, smtpPass, smtpSender, 
                backupEnabled, backupFrequency, maintenanceMode, updatedAt
            )
            VALUES ('global', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
                timezone = excluded.timezone,
                currency = excluded.currency,
                mfaEnabled = excluded.mfaEnabled,
                sessionTimeout = excluded.sessionTimeout,
                allowedDomains = excluded.allowedDomains,
                smtpHost = excluded.smtpHost,
                smtpPort = excluded.smtpPort,
                smtpUser = excluded.smtpUser,
                smtpPass = excluded.smtpPass,
                smtpSender = excluded.smtpSender,
                backupEnabled = excluded.backupEnabled,
                backupFrequency = excluded.backupFrequency,
                maintenanceMode = excluded.maintenanceMode,
                updatedAt = datetime('now')
        `,
            data.timezone, data.currency, data.mfaEnabled ? 1 : 0, data.sessionTimeout ? 1 : 0, data.allowedDomains,
            data.smtpHost, Number(data.smtpPort), data.smtpUser, data.smtpPass, data.smtpSender,
            data.backupEnabled ? 1 : 0, data.backupFrequency, data.maintenanceMode ? 1 : 0
        );
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error: any) {
        console.error("saveSystemSettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getInfrastructureStatsAction() {
    try {
        const schools: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM School`);
        const users: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM User`);
        const students: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM Student`);

        return {
            success: true,
            data: {
                totalSchools: Number(schools[0].count),
                totalStaff: Number(users[0].count),
                totalStudents: Number(students[0].count),
                dbSizeMB: Math.floor(Math.random() * 50) + 10 // Placeholder for real file size
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSchoolSettingsAction(slug: string) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        return {
            success: true,
            data: {
                id: school.id,
                name: school.name,
                slug: school.slug,
                email: school.email,
                phone: school.phone,
                address: school.address,
                city: school.city,
                state: school.state,
                logo: school.logo,
                brandColor: school.brandColor || school.primaryColor,
                primaryColor: school.primaryColor,
                secondaryColor: school.secondaryColor,
                timezone: school.timezone || "UTC+05:30 (India Standard Time)",
                currency: school.currency || "INR",
                academicYearStart: school.academicYearStart,
                academicYearEnd: school.academicYearEnd,
                workingDays: (() => {
                    try {
                        return school.workingDays ? JSON.parse(school.workingDays) : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    } catch (e) {
                        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    }
                })(),
                schoolTimings: school.schoolTimings || "9:00 AM - 3:00 PM",
                zip: school.zip,
                pincode: school.zip,
                googleMapsApiKey: school.googleMapsApiKey
            }
        };
    } catch (error: any) {
        console.error("getSchoolSettingsAction Error for slug:", slug, error);
        return { success: false, error: error.message };
    }
}

export async function updateSchoolProfileAction(slug: string, data: any) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug }
        });

        if (!school) return { success: false, error: "School not found" };

        const updateData: any = {};

        // Define helpers for safe assignment
        const setIfDefined = (key: string, val: any) => {
            if (val !== undefined) updateData[key] = val === "" ? null : val;
        };

        // Basic Info
        setIfDefined("name", data.name);
        setIfDefined("email", data.email);
        setIfDefined("phone", data.phone);
        setIfDefined("address", data.address);
        setIfDefined("city", data.city);
        setIfDefined("state", data.state);
        setIfDefined("country", data.country);

        if (data.zip !== undefined || data.pincode !== undefined) {
            const z = data.zip || data.pincode;
            updateData.zip = z ? String(z) : null;
        }

        // Branding
        if (data.logo !== undefined) updateData.logo = data.logo;
        if (data.brandColor || data.primaryColor) {
            const color = data.brandColor || data.primaryColor;
            updateData.brandColor = color;
            updateData.primaryColor = color;
        }
        setIfDefined("secondaryColor", data.secondaryColor);
        setIfDefined("motto", data.motto);
        setIfDefined("website", data.website);

        if (data.foundingYear !== undefined) {
            updateData.foundingYear = data.foundingYear ? String(data.foundingYear) : null;
        }

        // Config
        setIfDefined("timezone", data.timezone);
        setIfDefined("currency", data.currency);
        setIfDefined("schoolTimings", data.schoolTimings);

        if (data.workingDays !== undefined) {
            updateData.workingDays = data.workingDays ? JSON.stringify(data.workingDays) : null;
        }

        setIfDefined("googleMapsApiKey", data.googleMapsApiKey);

        // Dates
        if (data.academicYearStart) updateData.academicYearStart = new Date(data.academicYearStart);
        if (data.academicYearEnd) updateData.academicYearEnd = new Date(data.academicYearEnd);

        const updated = await (prisma as any).school.update({
            where: { id: school.id },
            data: updateData
        });

        revalidatePath(`/s/${slug}/settings`);
        revalidatePath(`/s/${slug}/settings/identity`);
        revalidatePath(`/s/${slug}/settings/location`);
        revalidatePath(`/s/${slug}/settings/config`);

        return { success: true, data: updated };
    } catch (error: any) {
        console.error("updateSchoolProfileAction Error:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
}
