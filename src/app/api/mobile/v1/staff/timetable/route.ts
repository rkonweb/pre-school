import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getStaffTimetableAction } from "@/app/actions/timetable-actions";

// GET /api/mobile/v1/staff/timetable?classroomId=xxx — Get classroom or own timetable
// The existing /staff/timetable returns only the teacher's OWN schedule
// This endpoint also supports classroomId query param for viewing a class timetable
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, role: true, schoolId: true, firstName: true, lastName: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true },
        });
        if (!school) return NextResponse.json({ success: false, error: "School not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const classroomId = searchParams.get("classroomId");

        if (classroomId) {
            // Fetch a specific classroom's full timetable
            const classroom = await prisma.classroom.findFirst({
                where: { id: classroomId, schoolId: user.schoolId },
                select: { id: true, name: true }
            });
            if (!classroom) return NextResponse.json({ success: false, error: "Classroom not found" }, { status: 404 });

            const periods = await (prisma as any).timetablePeriod?.findMany({
                where: { classroomId, classroom: { schoolId: user.schoolId } },
                include: {
                    subject: { select: { name: true } },
                    teacher: { select: { id: true, firstName: true, lastName: true } },
                },
                orderBy: [{ day: "asc" }, { startTime: "asc" }],
            }).catch(() => []);

            return NextResponse.json({
                success: true,
                classroom,
                periods: periods ?? [],
            });
        }

        // Default: return own schedule using the existing action
        const result = await getStaffTimetableAction(school.slug, user);
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
        console.error("Staff Timetable (Extended) API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
