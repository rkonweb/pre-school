import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// DELETE /api/mobile/v1/staff/leaves/[id] — Withdraw a PENDING leave
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        // Verify it belongs to this user and is still PENDING
        const leave = await (prisma as any).leaveRequest.findFirst({
            where: { id, userId: payload.sub as string },
        });

        if (!leave) {
            return NextResponse.json({ success: false, error: "Leave not found" }, { status: 404 });
        }

        if (leave.status !== "PENDING") {
            return NextResponse.json({ success: false, error: "Only PENDING leaves can be withdrawn" }, { status: 400 });
        }

        await (prisma as any).leaveRequest.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Leave withdrawn successfully" });
    } catch (error: any) {
        console.error("Staff Leave DELETE Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
