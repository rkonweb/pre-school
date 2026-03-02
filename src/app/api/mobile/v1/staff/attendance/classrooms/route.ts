import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
        let payload: any;
        try {
            const { payload: p } = await jwtVerify(token, secret);
            payload = p;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const teacherId = payload.sub;

        // Fetch classrooms where user is class teacher OR has explicit access
        const classAccesses = await (prisma as any).classAccess.findMany({
            where: { userId: teacherId, canRead: true },
            select: { classroomId: true }
        });

        const accessIds = (classAccesses as any[]).map((c: any) => c.classroomId);

        const classrooms = await prisma.classroom.findMany({
            where: {
                OR: [
                    { teacherId: teacherId },
                    { id: { in: accessIds } }
                ]
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { students: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            classrooms: classrooms.map(c => ({
                id: c.id,
                name: c.name,
                studentCount: c._count.students
            }))
        });

    } catch (error: any) {
        console.error("Staff Classrooms API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
