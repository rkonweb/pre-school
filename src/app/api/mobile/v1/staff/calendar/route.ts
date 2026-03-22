import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      include: { school: { select: { id: true, slug: true, schoolTimings: true, workingDays: true, academicYearStartMonth: true } } },
    });

    if (!user?.schoolId || !user.school) {
      return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });
    }

    const schoolId = user.schoolId;

    // Fetch holidays, day statuses, and notes in parallel
    const [holidays, dayStatuses, notes] = await Promise.all([
      prisma.schoolHoliday.findMany({
        where: { schoolId },
        orderBy: { date: "asc" },
        select: { id: true, name: true, date: true, type: true, isHoliday: true, recurring: true },
      }),
      prisma.calendarDayStatus.findMany({
        where: { schoolId },
        orderBy: { date: "asc" },
        select: { id: true, date: true, status: true },
      }),
      prisma.calendarNote.findMany({
        where: { schoolId },
        orderBy: { date: "asc" },
        select: { id: true, date: true, title: true, note: true, color: true, reminder: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        schoolTimings: user.school.schoolTimings || "9:00 AM - 3:00 PM",
        workingDays: user.school.workingDays || '["MON","TUE","WED","THU","FRI"]',
        academicYearStartMonth: user.school.academicYearStartMonth ?? 4,
        holidays: JSON.parse(JSON.stringify(holidays)),
        dayStatuses: JSON.parse(JSON.stringify(dayStatuses)),
        notes: JSON.parse(JSON.stringify(notes)),
      },
    });
  } catch (error) {
    console.error("[staff/calendar] GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
