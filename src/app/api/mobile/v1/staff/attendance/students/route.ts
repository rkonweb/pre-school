import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getAttendanceDataAction } from "@/app/actions/attendance-actions";

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

        const userId = payload.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const classroomId = searchParams.get("classroomId");
        const date = searchParams.get("date") || new Date().toISOString().split('T')[0];

        if (!slug || !classroomId) {
            return NextResponse.json({ success: false, error: "Missing slug or classroomId" }, { status: 400 });
        }

        const result = await getAttendanceDataAction(slug, classroomId, date, undefined, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            students: result.data
        });

    } catch (error: any) {
        console.error("Staff Students Attendance API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
