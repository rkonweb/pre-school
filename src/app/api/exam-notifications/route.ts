import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { examId, title, date, classroomIds, schoolSlug } = body;

        if (!examId || !title || !classroomIds?.length) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Fetch schedule entries for this exam
        const scheduleEntries = await (prisma as any).examScheduleEntry.findMany({
            where: { examId, isGapDay: false },
            orderBy: { sortOrder: "asc" },
        });

        // Get all students in the exam's classrooms
        const students = await prisma.student.findMany({
            where: { classroomId: { in: classroomIds }, status: "ACTIVE" },
            select: { id: true, parentMobile: true, firstName: true, lastName: true },
        });

        const parentPhones = new Set<string>();
        students.forEach(s => { if (s.parentMobile) parentPhones.add(s.parentMobile); });

        const schedules: any[] = [];
        const now = new Date();

        if (scheduleEntries.length > 0) {
            // Per-subject reminders
            for (const entry of scheduleEntries) {
                const examDate = new Date(entry.date);
                const dayBefore = new Date(examDate);
                dayBefore.setDate(dayBefore.getDate() - 1);
                dayBefore.setHours(8, 0, 0, 0);
                const morningOf = new Date(examDate);
                morningOf.setHours(7, 0, 0, 0);

                const dateStr = examDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                const timeStr = entry.startTime ? ` at ${entry.startTime}` : "";

                for (const phone of parentPhones) {
                    if (dayBefore > now) {
                        schedules.push({
                            type: "EXAM_REMINDER",
                            scheduledFor: dayBefore,
                            targetUserId: `parent_${phone}`,
                            targetUserType: "PARENT",
                            title: `📝 Tomorrow: ${entry.subject} Exam`,
                            subject: `${title} — ${entry.subject}`,
                            message: `Reminder: ${entry.subject} exam (${title}) is tomorrow${timeStr}. Max marks: ${entry.maxMarks}. ${entry.syllabus ? `Syllabus: ${entry.syllabus}. ` : ""}Help your child prepare! 📖`,
                            relatedId: examId,
                            relatedType: "EXAM",
                            sendVia: "PUSH",
                        });
                    }
                    if (morningOf > now) {
                        schedules.push({
                            type: "EXAM_REMINDER",
                            scheduledFor: morningOf,
                            targetUserId: `parent_${phone}`,
                            targetUserType: "PARENT",
                            title: `🔔 Today: ${entry.subject} Exam${timeStr}`,
                            subject: `${title} — ${entry.subject}`,
                            message: `Good morning! ${entry.subject} exam starts today${timeStr}. ${entry.room ? `Room: ${entry.room}. ` : ""}Best of luck! 🍀`,
                            relatedId: examId,
                            relatedType: "EXAM",
                            sendVia: "PUSH",
                        });
                    }
                }
            }
        } else {
            // Fallback: single exam date
            const examDate = new Date(date);
            const dayBefore = new Date(examDate);
            dayBefore.setDate(dayBefore.getDate() - 1);
            dayBefore.setHours(8, 0, 0, 0);
            const morningOf = new Date(examDate);
            morningOf.setHours(7, 0, 0, 0);

            for (const phone of parentPhones) {
                if (dayBefore > now) {
                    schedules.push({
                        type: "EXAM_REMINDER", scheduledFor: dayBefore,
                        targetUserId: `parent_${phone}`, targetUserType: "PARENT",
                        title: `📝 Exam Tomorrow: ${title}`, subject: title,
                        message: `Reminder: ${title} is scheduled for tomorrow. Please help your child prepare.`,
                        relatedId: examId, relatedType: "EXAM", sendVia: "PUSH",
                    });
                }
                if (morningOf > now) {
                    schedules.push({
                        type: "EXAM_REMINDER", scheduledFor: morningOf,
                        targetUserId: `parent_${phone}`, targetUserType: "PARENT",
                        title: `🔔 Exam Today: ${title}`, subject: title,
                        message: `Today is the day! ${title} exam starts today. Best of luck! 🍀`,
                        relatedId: examId, relatedType: "EXAM", sendVia: "PUSH",
                    });
                }
            }
        }

        // Also create instant in-app notification about exam schedule
        const notifications: any[] = [];
        const subjectList = scheduleEntries.map((e: any) => e.subject).join(", ");
        for (const phone of parentPhones) {
            notifications.push({
                userId: `parent_${phone}`,
                userType: "PARENT",
                title: `📋 Exam Scheduled: ${title}`,
                message: scheduleEntries.length > 0
                    ? `Exam "${title}" timetable is ready with ${scheduleEntries.length} subjects (${subjectList}). Check the Exams section for the full schedule.`
                    : `A new exam "${title}" has been scheduled. Check the Exams section for details.`,
                type: "EXAM",
                relatedId: examId,
                relatedType: "EXAM",
            });
        }

        if (schedules.length > 0) await prisma.notificationSchedule.createMany({ data: schedules });
        if (notifications.length > 0) await prisma.notification.createMany({ data: notifications });

        return NextResponse.json({
            success: true,
            data: {
                scheduledReminders: schedules.length,
                instantNotifications: notifications.length,
                parentsNotified: parentPhones.size,
                subjectsScheduled: scheduleEntries.length,
            }
        });
    } catch (error) {
        console.error("Exam Notification Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
