import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/ptm — Staff PTM sessions with bookings
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

        const sessions = await prisma.pTMSession.findMany({
            where: { schoolId: user.schoolId },
            include: {
                bookings: {
                    include: {
                        student: {
                            select: {
                                firstName: true,
                                lastName: true,
                                admissionNumber: true,
                                classroom: { select: { name: true } },
                            },
                        },
                    },
                    orderBy: { slotTime: "asc" },
                },
                _count: { select: { bookings: true } },
            },
            orderBy: { date: "desc" },
            take: 50,
        });

        return NextResponse.json({
            success: true,
            sessions: JSON.parse(JSON.stringify(sessions)),
        });
    } catch (error: any) {
        console.error("Staff PTM GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/mobile/v1/staff/ptm — Create a PTM session
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
        const { title, description, date, startTime, endTime, slotMinutes, classIds } = body;

        if (!title || !date) {
            return NextResponse.json({ success: false, error: "title and date are required" }, { status: 400 });
        }

        const session = await prisma.pTMSession.create({
            data: {
                schoolId: user.schoolId,
                title,
                description: description || null,
                date: new Date(date),
                startTime: startTime || "09:00",
                endTime: endTime || "16:00",
                slotMinutes: slotMinutes || 10,
                classIds: JSON.stringify(classIds || ["all"]),
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            session: JSON.parse(JSON.stringify(session)),
        }, { status: 201 });
    } catch (error: any) {
        console.error("Staff PTM POST Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/mobile/v1/staff/ptm — Toggle session active state
export async function PATCH(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { sessionId, isActive } = body;

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
        }

        await prisma.pTMSession.update({
            where: { id: sessionId },
            data: { isActive: isActive !== undefined ? isActive : false },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Staff PTM PATCH Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/mobile/v1/staff/ptm — Delete a session
export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
        }

        await prisma.pTMSession.delete({
            where: { id: sessionId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Staff PTM DELETE Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
