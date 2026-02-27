"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClassTimetableStructureAction(classroomId: string) {
    try {
        const cls = await prisma.classroom.findUnique({
            where: { id: classroomId },
            include: {
                timetableStructure: true
            }
        });

        if (!cls?.timetableStructure) {
            return { success: true, config: null };
        }

        return { success: true, config: JSON.parse(cls.timetableStructure.config) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTimetableConfigAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { timetableConfig: true }
        });

        return { success: true, config: school?.timetableConfig ? JSON.parse(school.timetableConfig) : null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTimetableConfigAction(schoolSlug: string, config: any) {
    try {
        await prisma.school.update({
            where: { slug: schoolSlug },
            data: {
                timetableConfig: JSON.stringify(config)
            }
        });
        revalidatePath(`/s/${schoolSlug}/academics/timetable`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function checkTeacherAvailabilityAction(schoolSlug: string, teacherId: string, day: string, periodKey: string, currentClassId: string) {
    try {
        // Fetch all classrooms in the school that have a timetable and might contain the teacherId
        const classrooms = await prisma.classroom.findMany({
            where: {
                school: { slug: schoolSlug },
                id: { not: currentClassId }, // Exclude current class
                timetable: {
                    not: null,
                    contains: teacherId // Optimization: Only fetch if teacherId is present in JSON string
                }
            },
            select: {
                name: true,
                timetable: true
            }
        });

        for (const cls of classrooms) {
            if (!cls.timetable) continue;
            try {
                const schedule = JSON.parse(cls.timetable);
                const periodData = schedule[day]?.[periodKey];

                if (periodData && periodData.teacherId === teacherId) {
                    return {
                        available: false,
                        conflictClass: cls.name
                    };
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        return { available: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
