import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns";

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
            select: { id: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const month = searchParams.get("month"); // YYYY-MM

        if (!studentId || !month) {
            return NextResponse.json({ success: false, error: "Missing studentId or month" }, { status: 400 });
        }

        // Verify student belongs to this school
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId: user.schoolId },
            select: { id: true, firstName: true, lastName: true, avatar: true, classroom: { select: { name: true } } },
        });
        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        const monthDate = new Date(`${month}-01`);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);

        // Fetch all attendance for this student this month
        const records = await prisma.attendance.findMany({
            where: {
                studentId,
                date: { gte: monthStart, lte: monthEnd },
            },
            select: { date: true, status: true, notes: true },
            orderBy: { date: "asc" },
        });

        // Build a day-by-day map
        const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const recordMap: Record<string, any> = {};
        for (const r of records) {
            recordMap[format(new Date(r.date), "yyyy-MM-dd")] = r;
        }

        const days = allDays.map(day => {
            const key = format(day, "yyyy-MM-dd");
            const record = recordMap[key];
            const dayOfWeek = day.getDay();
            return {
                date: key,
                dayOfWeek,
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
                status: record?.status || null,
                notes: record?.notes || null,
            };
        });

        const workingDays = days.filter(d => !d.isWeekend);
        const summary = {
            working: workingDays.length,
            present: records.filter(r => r.status === "PRESENT").length,
            absent: records.filter(r => r.status === "ABSENT").length,
            late: records.filter(r => r.status === "LATE").length,
            halfDay: records.filter(r => r.status === "HALF_DAY").length,
            excused: records.filter(r => r.status === "EXCUSED").length,
            attendanceRate: workingDays.length > 0
                ? Math.round((records.filter(r => r.status === "PRESENT").length / workingDays.length) * 100)
                : 0,
        };

        return NextResponse.json({
            success: true,
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`.trim(),
                avatar: student.avatar,
                className: student.classroom?.name || "—",
            },
            month,
            days,
            summary,
        });
    } catch (error: any) {
        console.error("Attendance Monthly API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
