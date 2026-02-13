"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Fetches all settings data required for the Inquiry Settings page.
 */
export async function getInquirySettingsAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                branches: true,
                users: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        branchId: true,
                    },
                },
            },
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        // Fetch Programs from MasterData
        // @ts-ignore
        const programs = await (prisma as any).masterData.findMany({
            where: {
                type: "ADMISSION_PROGRAM",
            },
            orderBy: { name: 'asc' }
        });

        return {
            success: true,
            data: {
                branches: school.branches,
                programs: programs,
                staff: school.users,
            },
        };
    } catch (error: any) {
        console.error("getInquirySettingsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Creates or updates a branch.
 */
export async function saveBranchAction(slug: string, data: { id?: string; name: string }) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!school) return { success: false, error: "School not found" };

        if (data.id) {
            await prisma.branch.update({
                where: { id: data.id },
                data: { name: data.name },
            });
        } else {
            await prisma.branch.create({
                data: {
                    name: data.name,
                    schoolId: school.id,
                },
            });
        }

        revalidatePath(`/s/${slug}/admissions/inquiry/settings`);
        return { success: true };
    } catch (error: any) {
        console.error("saveBranchAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Deletes a branch.
 */
export async function deleteBranchAction(slug: string, id: string) {
    try {
        // Safety check: is it in use by leads or users?
        const leadCount = await prisma.lead.count({ where: { preferredBranchId: id } });
        const userCount = await prisma.user.count({ where: { branchId: id } });

        if (leadCount > 0 || userCount > 0) {
            return { success: false, error: "Cannot delete branch as it is currently assigned to leads or staff members." };
        }

        await prisma.branch.delete({
            where: { id },
        });

        revalidatePath(`/s/${slug}/admissions/inquiry/settings`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteBranchAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Creates or updates an admission program.
 */
export async function saveProgramAction(slug: string, data: { id?: string; name: string; code?: string }) {
    try {
        if (data.id) {
            // @ts-ignore
            await (prisma as any).masterData.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    code: data.code || data.name.substring(0, 3).toUpperCase(),
                },
            });
        } else {
            // @ts-ignore
            await (prisma as any).masterData.create({
                data: {
                    type: "ADMISSION_PROGRAM",
                    name: data.name,
                    code: data.code || data.name.substring(0, 3).toUpperCase(),
                },
            });
        }

        revalidatePath(`/s/${slug}/admissions/inquiry/settings`);
        return { success: true };
    } catch (error: any) {
        console.error("saveProgramAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Deletes an admission program.
 */
export async function deleteProgramAction(slug: string, id: string) {
    try {
        // @ts-ignore
        await (prisma as any).masterData.delete({
            where: { id },
        });

        revalidatePath(`/s/${slug}/admissions/inquiry/settings`);
        return { success: true };
    } catch (error: any) {
        console.error("deleteProgramAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates staff assignment to a branch.
 */
export async function updateStaffBranchAction(slug: string, userId: string, branchId: string | null) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { branchId },
        });

        revalidatePath(`/s/${slug}/admissions/inquiry/settings`);
        return { success: true };
    } catch (error: any) {
        console.error("updateStaffBranchAction Error:", error);
        return { success: false, error: error.message };
    }
}
