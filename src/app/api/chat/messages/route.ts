import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatUser } from "@/lib/chat-auth";
import { moderateContent } from "@/lib/ai-moderation";

export async function GET(req: Request) {
    const user = await getChatUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });

    try {
        // Disabled automatic "READ" marking on GET - this is now handled explicitly by the /mark-read endpoint

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                poll: {
                    include: {
                        responses: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Return all messages including flagged ones — Flutter UI hides them if !isMe && isFlagged
        // Only exclude admin-rejected messages
        const sanitizedMessages = messages.filter(msg => msg.status !== "REJECTED");

        return NextResponse.json({ success: true, messages: sanitizedMessages });
    } catch (error) {
        console.error("Chat Messages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getChatUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { conversationId, content, type = "TEXT", pollData } = await req.json();

        if (!conversationId) return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });

        // Check Access
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: true }
        });

        if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        if (user.role === "PARENT") {
            const s = conversation.student;
            const isAuthorized = s.parentMobile === user.mobile || s.fatherPhone === user.mobile || s.motherPhone === user.mobile;
            if (!isAuthorized) return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });

            if (conversation.participantType === "MOTHER" && s.motherPhone !== user.mobile && s.parentMobile !== user.mobile)
                return NextResponse.json({ error: "Unauthorized (Mother only chat)" }, { status: 403 });
            if (conversation.participantType === "FATHER" && s.fatherPhone !== user.mobile && s.parentMobile !== user.mobile)
                return NextResponse.json({ error: "Unauthorized (Father only chat)" }, { status: 403 });
        } else {
            if (conversation.student.schoolId !== user.schoolId)
                return NextResponse.json({ error: "Unauthorized school access" }, { status: 403 });
        }

        let pollId = null;
        if (type === "POLL" && pollData) {
            const poll = await prisma.poll.create({
                data: {
                    question: pollData.question,
                    options: JSON.stringify(pollData.options),
                    expiresAt: pollData.expiresAt ? new Date(pollData.expiresAt) : null,
                }
            });
            pollId = poll.id;
        }

        // AI Moderation
        const moderation = await moderateContent(content);

        const message = await prisma.message.create({
            data: {
                conversationId,
                content: moderation.maskedContent,
                type,
                senderType: user.role === "PARENT" ? "PARENT" : "STAFF",
                senderId: user.id,
                senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.mobile,
                pollId,
                status: "SENT",
                isFlagged: moderation.flagged,
                flaggedReason: moderation.reason,
                deliveryStatus: "DELIVERED"
            },
            include: {
                poll: true
            }
        });

        // Update conversation lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date(), updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
