import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// POST /api/mobile/v1/staff/register-device — Register push notification token
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
        const { pushToken, platform } = body;
        // platform = "ios" | "android" | "web"

        if (!pushToken) {
            return NextResponse.json({ success: false, error: "pushToken is required" }, { status: 400 });
        }

        // Try to upsert in PushDevice model
        const device = await (prisma as any).pushDevice?.upsert({
            where: { userId_platform: { userId: user.id, platform: platform ?? "web" } },
            create: {
                userId: user.id,
                schoolId: user.schoolId,
                pushToken,
                platform: platform ?? "web",
                userType: "STAFF",
            },
            update: {
                pushToken,
                updatedAt: new Date(),
            }
        }).catch(() => {
            // Fallback: try mobileDevices table
            return (prisma as any).mobileDevice?.upsert({
                where: { userId: user.id },
                create: { userId: user.id, pushToken, platform: platform ?? "web" },
                update: { pushToken, platform: platform ?? "web" },
            }).catch(() => null);
        });

        return NextResponse.json({ success: true, registered: !!device });
    } catch (error: any) {
        console.error("Staff Register Device Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
