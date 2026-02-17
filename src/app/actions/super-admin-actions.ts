"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";

/**
 * Update the maximum number of branches a school can have.
 * Only accessible by SUPER_ADMIN.
 */
export async function updateSchoolLimitAction(slug: string, maxBranches: number) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Permission denied. Super Admin only." };
        }

        const school = await prisma.school.update({
            where: { slug },
            data: { maxBranches }
        });

        await logAuditEvent(
            AuditEventType.SETTINGS_CHANGED,
            `School Branch Limit updated to ${maxBranches}`,
            { schoolId: school.id, maxBranches },
            auth.user.id,
            school.id
        );

        revalidatePath(`/s/${slug}/settings/branches`);
        return { success: true, data: school };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Toggle the status of a branch (ACTIVE / SUSPENDED).
 * Only accessible by SUPER_ADMIN.
 */
export async function toggleBranchStatusAction(slug: string, branchId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Permission denied. Super Admin only." };
        }

        const branch = await prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch) return { success: false, error: "Branch not found" };

        const newStatus = branch.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

        const updatedBranch = await prisma.branch.update({
            where: { id: branchId },
            data: { status: newStatus }
        });

        await logAuditEvent(
            AuditEventType.SETTINGS_CHANGED,
            `Branch ${branch.name} status changed to ${newStatus}`,
            { branchId, newStatus },
            auth.user.id,
            branch.schoolId
        );

        revalidatePath(`/s/${slug}/settings/branches`);
        return { success: true, data: updatedBranch };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
