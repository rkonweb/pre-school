"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";

export async function recordMarksAction(schoolSlug: string, examId: string, results: { studentId: string; subject: string; marks?: number; grade?: string; remarks?: string }[]) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success) return { success: false, error: "Unauthorized" };

        const transaction = results.map(res =>
            prisma.examResult.upsert({
                where: {
                    examId_studentId_subject: {
                        examId,
                        studentId: res.studentId,
                        subject: res.subject
                    }
                },
                update: {
                    marks: res.marks,
                    grade: res.grade,
                    remarks: res.remarks
                },
                create: {
                    examId,
                    studentId: res.studentId,
                    subject: res.subject,
                    marks: res.marks,
                    grade: res.grade,
                    remarks: res.remarks
                }
            })
        );

        await prisma.$transaction(transaction);
        revalidatePath(`/s/${schoolSlug}/students/reports/${examId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Record Marks Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getExamResultsAction(examId: string, classroomId?: string) {
    try {
        const query: any = { examId };
        if (classroomId) {
            query.student = { classroomId }; // Filter results by class if needed
        }

        const results = await prisma.examResult.findMany({
            where: query,
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        avatar: true
                    }
                }
            }
        });
        return { success: true, data: results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentResultsAction(studentId: string) {
    try {
        const results = await prisma.examResult.findMany({
            where: { studentId },
            include: {
                exam: true
            },
            orderBy: { exam: { date: 'desc' } }
        });
        return { success: true, data: results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
