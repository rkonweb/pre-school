"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getCurrentUserAction } from "./session-actions";
import { verifyClassAccess } from "@/lib/access-control";

export async function createReportCardAction(studentId: string, term: string, marks: any, comments?: string, academicYearId?: string) {
    try {
        // ... (permission checks)
        const report = await prisma.reportCard.create({
            data: {
                studentId,
                term,
                marks: JSON.stringify(marks),
                comments,
                academicYearId,
                published: true
            }
        });
        return { success: true, data: report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentReportsAction(studentId: string, academicYearId?: string) {
    try {
        // ... (permission checks)
        const query: any = { studentId };
        if (academicYearId) {
            query.academicYearId = academicYearId;
        }

        const reports = await prisma.reportCard.findMany({
            where: query,
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: reports.map(r => ({ ...r, marks: JSON.parse(r.marks) })) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
