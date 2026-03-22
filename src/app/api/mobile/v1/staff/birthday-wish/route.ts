import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// Pre-approved birthday wish messages — no custom messages allowed
const ALLOWED_MESSAGES = new Set([
    "Wishing you a very Happy Birthday! 🎂 May this special day bring you lots of joy and happiness. From the whole team!",
    "Happy Birthday! 🌟 Your dedication and hard work inspire us all every day. Have a wonderful day!",
    "Sending warmest birthday wishes your way! 🎉 May this year bring you loads of success and happiness!",
    "Happy Birthday! 🥳 Thank you for being such an amazing part of our team. Cheers to you!",
    "Many happy returns of the day! 🎈 Wishing you great health, happiness and prosperity!",
]);

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const senderId = payload.sub as string;

        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { id: true, firstName: true, lastName: true, schoolId: true, role: true },
        });
        if (!sender?.schoolId) return NextResponse.json({ success: false, error: "Sender not found" }, { status: 404 });

        const body = await req.json();
        const { recipientId, message } = body as { recipientId: string; message: string };

        if (!recipientId || !message) {
            return NextResponse.json({ success: false, error: "recipientId and message are required" }, { status: 400 });
        }

        // Only allow pre-approved messages
        if (!ALLOWED_MESSAGES.has(message)) {
            return NextResponse.json({ success: false, error: "Message not allowed" }, { status: 400 });
        }

        // Cannot wish yourself
        if (recipientId === senderId) {
            return NextResponse.json({ success: false, error: "Cannot send wish to yourself" }, { status: 400 });
        }

        // Verify recipient exists in same school
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            select: { id: true, firstName: true, schoolId: true },
        });
        if (!recipient || recipient.schoolId !== sender.schoolId) {
            return NextResponse.json({ success: false, error: "Recipient not found" }, { status: 404 });
        }

        const senderName = `${sender.firstName ?? "A colleague"}`.trim() || "A colleague";

        // ── One wish per person per birthday day ──────────────────────────────
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const alreadySent = await prisma.notification.findFirst({
            where: {
                userId: recipientId,
                relatedType: "BIRTHDAY_WISH",
                relatedId: senderId,
                createdAt: { gte: todayStart, lte: todayEnd },
            },
        });
        if (alreadySent) {
            return NextResponse.json(
                { success: false, error: "already_sent", message: "You already sent a birthday wish today!" },
                { status: 409 }
            );
        }

        // ── Create in-app notification for recipient ───────────────────────────
        await prisma.notification.create({
            data: {
                userId: recipientId,
                userType: "TEACHER",
                title: `🎂 Birthday wish from ${senderName}!`,
                message,
                type: "ANNOUNCEMENT",
                relatedType: "BIRTHDAY_WISH",
                relatedId: senderId,
            },
        });

        // ── Try to send mobile push notification ───────────────────────────────
        const pushDevice = await (prisma as any).pushDevice?.findFirst({
            where: { userId: recipientId, userType: "STAFF" },
            select: { pushToken: true, platform: true },
        }).catch(() => null);

        if (pushDevice?.pushToken) {
            try {
                // FCM v1 via REST (no SDK needed)
                const fcmServerKey = process.env.FCM_SERVER_KEY;
                if (fcmServerKey) {
                    await fetch("https://fcm.googleapis.com/fcm/send", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `key=${fcmServerKey}`,
                        },
                        body: JSON.stringify({
                            to: pushDevice.pushToken,
                            notification: {
                                title: `🎂 Birthday wish from ${senderName}!`,
                                body: message,
                                icon: "notification_icon",
                                sound: "default",
                            },
                            data: { type: "BIRTHDAY_WISH", senderId },
                        }),
                    });
                }
            } catch (pushErr) {
                console.warn("Push delivery failed (non-fatal):", pushErr);
            }
        }

        return NextResponse.json({ success: true, message: "Birthday wish sent!" });
    } catch (error: any) {
        console.error("Birthday Wish API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
