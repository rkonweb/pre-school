"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";

export async function addHealthRecordAction(schoolSlug: string, studentId: string, data: any) {
    try {
        const userRes = await getCurrentUserAction();
        if (!userRes.success) return { success: false, error: "Unauthorized" };
        const currentUser = userRes.data;

        const record = await prisma.studentHealthRecord.create({
            data: {
                studentId,
                height: data.height ? parseFloat(data.height) : null,
                weight: data.weight ? parseFloat(data.weight) : null,
                bmi: data.bmi,
                visionLeft: data.visionLeft,
                visionRight: data.visionRight,
                dentalStatus: data.dentalStatus,
                generalHealth: data.generalHealth,
                recordedById: currentUser?.id
            }
        });

        revalidatePath(`/s/${schoolSlug}/students/${studentId}/progress`);
        return { success: true, data: record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentHealthHistoryAction(studentId: string) {
    try {
        const records = await prisma.studentHealthRecord.findMany({
            where: { studentId },
            orderBy: { recordedAt: 'desc' },
            include: { recordedBy: { select: { firstName: true, lastName: true } } }
        });
        return { success: true, data: records };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
