"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { createAdminSchema, updateAdminSchema } from "@/lib/schemas/admin-schemas";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";

export async function getSchoolAdminsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const admins = await prisma.user.findMany({
            where: {
                school: { slug: schoolSlug },
                role: "ADMIN"
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: admins };
    } catch (error: any) {
        console.error("getSchoolAdminsAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createAdminAction(schoolSlug: string, data: unknown) {
    // 1. Zod Validation
    const parsed = createAdminSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        // 1. Get School ID from Slug
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        // 2. Check Uniqueness
        const existing = await prisma.user.findFirst({
            where: { mobile: parsed.data.mobile }
        });

        if (existing) {
            return { success: false, error: "Mobile number already registered" };
        }

        // 3. Create Admin
        const newUser = await prisma.user.create({
            data: {
                mobile: parsed.data.mobile,
                email: parsed.data.email || null,
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                designation: parsed.data.designation || null,
                department: parsed.data.department || null,
                role: "ADMIN",
                schoolId: school.id,
                status: "ACTIVE",
                // Default password or auth method handling should be here, 
                // but for now we follow the existing pattern (likely OTP only)
            }
        });

        await logAuditEvent(
            AuditEventType.ADMIN_CREATED,
            `Admin created: ${newUser.firstName} ${newUser.lastName}`,
            { createdAdminId: newUser.id },
            auth.user?.id,
            school.id
        );

        revalidatePath(`/s/${schoolSlug}/settings/admin`);
        return { success: true, data: newUser };
    } catch (error: any) {
        console.error("createAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateAdminAction(schoolSlug: string, userId: string, data: unknown) {
    // 1. Zod Validation
    const parsed = updateAdminSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        // Prevent updating self if strict rules needed, but generally allowed for admins

        await prisma.user.update({
            where: { id: userId },
            data: {
                email: parsed.data.email,
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                designation: parsed.data.designation,
                department: parsed.data.department,
                status: parsed.data.status, // ACTIVE / INACTIVE
            }
        });

        await logAuditEvent(
            AuditEventType.SETTINGS_CHANGED,
            `Admin updated: ${userId}`,
            { updatedAdminId: userId, changes: parsed.data },
            auth.user?.id,
            auth.user?.schoolId || undefined
        );

        revalidatePath(`/s/${schoolSlug}/settings/admin`);
        return { success: true };
    } catch (error: any) {
        console.error("updateAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAdminAction(schoolSlug: string, userId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        if (auth.user?.id === userId) {
            return { success: false, error: "Cannot delete yourself." };
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        await logAuditEvent(
            AuditEventType.ADMIN_DELETED,
            `Admin deleted: ${userId}`,
            { deletedAdminId: userId },
            auth.user?.id,
            auth.user?.schoolId || undefined
        );

        revalidatePath(`/s/${schoolSlug}/settings/admin`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteAdminAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleAdminStatusAction(schoolSlug: string, userId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        if (auth.user?.id === userId) {
            return { success: false, error: "Cannot deactivate yourself." };
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "User not found" };

        const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus }
        });

        await logAuditEvent(
            AuditEventType.SETTINGS_CHANGED,
            `Admin status toggled to ${newStatus}`,
            { targetUserId: userId, newStatus },
            auth.user?.id,
            auth.user?.schoolId || undefined
        );

        revalidatePath(`/s/${schoolSlug}/settings/admin`);
        return { success: true, data: { status: newStatus } };
    } catch (error: any) {
        console.error("toggleAdminStatusAction Error:", error);
        return { success: false, error: error.message };
    }
}
