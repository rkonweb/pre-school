import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/leaves — List own leave requests
export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = { userId: user.id };
        if (status) where.status = status.toUpperCase();

        const leaves = await (prisma as any).leaveRequest.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ success: true, leaves });
    } catch (error: any) {
        console.error("Staff Leaves GET Error:", error);
        if (error.message?.includes("does not exist")) {
            return NextResponse.json({ success: true, leaves: [], note: "Leave model not configured" });
        }
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/mobile/v1/staff/leaves — Submit new leave request
export async function POST(req: Request) {
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

        const body = await req.json();
        const { type, startDate, endDate, reason } = body;

        if (!type || !startDate || !endDate || !reason) {
            return NextResponse.json({ success: false, error: "type, startDate, endDate, reason are required" }, { status: 400 });
        }

        const leave = await (prisma as any).leaveRequest.create({
            data: {
                userId: user.id,
                type: type.toUpperCase(),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: "PENDING",
            }
        });

        return NextResponse.json({ success: true, leave });
    } catch (error: any) {
        console.error("Staff Leaves POST Error:", error);
        if (error.message?.includes("does not exist")) {
            return NextResponse.json({ success: false, error: "Leave model not configured in database" }, { status: 503 });
        }
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
