"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";

export async function createExamAction(schoolSlug: string, data: {
    title: string;
    date: Date;
    type: string; // TERM, TEST
    category: string; // ACADEMIC, SPORTS, ARTS
    classrooms: string[]; // List of IDs
    subjects?: string[]; // List of Subject Names
    maxMarks: number;
    minMarks?: number;
    questionPaperUrl?: string;
    description?: string;
    gradingSystem?: string;
}) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        // Optionally verify if user has access to these classrooms (if strictly enforced)
        // For creation, usually Admin or Coordinator does it.

        const exam = await prisma.exam.create({
            data: {
                title: data.title,
                date: data.date,
                type: data.type,
                category: data.category,
                classrooms: JSON.stringify(data.classrooms),
                subjects: JSON.stringify(data.subjects || []),
                maxMarks: data.maxMarks,
                minMarks: data.minMarks || 0,
                questionPaperUrl: data.questionPaperUrl,
                description: data.description,
                gradingSystem: data.gradingSystem || "MARKS",
                school: { connect: { slug: schoolSlug } },
                createdBy: { connect: { id: currentUser.id } }
            }
        });

        // INTEGRATION: Create Calendar Events
        // We can do this async or here. For now, strictly creating the exam.
        // TODO: Calendar Integration

        revalidatePath(`/s/${schoolSlug}/students/reports`);
        return { success: true, data: exam };
    } catch (error: any) {
        console.error("Create Exam Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getExamsAction(schoolSlug: string, category?: string) {
    try {
        const query: any = {
            school: { slug: schoolSlug }
        };
        if (category) {
            query.category = category;
        }

        const exams = await prisma.exam.findMany({
            where: query,
            orderBy: { date: 'desc' },
            include: {
                _count: {
                    select: { results: true }
                }
            }
        });
        return { success: true, data: exams };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getExamByIdAction(examId: string) {
    try {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                _count: { select: { results: true } }
            }
        });
        if (!exam) return { success: false, error: "Exam not found" };
        return { success: true, data: exam };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteExamAction(schoolSlug: string, examId: string) {
    try {
        await prisma.exam.delete({
            where: { id: examId }
        });
        revalidatePath(`/s/${schoolSlug}/students/reports`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateExamAction(schoolSlug: string, examId: string, data: {
    title: string;
    date: Date;
    type: string;
    category: string;
    classrooms: string[];
    subjects?: string[];
    maxMarks: number;
    minMarks?: number;
    questionPaperUrl?: string; // Added
    description?: string;
    gradingSystem?: string;
}) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) return { success: false, error: "Unauthorized" };

        const exam = await prisma.exam.update({
            where: { id: examId },
            data: {
                title: data.title,
                date: data.date,
                type: data.type,
                category: data.category,
                classrooms: JSON.stringify(data.classrooms),
                subjects: JSON.stringify(data.subjects || []),
                maxMarks: data.maxMarks,
                minMarks: data.minMarks || 0,
                questionPaperUrl: data.questionPaperUrl, // Added
                description: data.description,
                gradingSystem: data.gradingSystem || "MARKS",
                updatedAt: new Date()
            }
        });

        revalidatePath(`/s/${schoolSlug}/students/reports`);
        revalidatePath(`/s/${schoolSlug}/students/reports/${examId}`);
        return { success: true, data: exam };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
