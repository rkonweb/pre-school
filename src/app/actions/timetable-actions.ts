"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

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

export async function getStaffTimetableAction(schoolSlug: string, authenticatedUser?: any) {
    try {
        let currentUser = authenticatedUser;

        if (!currentUser) {
            const { success, user, error } = await validateUserSchoolAction(schoolSlug);
            if (!success || !user) return { success: false, error: error || "Unauthorized" };
            currentUser = user;
        }

        const teacherId = currentUser.id;

        // ── FIX: scan ALL classrooms with a timetable ────────────────────────
        // The portal assigns teachers per-period (cellData.teacherId), so we
        // must scan every classroom, not just ones the teacher "owns".
        const classrooms = await prisma.classroom.findMany({
            where: {
                school: { slug: schoolSlug },
                timetable: { not: null },
            },
            select: {
                id: true,
                name: true,
                timetable: true,
                timetableStructure: { select: { config: true } }
            }
        });

        // Staff name map
        const allStaff = await prisma.user.findMany({
            where: { school: { slug: schoolSlug }, role: { in: ['STAFF', 'TEACHER', 'ADMIN'] } },
            select: { id: true, firstName: true, lastName: true }
        });
        const staffMap = new Map(allStaff.map(s => [s.id, `${s.firstName || ''} ${s.lastName || ''}`.trim()]));

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        const result: any = { classrooms: [], mySchedule: {} as Record<string, any[]> };
        days.forEach(day => result.mySchedule[day] = []);

        for (const cls of classrooms) {
            let scheduleData: any = {};
            let structureConfig: any = { periods: [], workingDays: [] };

            try {
                if (cls.timetable) scheduleData = JSON.parse(cls.timetable);
                if (cls.timetableStructure?.config) structureConfig = JSON.parse(cls.timetableStructure.config);
            } catch (e) {
                console.error(`Error parsing timetable for class ${cls.id}:`, e);
                continue;
            }

            const mobileTimetableArray: any[] = [];

            for (const dayName of days) {
                const daySchedule = scheduleData[dayName] || {};
                const dailyPeriods: any[] = [];

                for (const periodDef of (structureConfig.periods || [])) {
                    if (periodDef.type === "CLASS") {
                        const cellData = daySchedule[periodDef.id];
                        if (cellData && (cellData.subject || cellData.teacherId)) {
                            const periodObj = {
                                time: `${periodDef.startTime || ''} - ${periodDef.endTime || ''}`,
                                startTime: periodDef.startTime || '',
                                endTime: periodDef.endTime || '',
                                type: "CLASS",
                                subject: cellData.subject || "Activity",
                                teacherId: cellData.teacherId,
                                teacherName: cellData.teacherId ? staffMap.get(cellData.teacherId) || '' : '',
                                className: cls.name,
                                classId: cls.id,
                                room: periodDef.room || periodDef.roomNumber || null,
                                studentCount: 0,
                            };
                            dailyPeriods.push(periodObj);

                            // Match logged-in teacher by their user ID inside the timetable cell
                            if (cellData.teacherId === teacherId) {
                                result.mySchedule[dayName].push(periodObj);
                            }
                        }
                    } else if (periodDef.type === "BREAK") {
                        const breakObj = {
                            time: `${periodDef.startTime || ''} - ${periodDef.endTime || ''}`,
                            startTime: periodDef.startTime || '',
                            endTime: periodDef.endTime || '',
                            type: "BREAK",
                            subject: periodDef.name || "Break",
                            className: '',
                            classId: cls.id,
                        };
                        dailyPeriods.push(breakObj);

                        // Deduplicate breaks by startTime
                        const exists = result.mySchedule[dayName].find(
                            (p: any) => p.type === 'BREAK' && p.startTime === breakObj.startTime
                        );
                        if (!exists) result.mySchedule[dayName].push(breakObj);
                    }
                }

                // Sort by startTime
                dailyPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));
                result.mySchedule[dayName].sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

                if (dailyPeriods.length > 0) {
                    mobileTimetableArray.push({ day: dayName, periods: dailyPeriods });
                }
            }

            result.classrooms.push({ id: cls.id, name: cls.name, timetable: mobileTimetableArray });
        }

        return { success: true, data: JSON.parse(JSON.stringify(result)) };

    } catch (error: any) {
        console.error("getStaffTimetableAction Error:", error);
        return { success: false, error: error.message };
    }
}
