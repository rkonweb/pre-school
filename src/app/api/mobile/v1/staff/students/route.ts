import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.sub as string;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true }
        });

        if (!user || !user.schoolId) {
            return NextResponse.json({ success: false, error: "User or school not found" }, { status: 401 });
        }

        // Fetch students for the user's school
        const students = await prisma.student.findMany({
            where: {
                schoolId: user.schoolId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: students
        });

    } catch (error: any) {
        console.error("Staff Students API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
