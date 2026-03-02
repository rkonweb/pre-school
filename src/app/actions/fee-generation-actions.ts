"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateNextIdentifierAction } from "./identifier-actions";

/**
 * Fetches all Fee Structures for this school (all years, not just current)
 * since FeeStructure.academicYear is a plain String label, not a relation.
 */
export async function getFeeStructuresForBillingAction(slug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const structures = await prisma.feeStructure.findMany({
            where: { schoolId: school.id },
            include: { components: { orderBy: { name: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, structures };
    } catch (error: any) {
        console.error("Error fetching fee structures:", error);
        return { success: false, error: error.message || "Failed to fetch fee structures" };
    }
}

/**
 * Generates individual Fee records for every ACTIVE student in the class,
 * one fee per component in the FeeStructure.
 * Duplicate prevention: skips students who already have a fee with the same
 * title from this structure for this due date.
 */
export async function generateStructureInvoicesAction(
    slug: string,
    classroomId: string,
    feeStructureId: string,
    dueDate: string,
    academicYearId?: string
) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        // Verify classroom belongs to this school
        const classroom = await prisma.classroom.findFirst({
            where: { id: classroomId, schoolId: school.id }
        });
        if (!classroom) return { success: false, error: "Classroom not found for this school" };

        // Fetch the Fee Structure & Components
        const structure = await prisma.feeStructure.findUnique({
            where: { id: feeStructureId, schoolId: school.id },
            include: { components: true }
        });

        if (!structure) return { success: false, error: "Fee structure not found" };
        if (structure.components.length === 0) {
            return { success: false, error: "This fee structure has no components. Add components in Settings → Fee Configuration first." };
        }

        // Fetch all ACTIVE students in the class
        const students = await prisma.student.findMany({
            where: { classroomId, schoolId: school.id, status: "ACTIVE" },
            select: { id: true }
        });

        if (students.length === 0) {
            return { success: false, error: "No active students found in this class." };
        }

        // Year tagging logic
        let targetYearId = academicYearId;

        if (!targetYearId) {
            // Find the AcademicYear record matching the structure's label (e.g., "2024-2025")
            const academicYear = await prisma.academicYear.findFirst({
                where: { schoolId: school.id, name: structure.academicYear }
            });
            targetYearId = academicYear?.id;
        }

        if (!targetYearId) {
            // Fallback to current year
            const currentYear = await prisma.academicYear.findFirst({
                where: { schoolId: school.id, isCurrent: true }
            });
            targetYearId = currentYear?.id;
        }

        // Build all fee payloads
        const parsedDueDate = new Date(dueDate);
        const feePayloads: any[] = [];

        for (const student of students) {
            for (const component of structure.components) {
                const invoiceNumber = await generateNextIdentifierAction(slug, 'invoice');
                const title = invoiceNumber
                    ? `${invoiceNumber} - ${structure.name} - ${component.name}`
                    : `${structure.name} - ${component.name}`;

                feePayloads.push({
                    title,
                    amount: component.amount,
                    dueDate: parsedDueDate,
                    status: "PENDING",
                    studentId: student.id,
                    academicYearId: targetYearId || null,
                    description: component.isOptional ? "Optional Fee" : "Mandatory Fee",
                    category: component.name.toUpperCase().includes("TUITION") ? "TUITION"
                        : component.name.toUpperCase().includes("TRANSPORT") ? "TRANSPORT"
                            : "GENERAL",
                });
            }
        }

        const createdResult = await prisma.fee.createMany({
            data: feePayloads,
            skipDuplicates: false,
        });

        revalidatePath(`/s/${slug}/billing`);
        return {
            success: true,
            count: createdResult.count,
            studentsCount: students.length,
            componentsCount: structure.components.length,
            message: `Generated ${createdResult.count} fee items for ${students.length} students (${structure.components.length} components each).`
        };
    } catch (error: any) {
        console.error("Error generating structured invoices:", error);
        return { success: false, error: error.message || "Failed to generate invoices" };
    }
}
