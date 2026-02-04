"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPayrollSettingsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) throw new Error("School not found");

        const settings = await (prisma as any).payrollSettings.findUnique({
            where: { schoolId: school.id }
        });

        return { success: true, data: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePayrollSettingsAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) throw new Error("School not found");

        const settings = await (prisma as any).payrollSettings.upsert({
            where: { schoolId: school.id },
            update: {
                fullAttendanceBonus: Number(data.fullAttendanceBonus),
                punctualityBonus: Number(data.punctualityBonus),
                lateThreshold: Number(data.lateThreshold),
                latePenalty: Number(data.latePenalty),
                overtimeRate: Number(data.overtimeRate),
                workDaysPerWeek: Number(data.workDaysPerWeek),
                standardWorkHours: Number(data.standardWorkHours),
            },
            create: {
                schoolId: school.id,
                fullAttendanceBonus: Number(data.fullAttendanceBonus),
                punctualityBonus: Number(data.punctualityBonus),
                lateThreshold: Number(data.lateThreshold),
                latePenalty: Number(data.latePenalty),
                overtimeRate: Number(data.overtimeRate),
                workDaysPerWeek: Number(data.workDaysPerWeek),
                standardWorkHours: Number(data.standardWorkHours),
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings/payroll`);
        return { success: true, data: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
