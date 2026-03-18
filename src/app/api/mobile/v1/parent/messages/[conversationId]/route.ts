import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all messages in a specific conversation
export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> | { conversationId: string } }) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const phone = (auth as any).phone;
        if (!phone) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const resolvedParams = await params;
        const conversationId = resolvedParams.conversationId;

        // Verify parent has access to this conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: true }
        });

        if (!conversation) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });

        const { student } = conversation;
        if (student.fatherPhone !== phone && student.motherPhone !== phone && student.emergencyContactPhone !== phone) {
            return NextResponse.json({ success: false, error: "Unauthorized access to this conversation" }, { status: 403 });
        }

        // Disabled automatic "READ" marking on GET - this is now handled explicitly by the /mark-read endpoint

        // Fetch messages
        const rawMessages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });
        
        // Filter flagged messages from receivers
        const messages = rawMessages.filter(m => {
           if (m.isFlagged && m.senderType !== 'PARENT') return false;
           // If it's a parent, they only see their own flagged messages
           if (m.isFlagged && m.senderType === 'PARENT' && m.senderId !== phone) return false;
           return true; 
        });

        const typingThreshold = new Date(Date.now() - 5000); // 5 seconds
        const isTyping = conversation.staffTypingAt && conversation.staffTypingAt > typingThreshold;

        return NextResponse.json({
            success: true,
            isTyping: isTyping,
            messages: messages
                .map((m: any) => ({
                    id: m.id,
                    content: m.content,
                    type: m.type,
                    senderType: m.senderType,
                    senderName: m.senderName,
                    isMe: m.senderType === 'PARENT' && m.senderId === phone,
                    isRead: m.isRead,
                    deliveryStatus: m.deliveryStatus,
                    isFlagged: m.isFlagged,
                    flaggedReason: m.flaggedReason,
                    createdAt: m.createdAt.toISOString()
                }))
        });

    } catch (error: any) {
        console.error("Conversation API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// POST a new message
export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> | { conversationId: string } }) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const phone = (auth as any).phone;
        if (!phone) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const { content } = await req.json();
        if (!content || content.trim() === '') {
            return NextResponse.json({ success: false, error: "Message content is required" }, { status: 400 });
        }

        const resolvedParams = await params;
        const conversationId = resolvedParams.conversationId;

        // Verify access
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: true }
        });

        if (!conversation) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });

        const { student } = conversation;
        if (student.fatherPhone !== phone && student.motherPhone !== phone && student.emergencyContactPhone !== phone) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }

        let parentName = `${student.firstName} (G)`;
        if (student.fatherPhone === phone) parentName = `${student.firstName} (F)`;
        else if (student.motherPhone === phone) parentName = `${student.firstName} (M)`;

        // --- Moderation Checks ---
        const { moderateMessage } = await import('@/lib/chat-moderator');
        const blockCheck = moderateMessage(content);

        let isFlagged = false;
        let flaggedReason = null;
        let finalContent = content;

        if (!blockCheck.isApproved) {
            isFlagged = true;
            flaggedReason = blockCheck.reason;
        } else {
            // --- AI Content Filtering ---
            const { moderateContent } = await import('@/lib/ai-moderation');
            const moderation = await moderateContent(content);
            finalContent = moderation.maskedContent;
            isFlagged = moderation.flagged;
            flaggedReason = moderation.reason;
        }

        // Create message
        const newMessage = await prisma.message.create({
            data: {
                content: finalContent,
                type: "TEXT",
                senderType: "PARENT",
                senderId: phone,
                senderName: parentName,
                isFlagged: isFlagged,
                flaggedReason: flaggedReason,
                conversationId: conversationId,
                status: "SENT",
                isRead: false,
                deliveryStatus: "DELIVERED"
            }
        });

        // Update conversation last message timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                content: newMessage.content,
                type: newMessage.type,
                senderType: newMessage.senderType,
                senderName: newMessage.senderName,
                createdAt: newMessage.createdAt.toISOString(),
                isRead: newMessage.isRead,
                deliveryStatus: newMessage.deliveryStatus,
                isFlagged: newMessage.isFlagged
            }
        });

    } catch (error: any) {
        console.error("Send Message API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
