import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { getEnforcedScope } from "@/lib/access-control";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
        let payload: any;
        try {
            const { payload: p } = await jwtVerify(token, secret);
            payload = p;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        const scope = await getEnforcedScope(user.id, user.role);

        const studentWhere: any = { schoolId: user.schoolId, status: { not: "ALUMNI" } };
        const classroomWhere: any = { schoolId: user.schoolId };

        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                studentWhere.classroomId = { in: scope.allowedIds };
                classroomWhere.id = { in: scope.allowedIds };
            } else {
                studentWhere.classroomId = { in: ["_NONE_"] }; // Prevents fetching any
                classroomWhere.id = { in: ["_NONE_"] };
            }
        }

        // All students in school (filtered by scope)
        const allStudents = await prisma.student.findMany({
            where: studentWhere,
            select: { id: true, firstName: true, lastName: true, avatar: true, classroomId: true, classroom: { select: { name: true } } },
        });
        const totalStudents = allStudents.length;
        const allowedStudentIds = allStudents.map(s => s.id);

        // Today's attendance records
        const todayRecords = await prisma.attendance.findMany({
            where: {
                studentId: { in: allowedStudentIds },
                date: { gte: todayStart, lte: todayEnd },
            },
            select: { studentId: true, status: true },
        });

        const presentIds = new Set(todayRecords.filter(r => r.status === "PRESENT").map(r => r.studentId));
        const absentIds = new Set(todayRecords.filter(r => r.status === "ABSENT").map(r => r.studentId));
        const lateIds = new Set(todayRecords.filter(r => r.status === "LATE").map(r => r.studentId));
        const markedIds = new Set(todayRecords.map(r => r.studentId));

        const todayStats = {
            total: totalStudents,
            present: presentIds.size,
            absent: absentIds.size,
            late: lateIds.size,
            unmarked: totalStudents - markedIds.size,
            presentRate: totalStudents > 0 ? Math.round((presentIds.size / totalStudents) * 100) : 0,
        };

        // Per-classroom breakdown for today
        const classrooms = await prisma.classroom.findMany({
            where: classroomWhere,
            select: { id: true, name: true },
        });

        const classBreakdown = classrooms.map(cls => {
            const classStudents = allStudents.filter(s => s.classroomId === cls.id);
            const classTotal = classStudents.length;
            const classPresent = classStudents.filter(s => presentIds.has(s.id)).length;
            const classAbsent = classStudents.filter(s => absentIds.has(s.id)).length;
            const classLate = classStudents.filter(s => lateIds.has(s.id)).length;
            const classUnmarked = classTotal - classStudents.filter(s => markedIds.has(s.id)).length;
            return {
                id: cls.id,
                name: cls.name,
                total: classTotal,
                present: classPresent,
                absent: classAbsent,
                late: classLate,
                unmarked: classUnmarked,
                rate: classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0,
            };
        }).filter(c => c.total > 0);

        // 7-day trend
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const day = subDays(today, i);
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);
            const dayRecords = await prisma.attendance.findMany({
                where: {
                    studentId: { in: allowedStudentIds },
                    date: { gte: dayStart, lte: dayEnd },
                    status: "PRESENT",
                },
                select: { id: true },
            });
            weeklyTrend.push({
                date: format(day, "yyyy-MM-dd"),
                dayLabel: format(day, "EEE"),
                present: dayRecords.length,
                total: totalStudents,
                rate: totalStudents > 0 ? Math.round((dayRecords.length / totalStudents) * 100) : 0,
            });
        }

        // Frequent absentees — students with >20% absence in last 30 days
        const thirtyDaysAgo = subDays(today, 30);
        const last30Records = await prisma.attendance.findMany({
            where: {
                studentId: { in: allowedStudentIds },
                date: { gte: startOfDay(thirtyDaysAgo), lte: todayEnd },
                status: "ABSENT",
            },
            select: { studentId: true },
        });

        // Count absences per student
        const absentCounts: Record<string, number> = {};
        for (const r of last30Records) {
            absentCounts[r.studentId] = (absentCounts[r.studentId] || 0) + 1;
        }

        const workingDays = 22; // approx working days in 30 days
        const alerts = allStudents
            .filter(s => (absentCounts[s.id] || 0) / workingDays > 0.20)
            .map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`.trim(),
                avatar: s.avatar,
                className: s.classroom?.name || "—",
                absences: absentCounts[s.id] || 0,
                absentRate: Math.round(((absentCounts[s.id] || 0) / workingDays) * 100),
            }))
            .sort((a, b) => b.absentRate - a.absentRate)
            .slice(0, 10);

        return NextResponse.json({
            success: true,
            todayStats,
            classBreakdown,
            weeklyTrend,
            alerts,
        });
    } catch (error: any) {
        console.error("Attendance Dashboard API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
