import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
    let decoded;
    try {
      const { payload } = await jwtVerify(token, secret);
      decoded = payload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ success: false, error: "Invalid token payload" }, { status: 401 });
    }

    const userId = decoded.sub as string;

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");

    const now = new Date();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Get user's school data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: {
          select: {
            id: true,
            schoolTimings: true,
            workingDays: true,
          },
        },
      },
    });

    if (!user || !user.school) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }

    const schoolId = user.school.id;

    // Fetch attendance records with punches
    const attendanceRecords = await prisma.staffAttendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        punches: { orderBy: { timestamp: "asc" } },
      },
      orderBy: { date: "asc" },
    });

    // Fetch holidays for this school in this month
    const holidays = await prisma.schoolHoliday.findMany({
      where: {
        schoolId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    // Fetch approved leave requests in this month
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: "APPROVED",
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
          { startDate: { lte: startDate }, endDate: { gte: endDate } },
        ],
      },
      orderBy: { startDate: "asc" },
    });

    // Parse working days
    let workingDaysArr: string[] = ["MON", "TUE", "WED", "THU", "FRI"];
    try {
      const parsed = JSON.parse(user.school.workingDays || '["MON","TUE","WED","THU","FRI"]');
      if (Array.isArray(parsed)) workingDaysArr = parsed;
    } catch {}

    // Calculate summary
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayDay = today.getDate();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;

    let totalWorkingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let daysWorked = 0;
    let leavesTaken = 0;
    let totalHours = 0;

    const holidayDates = new Set(
      holidays.map((h) => new Date(h.date).toISOString().slice(0, 10))
    );

    // Build leave date set
    const leaveDates = new Set<string>();
    for (const lr of leaveRequests) {
      const s = new Date(lr.startDate);
      const e = new Date(lr.endDate);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        leaveDates.add(d.toISOString().slice(0, 10));
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      if (isCurrentMonth && day > todayDay) break; // Don't count future days

      const d = new Date(Date.UTC(year, month - 1, day));
      const dayName = dayNames[d.getUTCDay()];
      const dateStr = d.toISOString().slice(0, 10);

      if (!workingDaysArr.includes(dayName)) {
        weekendDays++;
        continue;
      }

      if (holidayDates.has(dateStr)) {
        holidayDays++;
        continue;
      }

      totalWorkingDays++;

      if (leaveDates.has(dateStr)) {
        leavesTaken++;
        continue;
      }

      // Check attendance
      const record = attendanceRecords.find(
        (r) => new Date(r.date).toISOString().slice(0, 10) === dateStr
      );
      if (record && (record.status === "PRESENT" || record.status === "LATE")) {
        daysWorked++;
        // Calculate hours for this day
        const punches = record.punches;
        let firstIn: Date | null = null;
        let lastOut: Date | null = null;
        for (const p of punches) {
          if (p.type === "IN" && !firstIn) firstIn = new Date(p.timestamp);
          if (p.type === "OUT") lastOut = new Date(p.timestamp);
        }
        if (firstIn && lastOut && lastOut > firstIn) {
          totalHours += (lastOut.getTime() - firstIn.getTime()) / (1000 * 60 * 60);
        }
      }
    }

    return NextResponse.json({
      success: true,
      month,
      year,
      schoolTimings: user.school.schoolTimings || "9:00 AM - 3:00 PM",
      workingDays: workingDaysArr,
      attendance: attendanceRecords.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        punches: r.punches.map((p) => ({
          id: p.id,
          type: p.type,
          timestamp: p.timestamp,
        })),
      })),
      holidays: holidays.map((h) => ({
        id: h.id,
        name: h.name,
        date: h.date,
        type: h.type,
      })),
      leaves: leaveRequests.map((lr) => ({
        id: lr.id,
        startDate: lr.startDate,
        endDate: lr.endDate,
        type: lr.type,
        status: lr.status,
      })),
      summary: {
        totalWorkingDays,
        daysWorked,
        leavesTaken,
        holidayDays,
        weekendDays,
        totalHours: Math.round(totalHours * 10) / 10,
        avgHours: daysWorked > 0 ? Math.round((totalHours / daysWorked) * 10) / 10 : 0,
      },
    });
  } catch (error) {
    console.error("GET self attendance calendar error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
