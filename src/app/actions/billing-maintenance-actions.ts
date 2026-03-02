"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Link existing fees missing academicYearId to a specific year or the current active year.
 */
export async function reconcileOrphanFeesAction(slug: string, academicYearId?: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        let targetYearId = academicYearId;

        if (!targetYearId) {
            const currentYear = await prisma.academicYear.findFirst({
                where: { schoolId: school.id, isCurrent: true }
            });
            targetYearId = currentYear?.id;
        }

        if (!targetYearId) return { success: false, error: "No target academic year found to link to." };

        const result = await prisma.fee.updateMany({
            where: {
                student: { schoolId: school.id },
                academicYearId: null
            },
            data: {
                academicYearId: targetYearId
            }
        });

        revalidatePath(`/s/${slug}/billing`);
        return { success: true, count: result.count, message: `Successfully reconciled ${result.count} orphan invoices.` };
    } catch (error: any) {
        console.error("Reconcile Error:", error);
        return { success: false, error: error.message };
    }
}
