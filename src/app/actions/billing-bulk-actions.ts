"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateNextIdentifierAction } from "./identifier-actions";

export async function getBulkBillingInitData(slug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, currency: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const classrooms = await prisma.classroom.findMany({
            where: { schoolId: school.id },
            select: {
                id: true,
                name: true,
                _count: { select: { students: { where: { status: "ACTIVE" } } } }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, classrooms, currency: school.currency || "INR" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Get students for a specific classroom — used for live preview.
 */
export async function getClassStudentsAction(slug: string, classroomId: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        const students = await prisma.student.findMany({
            where: { classroomId, schoolId: school.id, status: "ACTIVE" },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
            },
            orderBy: { firstName: 'asc' }
        });

        return { success: true, students };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Custom amount bulk generate — one fee per student.
 */
export async function generateBulkInvoicesAction(
    slug: string,
    classroomId: string,
    data: { title: string; amount: number; dueDate: string },
    academicYearId?: string
) {
    try {
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "School not found" };

        let targetYearId = academicYearId;

        if (!targetYearId) {
            // Get Current Academic Year to tag the fees if not provided
            const currentYear = await prisma.academicYear.findFirst({
                where: { schoolId: school.id, isCurrent: true }
            });
            targetYearId = currentYear?.id;
        }

        // Verify The classroom belongs to this school
        const classroom = await prisma.classroom.findFirst({
            where: { id: classroomId, schoolId: school.id }
        });
        if (!classroom) return { success: false, error: "Classroom not found for this school" };

        const students = await prisma.student.findMany({
            where: { classroomId, schoolId: school.id, status: "ACTIVE" },
            select: { id: true }
        });

        if (students.length === 0) {
            return { success: false, error: "No active students found in this class" };
        }

        const feeData = [];
        for (const s of students) {
            const invoiceNumber = await generateNextIdentifierAction(slug, 'invoice');
            feeData.push({
                studentId: s.id,
                title: invoiceNumber ? `${invoiceNumber} - ${data.title}` : data.title,
                amount: Number(data.amount),
                dueDate: new Date(data.dueDate),
                status: "PENDING",
                category: "GENERAL",
                academicYearId: targetYearId || null,
                description: `Bulk generated on ${new Date().toLocaleDateString('en-IN')}`
            });
        }

        const fees = await prisma.fee.createMany({
            data: feeData,
            skipDuplicates: false,
        });

        revalidatePath(`/s/${slug}/billing`);
        return {
            success: true,
            count: fees.count,
            message: `Generated ${fees.count} invoices for ${students.length} students.`
        };
    } catch (e: any) {
        console.error("Bulk Invoice Error:", e);
        return { success: false, error: e.message };
    }
}
