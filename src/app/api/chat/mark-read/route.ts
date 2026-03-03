import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatUser } from "@/lib/chat-auth";

export async function POST(req: Request) {
    const user = await getChatUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { conversationId } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
        }

        // Mark incoming messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: user.id },
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date(),
                deliveryStatus: "READ"
            }
        });

        return NextResponse.json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
