"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUserAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";

export async function createReportCardAction(studentId: string, term: string, marks: any, comments?: string) {
    try {
        // PERMISSION CHECK
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        // Fetch student to get classroom
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        if (student.classroomId) {
            const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
            if (!hasAccess) {
                return { success: false, error: "You do not have permission for this student's class." };
            }
        } else {
            // Logic for unassigned student? Usually deny or allow ADMIN only.
            // verifyClassAccess returns true for ADMIN/SUPER_ADMIN regardless of ID.
            // But if id is missing? 
            // Let's assume STAFF should not be editing unassigned students if they are restricted.
            // verifyClassAccess: if !restriction -> true.
            // if restriction -> check includes.
            // If classroomId is null, it won't be in allowed list.
            if (currentUser.role === 'STAFF') return { success: false, error: "Student has no class assigned." };
        }

        const report = await prisma.reportCard.create({
            data: {
                studentId,
                term,
                marks: JSON.stringify(marks),
                comments,
                published: true
            }
        });
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentReportsAction(studentId: string) {
    try {
        // PERMISSION CHECK (Optional: If UI already blocks, redundant but safe)
        const userRes = await getCurrentUserAction();
        if (userRes.success && userRes.data) {
            const currentUser = userRes.data;
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { classroomId: true }
            });

            if (student && student.classroomId) {
                const hasAccess = await verifyClassAccess(currentUser.id, currentUser.role, student.classroomId);
                if (!hasAccess) return { success: true, data: [] }; // Hide
            }
        }

        const reports = await prisma.reportCard.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: reports.map(r => ({ ...r, marks: JSON.parse(r.marks) })) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
