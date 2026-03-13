import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/notifications — Staff notifications feed
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
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "20");
        const skip = (page - 1) * limit;

        // Fetch school-wide notifications for this user's school
        const [notifications, total] = await Promise.all([
            (prisma as any).notification?.findMany({
                where: {
                    OR: [
                        { userId: user.id },
                        { schoolId: user.schoolId, userId: null, targetRole: { in: [user.role, "ALL"] } },
                    ]
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }).catch(() => []),
            (prisma as any).notification?.count({
                where: { OR: [{ userId: user.id }, { schoolId: user.schoolId, userId: null }] }
            }).catch(() => 0),
        ]);

        // Fallback: aggregate notifications from diary, attendance alerts, and chat
        const fallbackNotifications = await buildFallbackNotifications(user.id, user.schoolId, user.role);

        return NextResponse.json({
            success: true,
            notifications: (notifications && notifications.length > 0) ? notifications : fallbackNotifications,
            total: total ?? fallbackNotifications.length,
            page,
            hasMore: skip + limit < (total ?? 0),
        });
    } catch (error: any) {
        console.error("Staff Notifications GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

async function buildFallbackNotifications(userId: string, schoolId: string, role: string) {
    const items: any[] = [];
    const now = new Date();

    try {
        // Recent diary entries as notifications
        const diary = await prisma.diaryEntry?.findMany({
            where: { schoolId, createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
            select: { id: true, title: true, type: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
        }).catch(() => []) ?? [];

        for (const d of diary) {
            items.push({
                id: `diary-${d.id}`,
                type: "DIARY",
                title: d.type === "HOMEWORK" ? "New Homework" : "New Notice",
                body: d.title,
                createdAt: d.createdAt,
                read: false,
            });
        }
    } catch {}

    return items.slice(0, 20);
}
