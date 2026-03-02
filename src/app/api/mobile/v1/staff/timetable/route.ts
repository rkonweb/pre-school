import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getStaffTimetableAction } from "@/app/actions/timetable-actions";

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
            select: { id: true, role: true, schoolId: true, firstName: true, lastName: true }
        });

        if (!user || !user.schoolId) {
            return NextResponse.json({ success: false, error: "User or School not found" }, { status: 401 });
        }

        // Extract school slug from URL or query params if needed, but the action handles it via user's schoolId potentially
        // For now, let's find the school slug for this user
        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true }
        });

        if (!school) {
            return NextResponse.json({ success: false, error: "School not found" }, { status: 401 });
        }

        const result = await getStaffTimetableAction(school.slug, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error: any) {
        console.error("Staff Timetable API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
