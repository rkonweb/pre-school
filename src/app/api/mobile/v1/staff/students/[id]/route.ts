import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/students/[id] — Fetch a single student's full detail
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        const { id } = params;

        const student = await prisma.student.findFirst({
            where: { id, schoolId: user.schoolId },
            include: {
                classroom: { select: { id: true, name: true } },
                transportProfile: { select: { id: true, routeId: true, status: true, route: { select: { name: true } } } },
            },
        });

        if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

        // Fetch today's attendance for this student
        const today = new Date();
        const todayRecord = await prisma.attendance.findFirst({
            where: {
                studentId: id,
                date: {
                    gte: new Date(today.setHours(0, 0, 0, 0)),
                    lte: new Date(today.setHours(23, 59, 59, 999)),
                }
            },
            select: { status: true }
        });

        // Last 5 diary entries for this student
        const recentDiary = (await prisma.diaryEntry?.findMany({
            where: {
                schoolId: user.schoolId,
                OR: [
                    { classroomId: student.classroom?.id },
                    { recipients: { some: { studentId: id } } }
                ]
            },
            select: { id: true, title: true, type: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 5,
        }).catch(() => [])) ?? [];

        return NextResponse.json({
            success: true,
            student: {
                ...student,
                name: `${student.firstName} ${student.lastName ?? ""}`.trim(),
                className: student.classroom?.name,
                todayAttendance: todayRecord?.status ?? null,
            },
            recentDiary,
        });
    } catch (error: any) {
        console.error("Student Detail API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
