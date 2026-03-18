import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/ptm/classes — Teacher's accessible classrooms with students
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const teacherId = payload.sub as string;
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        // Use access control to scope classrooms
        const { getEnforcedScope } = await import("@/lib/access-control");
        const scope = await getEnforcedScope(teacherId, user.role);

        let whereClause: any = { schoolId: user.schoolId };
        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                whereClause.OR = [
                    { id: { in: scope.allowedIds } },
                    { teacherId: teacherId },
                ];
            } else {
                whereClause.teacherId = teacherId;
            }
        }

        const classrooms = await prisma.classroom.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                teacherId: true,
                students: {
                    where: { status: "ACTIVE" },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        parentMobile: true,
                        fatherName: true,
                        motherName: true,
                    },
                    orderBy: { firstName: "asc" },
                },
                _count: { select: { students: { where: { status: "ACTIVE" } } } },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({
            success: true,
            classrooms: classrooms.map(c => ({
                id: c.id,
                name: c.name,
                isClassTeacher: c.teacherId === teacherId,
                studentCount: c._count.students,
                students: c.students,
            })),
        });
    } catch (error: any) {
        console.error("Staff PTM Classes Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
