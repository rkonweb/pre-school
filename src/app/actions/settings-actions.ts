"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettingsAction() {
    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: {
                    id: 'global',
                    timezone: "UTC+05:30 (India Standard Time)",
                    currency: "INR",
                    mfaEnabled: true,
                    sessionTimeout: false,
                    allowedDomains: "*",
                    smtpHost: "",
                    smtpPort: 587,
                    smtpUser: "",
                    smtpPass: "",
                    smtpSender: "noreply@pre-school.com",
                    backupEnabled: true,
                    backupFrequency: "DAILY",
                    maintenanceMode: false
                }
            });
        }

        return {
            success: true,
            data: {
                ...settings,
                mfaEnabled: settings.mfaEnabled,
                sessionTimeout: settings.sessionTimeout,
                backupEnabled: settings.backupEnabled,
                maintenanceMode: settings.maintenanceMode
            }
        };
    } catch (error: any) {
        console.error("getSystemSettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function saveSystemSettingsAction(data: any) {
    try {
        await prisma.systemSettings.upsert({
            where: { id: 'global' },
            create: {
                id: 'global',
                timezone: data.timezone,
                currency: data.currency,
                mfaEnabled: Boolean(data.mfaEnabled),
                sessionTimeout: Boolean(data.sessionTimeout),
                allowedDomains: data.allowedDomains,
                smtpHost: data.smtpHost,
                smtpPort: Number(data.smtpPort),
                smtpUser: data.smtpUser,
                smtpPass: data.smtpPass,
                smtpSender: data.smtpSender,
                backupEnabled: Boolean(data.backupEnabled),
                backupFrequency: data.backupFrequency,
                maintenanceMode: Boolean(data.maintenanceMode)
            },
            update: {
                timezone: data.timezone,
                currency: data.currency,
                mfaEnabled: Boolean(data.mfaEnabled),
                sessionTimeout: Boolean(data.sessionTimeout),
                allowedDomains: data.allowedDomains,
                smtpHost: data.smtpHost,
                smtpPort: Number(data.smtpPort),
                smtpUser: data.smtpUser,
                smtpPass: data.smtpPass,
                smtpSender: data.smtpSender,
                backupEnabled: Boolean(data.backupEnabled),
                backupFrequency: data.backupFrequency,
                maintenanceMode: Boolean(data.maintenanceMode)
            }
        });
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

export async function getIntegrationSettingsAction(slug: string) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug },
            select: { id: true, integrationsConfig: true }
        });

        if (!school) return { success: false, error: "School not found" };

        let config = {};
        try {
            config = school.integrationsConfig ? JSON.parse(school.integrationsConfig) : {};
        } catch (e) {
            config = {};
        }

        return { success: true, data: config };
    } catch (error: any) {
        console.error("getIntegrationSettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function saveIntegrationSettingsAction(slug: string, data: any) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        await (prisma as any).school.update({
            where: { id: school.id },
            data: {
                integrationsConfig: JSON.stringify(data)
            }
        });

        revalidatePath(`/s/${slug}/settings/integrations`);
        return { success: true };
    } catch (error: any) {
        console.error("saveIntegrationSettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}
