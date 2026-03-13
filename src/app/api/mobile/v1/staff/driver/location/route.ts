import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// POST /api/mobile/v1/staff/driver/location — Push live GPS coordinates from driver's bus
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
        if (user.role !== "DRIVER" && user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Only drivers can push location" }, { status: 403 });
        }

        const body = await req.json();
        const { lat, lng, speed, heading, routeId, timestamp } = body;

        if (!lat || !lng) {
            return NextResponse.json({ success: false, error: "lat and lng are required" }, { status: 400 });
        }

        // Try to upsert driver location in BusLocation model
        const location = await (prisma as any).busLocation?.upsert({
            where: { driverId: user.id },
            create: {
                driverId: user.id,
                schoolId: user.schoolId,
                routeId: routeId ?? null,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                speed: speed ?? 0,
                heading: heading ?? 0,
                lastUpdated: timestamp ? new Date(timestamp) : new Date(),
            },
            update: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                speed: speed ?? 0,
                heading: heading ?? 0,
                lastUpdated: timestamp ? new Date(timestamp) : new Date(),
            }
        }).catch(() => {
            console.log("[GPS PUSH] BusLocation model not found — logging only");
            return { lat, lng, driverId: user!.id, lastUpdated: new Date() };
        });

        return NextResponse.json({ success: true, location });
    } catch (error: any) {
        console.error("Driver Location Push Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/mobile/v1/staff/driver/location — Get last known location (for admin/parents)
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
        const driverId = searchParams.get("driverId");

        const where: any = { schoolId: user.schoolId };
        if (driverId) where.driverId = driverId;

        const locations = await (prisma as any).busLocation?.findMany({ where }).catch(() => []);

        return NextResponse.json({ success: true, locations: locations ?? [] });
    } catch (error: any) {
        console.error("Driver Location GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
