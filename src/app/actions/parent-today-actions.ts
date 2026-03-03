import { prisma } from "@/lib/prisma";
import { getFamilyStudentsAction } from "./parent-actions";

export async function getParentTodayTimelineAction(studentId: string, phone: string) {
    try {
        // Verify parent has access to this student
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const hasAccess = familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) {
            return { success: false, error: "Unauthorized access to student" };
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let events: any[] = [];

        // 1. Fetch Transport Logs
        const transportLogs = await prisma.transportBoardingLog.findMany({
            where: { studentId, timestamp: { gte: startOfDay, lte: endOfDay } },
            orderBy: { timestamp: 'asc' } // chronological
        });

        for (const log of transportLogs) {
            events.push({
                id: log.id,
                timestamp: log.timestamp.toISOString(),
                type: `TRANSPORT_${log.status}`, // e.g., TRANSPORT_BOARDED, TRANSPORT_DROPPED
                title: `${log.type === "PICKUP" ? "Morning" : "Evening"} Route - ${log.status}`,
                metadata: { notes: log.notes }
            });
        }

        // 2. Fetch Attendance
        const attendance = await prisma.attendance.findFirst({
            where: { studentId, date: { gte: startOfDay, lte: endOfDay } }
        });

        if (attendance) {
            events.push({
                id: attendance.id,
                timestamp: attendance.createdAt.toISOString(),
                type: `ATTENDANCE_${attendance.status}`, // e.g., ATTENDANCE_PRESENT
                title: `Marked ${attendance.status} in Class`,
                metadata: { notes: attendance.notes }
            });
        }

        // 3. Fetch Diary Entries
        // Find classroom for this student
        const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classroomId: true } });

        let diaryEntries: any[] = [];
        if (student?.classroomId) {
            diaryEntries = await prisma.diaryEntry.findMany({
                where: {
                    classroomId: student.classroomId,
                    createdAt: { gte: startOfDay, lte: endOfDay },
                    status: 'PUBLISHED'
                },
                orderBy: { createdAt: 'asc' }
            });
        }

        for (const entry of diaryEntries) {
            events.push({
                id: entry.id,
                timestamp: entry.createdAt.toISOString(),
                type: "DIARY_ENTRY",
                title: entry.title,
                metadata: { entryId: entry.id, description: entry.content }
            });
        }

        // Sort chronologically
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return {
            success: true,
            date: startOfDay.toISOString().split("T")[0],
            events
        };

    } catch (e: any) {
        console.error("getParentTodayTimelineAction error:", e);
        return { success: false, error: "Failed to load timeline events" };
    }
}
