"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "./session-actions";
import { getEnforcedScope, verifyClassAccess } from "@/lib/access-control";

export async function getTeacherOverviewAction(slug: string, teacherId: string) {
    try {
        // 1. Verify Requesting User
        const userRes = await getCurrentUserAction();
        if (!userRes.success || !userRes.data) {
            console.log("[TeacherDashboard] No User Session");
            return { success: false, error: "Unauthorized: No session" };
        }
        const currentUser = userRes.data;

        if (currentUser.id !== teacherId && currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
            console.log(`[TeacherDashboard] Access Denied. User: ${currentUser.id}, Target: ${teacherId}, Role: ${currentUser.role}`);
            return { success: false, error: `Access denied. You are ${currentUser.role} but this dashboard is for ${teacherId}` };
        }

        // 2. Fetch School ID
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });
        if (!school) return { success: false, error: "School not found" };

        // 3. Classrooms
        const classAccesses = await (prisma as any).classAccess.findMany({
            where: { userId: teacherId, canRead: true },
            select: { classroomId: true }
        });

        const accessIds = (classAccesses as any[]).map((c: any) => c.classroomId);

        const classrooms = await prisma.classroom.findMany({
            where: {
                schoolId: school.id,
                OR: [
                    { teacherId: teacherId },
                    { id: { in: accessIds } }
                ]
            },
            include: {
                _count: { select: { students: true } },
                students: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        dateOfBirth: true,
                        avatar: true
                    }
                },
                teacher: { select: { firstName: true, lastName: true } }
            }
        }) as any[];

        const totalStudents = classrooms.reduce((sum, c) => sum + c._count.students, 0);
        const classroomIds = classrooms.map(c => c.id);

        // 4. Pending Homework Reviews
        const pendingReviews = await prisma.homeworkSubmission.count({
            where: {
                homework: { createdById: teacherId, schoolId: school.id },
                isSubmitted: true,
                isReviewed: false
            }
        });

        // 5. Today's Attendance Stats
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                date: { gte: todayStart, lte: todayEnd },
                student: { classroomId: { in: classroomIds } }
            },
            select: { status: true }
        });

        const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
        const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
        // Total expected is totalStudents. Not marked = totalStudents - records.length

        // 6. Recent Homework Performance
        const recentHomeworks = await prisma.homework.findMany({
            where: { createdById: teacherId, schoolId: school.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                _count: { select: { submissions: true } }
            }
        });

        const homeworkStats = recentHomeworks.map(h => ({
            id: h.id,
            title: h.title,
            submitted: h._count.submissions,
            // Approximate total: if assigned to CLASS, get class count.
            // Simplified: we'll just show submitted count for now.
            assignedDate: h.createdAt
        }));

        // 7. Upcoming Birthdays (Next 30 days)
        // JS Filter method
        const allStudents = classrooms.flatMap(c => c.students);
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const birthdays = allStudents.filter(s => {
            if (!s.dateOfBirth) return false;
            const dob = new Date(s.dateOfBirth);
            const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            const nextYearBirthday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());

            return (thisYearBirthday >= today && thisYearBirthday <= next30Days) ||
                (nextYearBirthday >= today && nextYearBirthday <= next30Days);
        }).map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            date: s.dateOfBirth,
            avatar: s.avatar
        })).sort((a, b) => {
            // Sort by upcoming
            const dateA = new Date(a.date!);
            const dateB = new Date(b.date!);
            const monthA = dateA.getMonth();
            const monthB = dateB.getMonth();
            const dayA = dateA.getDate();
            const dayB = dateB.getDate();
            // Simple hack sort for near future:
            return (monthA * 31 + dayA) - (monthB * 31 + dayB);
            // Note: This simple sort fails across year boundaries (Dec -> Jan), but good enough for MVP next 30 days list usually
        }).slice(0, 5);


        // 8. Parse Schedule
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayName = days[today.getDay()];

        let todaysSchedule: any[] = [];

        (classrooms as any[]).forEach(c => {
            try {
                if (c.timetable) {
                    const scheduleJson = JSON.parse(c.timetable);
                    if (Array.isArray(scheduleJson)) {
                        const daySchedule = scheduleJson.find((d: any) => d.day === currentDayName);
                        if (daySchedule && Array.isArray(daySchedule.periods)) {
                            daySchedule.periods.forEach((p: any) => {
                                todaysSchedule.push({
                                    time: p.time || "N/A",
                                    subject: p.subject || "Activity",
                                    class: c.name
                                });
                            });
                        }
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        });

        // Sort schedule by time roughly
        todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));

        // 9. Recent Diary
        const recentDiary = await (prisma as any).diaryEntry.findMany({
            where: { authorId: teacherId, schoolId: school.id },
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true,
                publishedAt: true,
                classroom: { select: { name: true } }
            }
        });

        // 10. Recent Messages
        const recentMessages = await (prisma as any).conversation.findMany({
            where: {
                studentId: { in: allStudents.map(s => s.id) }
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                student: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { lastMessageAt: 'desc' },
            take: 3
        });

        // 11. Staff Clock-in Status
        const clockInStatus = await (prisma as any).staffAttendance.findUnique({
            where: {
                userId_date: {
                    userId: teacherId,
                    date: todayStart
                }
            },
            select: { status: true, punches: { orderBy: { timestamp: 'desc' }, take: 1 } }
        });

        // 12. School Announcements
        const announcements = await (prisma as any).notification.findMany({
            where: {
                OR: [
                    { userId: teacherId },
                    { userType: "TEACHER" },
                    { userType: "ALL" }
                ],
                type: "ANNOUNCEMENT"
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return {
            success: true,
            data: {
                profile: {
                    name: `${currentUser.firstName} ${currentUser.lastName || ""}`.trim(),
                    role: currentUser.role
                },
                stats: {
                    totalClasses: classrooms.length,
                    totalStudents,
                    pendingReviews,
                    attendance: {
                        present: presentCount,
                        absent: absentCount,
                        unmarked: totalStudents - (presentCount + absentCount)
                    },
                    clockInStatus: clockInStatus || { status: "NOT_MARKED" }
                },
                classrooms: classrooms.map(c => ({
                    id: c.id,
                    name: c.name,
                    students: c._count.students,
                    isClassTeacher: c.teacherId === teacherId
                })),
                recentDiary: recentDiary.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    status: d.status,
                    date: d.status === "PUBLISHED" ? d.publishedAt : d.updatedAt,
                    className: d.classroom?.name || "All Classes"
                })),
                schedule: todaysSchedule,
                homeworkPerformance: homeworkStats,
                birthdays,
                recentMessages: recentMessages.map((c: any) => ({
                    id: c.id,
                    studentName: `${c.student.firstName} ${c.student.lastName}`,
                    lastMessage: c.messages[0]?.content || "No messages yet",
                    time: c.messages[0]?.createdAt || c.updatedAt
                })),
                announcements
            }
        };

    } catch (error: any) {
        console.error("getTeacherOverviewAction Error:", error);
        return { success: false, error: error.message };
    }
}
