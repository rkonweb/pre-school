"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

// ── Types ──
type RosterConfig = {
    subjects: string[];
    startDate: string; // ISO date
    endDate: string;
    gapStrategy: "NONE" | "ONE_DAY" | "TWO_DAY" | "CUSTOM";
    customGapDays?: number;
    dailyStartTime: string; // "09:00"
    dailyEndTime: string;   // "12:00"
    maxExamsPerDay: number;
    excludeWeekends: boolean;
    excludeDates: string[]; // ISO dates
    subjectMaxMarks: Record<string, number>; // { "Mathematics": 100, "English": 80 }
    ordering: "HARDEST_FIRST" | "ALPHABETICAL" | "AS_PROVIDED";
    subjectPriority?: string[]; // custom ordering
};

type GeneratedEntry = {
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    maxMarks: number;
    isGapDay: boolean;
    gapLabel?: string;
    sortOrder: number;
};

// ── AI Roster Generation (preview, not saved yet) ──
export async function generateExamRosterAction(config: RosterConfig): Promise<{
    success: boolean;
    data?: GeneratedEntry[];
    error?: string;
    stats?: { totalDays: number; examDays: number; gapDays: number; dateRange: string };
}> {
    try {
        const subjects = [...config.subjects];

        // 1. Order subjects
        if (config.ordering === "ALPHABETICAL") {
            subjects.sort();
        } else if (config.ordering === "HARDEST_FIRST" && config.subjectPriority?.length) {
            subjects.sort((a, b) => {
                const ai = config.subjectPriority!.indexOf(a);
                const bi = config.subjectPriority!.indexOf(b);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            });
        }

        // 2. Build available date pool
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const allDates: Date[] = [];
        const excludeSet = new Set(config.excludeDates);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().split("T")[0];
            if (excludeSet.has(iso)) continue;
            if (config.excludeWeekends && (d.getDay() === 0 || d.getDay() === 6)) continue;
            allDates.push(new Date(d));
        }

        if (allDates.length === 0) {
            return { success: false, error: "No available dates in the selected range" };
        }

        // 3. Calculate gap
        const gapDays = config.gapStrategy === "NONE" ? 0 :
            config.gapStrategy === "ONE_DAY" ? 1 :
            config.gapStrategy === "TWO_DAY" ? 2 :
            config.customGapDays || 0;

        // 4. Distribute subjects across dates with gaps
        const entries: GeneratedEntry[] = [];
        let dateIndex = 0;
        let sortOrder = 0;

        for (let i = 0; i < subjects.length; i++) {
            if (dateIndex >= allDates.length) {
                return { success: false, error: `Not enough dates for all subjects. Need more days or fewer gaps. Only ${allDates.length} available dates for ${subjects.length} subjects with ${gapDays}-day gaps.` };
            }

            const examDate = allDates[dateIndex];
            entries.push({
                subject: subjects[i],
                date: examDate.toISOString().split("T")[0],
                startTime: config.dailyStartTime,
                endTime: config.dailyEndTime,
                maxMarks: config.subjectMaxMarks[subjects[i]] || 100,
                isGapDay: false,
                sortOrder: sortOrder++,
            });

            dateIndex++;

            // Insert gap days
            if (gapDays > 0 && i < subjects.length - 1) {
                for (let g = 0; g < gapDays && dateIndex < allDates.length; g++) {
                    const gapDate = allDates[dateIndex];
                    entries.push({
                        subject: "",
                        date: gapDate.toISOString().split("T")[0],
                        startTime: "",
                        endTime: "",
                        maxMarks: 0,
                        isGapDay: true,
                        gapLabel: g === 0 ? "Study Leave / Revision" : "Study Leave",
                        sortOrder: sortOrder++,
                    });
                    dateIndex++;
                }
            }
        }

        const examDays = entries.filter(e => !e.isGapDay).length;
        const gapDayCount = entries.filter(e => e.isGapDay).length;

        return {
            success: true,
            data: entries,
            stats: {
                totalDays: entries.length,
                examDays,
                gapDays: gapDayCount,
                dateRange: `${entries[0].date} → ${entries[entries.length - 1].date}`,
            }
        };
    } catch (error: any) {
        console.error("Roster Generation Error:", error);
        return { success: false, error: error.message };
    }
}

// ── Save generated roster to database ──
export async function saveExamRosterAction(schoolSlug: string, examId: string, entries: GeneratedEntry[]) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        // Delete existing schedule entries for this exam
        await prisma.examScheduleEntry.deleteMany({
            where: { examId }
        });

        // Create new entries
        const created = await prisma.examScheduleEntry.createMany({
            data: entries.map(e => ({
                examId,
                subject: e.subject || "—",
                date: new Date(e.date),
                startTime: e.startTime || "",
                endTime: e.endTime || "",
                maxMarks: e.maxMarks,
                isGapDay: e.isGapDay,
                gapLabel: e.gapLabel || null,
                sortOrder: e.sortOrder,
            }))
        });

        // Update exam's startDate and endDate
        const examEntries = entries.filter(e => !e.isGapDay);
        if (examEntries.length > 0) {
            await prisma.exam.update({
                where: { id: examId },
                data: {
                    startDate: new Date(entries[0].date),
                    endDate: new Date(entries[entries.length - 1].date),
                    subjects: JSON.stringify(examEntries.map(e => e.subject)),
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/academics/exams`);
        return { success: true, data: { count: created.count } };
    } catch (error: any) {
        console.error("Save Roster Error:", error);
        return { success: false, error: error.message };
    }
}

// ── Get exam with full schedule ──
export async function getExamWithScheduleAction(examId: string) {
    try {
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                scheduleEntries: {
                    orderBy: { sortOrder: "asc" }
                },
                createdBy: { select: { firstName: true, lastName: true } },
                _count: { select: { results: true } }
            }
        });
        if (!exam) return { success: false, error: "Exam not found" };
        return { success: true, data: JSON.parse(JSON.stringify(exam)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ── Update a single schedule entry ──
export async function updateScheduleEntryAction(entryId: string, data: {
    subject?: string; date?: string; startTime?: string; endTime?: string;
    maxMarks?: number; room?: string; invigilator?: string;
    instructions?: string; syllabus?: string;
}) {
    try {
        const entry = await prisma.examScheduleEntry.update({
            where: { id: entryId },
            data: {
                ...(data.subject && { subject: data.subject }),
                ...(data.date && { date: new Date(data.date) }),
                ...(data.startTime && { startTime: data.startTime }),
                ...(data.endTime && { endTime: data.endTime }),
                ...(data.maxMarks !== undefined && { maxMarks: data.maxMarks }),
                ...(data.room !== undefined && { room: data.room }),
                ...(data.invigilator !== undefined && { invigilator: data.invigilator }),
                ...(data.instructions !== undefined && { instructions: data.instructions }),
                ...(data.syllabus !== undefined && { syllabus: data.syllabus }),
            }
        });
        return { success: true, data: JSON.parse(JSON.stringify(entry)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ── Delete single schedule entry ──
export async function deleteScheduleEntryAction(entryId: string) {
    try {
        await prisma.examScheduleEntry.delete({ where: { id: entryId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ── Add manual schedule entry ──
export async function addScheduleEntryAction(examId: string, data: {
    subject: string; date: string; startTime: string; endTime: string;
    maxMarks?: number; room?: string; invigilator?: string; syllabus?: string;
}) {
    try {
        // Get current max sortOrder
        const lastEntry = await prisma.examScheduleEntry.findFirst({
            where: { examId },
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true }
        });

        const entry = await prisma.examScheduleEntry.create({
            data: {
                examId,
                subject: data.subject,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                maxMarks: data.maxMarks || 100,
                room: data.room || null,
                invigilator: data.invigilator || null,
                syllabus: data.syllabus || null,
                sortOrder: (lastEntry?.sortOrder || 0) + 1,
            }
        });
        return { success: true, data: JSON.parse(JSON.stringify(entry)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ── Swap two schedule entries (dates & sortOrders) ──
export async function swapScheduleEntriesAction(entryIdA: string, entryIdB: string) {
    try {
        const [a, b] = await Promise.all([
            prisma.examScheduleEntry.findUnique({ where: { id: entryIdA } }),
            prisma.examScheduleEntry.findUnique({ where: { id: entryIdB } }),
        ]);
        if (!a || !b) return { success: false, error: "Entries not found" };

        await prisma.$transaction([
            prisma.examScheduleEntry.update({
                where: { id: entryIdA },
                data: { date: b.date, sortOrder: b.sortOrder },
            }),
            prisma.examScheduleEntry.update({
                where: { id: entryIdB },
                data: { date: a.date, sortOrder: a.sortOrder },
            }),
        ]);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
