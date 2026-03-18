import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const userId = payload.sub as string;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true }
        });

        if (!user || !user.schoolId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const student = await prisma.student.findUnique({
            where: {
                id: id,
                schoolId: user.schoolId // Ensure they belong to the same school
            },
            include: {
                classroom: {
                    select: { name: true, roomNumber: true }
                },
                branch: {
                    select: { name: true }
                },
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 30, // Get last 30 attendance records
                    select: { date: true, status: true, notes: true }
                },
                fees: {
                    orderBy: { dueDate: 'desc' },
                    take: 10,
                    include: {
                        payments: true
                    }
                },
                reports: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: student });

    } catch (error: any) {
        console.error("Staff Students Detail GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
