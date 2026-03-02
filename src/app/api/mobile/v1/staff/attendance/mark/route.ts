import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { markAttendanceAction } from "@/app/actions/attendance-actions";

export async function POST(req: Request) {
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

        const body = await req.json();
        const { slug, studentId, date, status, notes, academicYearId } = body;

        if (!slug || !studentId || !date || !status) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const result = await markAttendanceAction(slug, studentId, date, status, notes, academicYearId, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true
        });

    } catch (error: any) {
        console.error("Staff Mark Attendance API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
