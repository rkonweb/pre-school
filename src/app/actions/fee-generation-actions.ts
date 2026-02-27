"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";

/**
 * Fetches all active Fee Structures to display in the Bulk Billing dropdown.
 */
export async function getFeeStructuresForBillingAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const currentYearRes = await getCurrentAcademicYearAction(slug);
        const academicYearId = currentYearRes.data?.id;

        const structures = await prisma.feeStructure.findMany({
            where: {
                schoolId: school.id,
                // Optional: filter by academic year if you only want current templates
                ...(academicYearId ? { academicYear: academicYearId } : {})
            },
            include: {
                components: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, structures };
    } catch (error: any) {
        console.error("Error fetching fee structures:", error);
        return { success: false, error: error.message || "Failed to fetch fee structures" };
    }
}

/**
 * High-volume operation: Iterates through all students in `classroomId` and applies
 * the `FeeStructure` components to each student.
 */
export async function generateStructureInvoicesAction(
    slug: string,
    classroomId: string,
    feeStructureId: string,
    dueDate: string
) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const currentYearRes = await getCurrentAcademicYearAction(slug);
        const academicYearId = currentYearRes.data?.id;

        // 1. Fetch the Fee Structure & Components
        const structure = await prisma.feeStructure.findUnique({
            where: { id: feeStructureId, schoolId: school.id },
            include: { components: true }
        });

        if (!structure || structure.components.length === 0) {
            return { success: false, error: "Invalid fee structure or no components defined." };
        }

        // 2. Fetch all Active Students in the class
        const students = await prisma.student.findMany({
            where: {
                classroomId,
                status: "ACTIVE"
            },
            select: { id: true }
        });

        if (students.length === 0) {
            return { success: false, error: "No active students in this class." };
        }

        // 3. Batch Create Fees
        // A single fee structure has many components (e.g., Tuition, Transport, Lunch).
        // Each student gets a Fee record for each component.
        const feePayloads: any[] = [];

        students.forEach((student) => {
            structure.components.forEach((component) => {
                feePayloads.push({
                    title: `${structure.name} - ${component.name}`,
                    amount: component.amount,
                    dueDate: new Date(dueDate),
                    status: "PENDING",
                    studentId: student.id,
                    description: component.isOptional ? "Optional Fee" : "Mandatory Fee",
                    category: component.name.toUpperCase().includes("TUITION") ? "TUITION" :
                        component.name.toUpperCase().includes("TRANSPORT") ? "TRANSPORT" : "GENERAL",
                    academicYearId: academicYearId || null
                });
            });
        });

        const createdResult = await prisma.fee.createMany({
            data: feePayloads,
            skipDuplicates: false,
        });

        return {
            success: true,
            count: createdResult.count,
            message: `Generated ${createdResult.count} fee items for ${students.length} students.`
        };
    } catch (error: any) {
        console.error("Error generating structured invoices:", error);
        return { success: false, error: error.message || "Failed to generate invoices" };
    }
}
