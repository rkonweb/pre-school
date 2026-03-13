import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { getEnforcedScope } from "@/lib/access-control";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, role: true, schoolId: true, firstName: true, lastName: true, branchId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        const scope = await getEnforcedScope(user.id, user.role);
        const studentWhere: any = { schoolId: user.schoolId, status: { not: "ALUMNI" } };
        if (scope.restriction && scope.allowedIds.length > 0) {
            studentWhere.classroomId = { in: scope.allowedIds };
        } else if (scope.restriction) {
            studentWhere.classroomId = { in: ["_NONE_"] };
        }

        // Parallel data fetching
        const [totalStudents, todayAttendance, classroomCount, totalStaff, pendingLeaves, recentDiary] = await Promise.all([
            prisma.student.count({ where: studentWhere }),
            prisma.attendance.findMany({
                where: {
                    student: studentWhere,
                    date: { gte: todayStart, lte: todayEnd },
                },
                select: { status: true },
            }),
            prisma.classroom.count({ where: { schoolId: user.schoolId } }),
            prisma.user.count({
                where: {
                    schoolId: user.schoolId,
                    role: { in: ["STAFF", "ADMIN", "DRIVER"] }
                }
            }),
            // Leave requests pending approval - ADMIN sees all, others see own
            (user.role === "ADMIN"
                ? (prisma as any).leaveRequest?.count({ where: { status: "PENDING", user: { schoolId: user.schoolId } } }).catch(() => 0)
                : (prisma as any).leaveRequest?.count({ where: { userId: user.id, status: "PENDING" } }).catch(() => 0)
            ) as Promise<number>,
            prisma.diaryEntry?.findMany({
                where: {
                    schoolId: user.schoolId,
                    createdAt: { gte: subDays(today, 7) }
                },
                select: { id: true, title: true, type: true, createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 5,
            }).catch(() => []),
            prisma.schoolCircular.findMany({
                where: {
                    schoolId: user.schoolId,
                    isPublished: true,
                    OR: [
                        { targetRoles: "[]" },
                        { targetRoles: "[\"PUBLIC\"]" },
                        { targetRoles: { contains: `"${user.role}"` } },
                    ]
                },
                select: { 
                    id: true, 
                    title: true, 
                    priority: true, 
                    category: true, 
                    publishedAt: true,
                    author: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { publishedAt: "desc" },
                take: 3,
            }).catch(() => [])
        ]);

        const present = todayAttendance.filter(a => a.status === "PRESENT").length;
        const absent = todayAttendance.filter(a => a.status === "ABSENT").length;
        const late = todayAttendance.filter(a => a.status === "LATE").length;
        const marked = todayAttendance.length;
        const attendanceRate = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;

        // 7-day attendance trend
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const day = subDays(today, i);
            const count = await prisma.attendance.count({
                where: {
                    student: studentWhere,
                    date: { gte: startOfDay(day), lte: endOfDay(day) },
                    status: "PRESENT",
                }
            });
            weeklyTrend.push({ date: format(day, "yyyy-MM-dd"), label: format(day, "EEE"), present: count, total: totalStudents });
        }

        return NextResponse.json({
            success: true,
            role: user.role,
            stats: {
                totalStudents,
                classroomCount,
                totalStaff,
                pendingLeaves: pendingLeaves ?? 0,
                attendance: {
                    present,
                    absent,
                    late,
                    unmarked: totalStudents - marked,
                    rate: attendanceRate,
                }
            },
            weeklyTrend,
            recentDiary: recentDiary ?? [],
            recentCirculars: (arguments[0] as any).pop() ?? [],
        });
    } catch (error: any) {
        console.error("Staff Dashboard API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
