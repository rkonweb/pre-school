"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addActivityRecordAction(schoolSlug: string, studentId: string, data: any) {
    try {
        const record = await prisma.studentActivityRecord.create({
            data: {
                studentId,
                title: data.title,
                category: data.category,
                type: data.type,
                date: new Date(data.date),
                description: data.description,
                achievement: data.achievement
            }
        });

        revalidatePath(`/s/${schoolSlug}/students/${studentId}/progress`);
        return { success: true, data: record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentActivitiesAction(studentId: string) {
    try {
        const records = await prisma.studentActivityRecord.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });
        return { success: true, data: records };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
