import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getEnforcedScope } from "@/lib/access-control";

// GET all messages in a specific conversation
export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> | { conversationId: string } }) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const teacherId = payload.sub as string;
        
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { role: true, schoolId: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const resolvedParams = await params;
        const conversationId = resolvedParams.conversationId;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: true }
        });

        if (!conversation) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });

        // scope access verify
        const scope = await getEnforcedScope(teacherId, user.role);
        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                if (!scope.allowedIds.includes(conversation.student.classroomId || "_NONE_")) {
                    return NextResponse.json({ success: false, error: "Unauthorized access to this conversation" }, { status: 403 });
                }
            } else {
                return NextResponse.json({ success: false, error: "Unauthorized access to this conversation" }, { status: 403 });
            }
        }

        // Fetch messages
        const rawMessages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });
        
        // Filter flagged messages from receivers
        const messages = rawMessages.filter(m => {
           if (m.isFlagged && m.senderType !== 'STAFF') return false;
           // If it's a staff, they only see their own flagged messages
           if (m.isFlagged && m.senderType === 'STAFF' && m.senderId !== teacherId) return false;
           return true; 
        });

        const typingThreshold = new Date(Date.now() - 5000); // 5 seconds
        const isTyping = conversation.parentTypingAt && conversation.parentTypingAt > typingThreshold;

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
                    isMe: m.senderType === 'STAFF' && m.senderId === teacherId,
                    isRead: m.isRead,
                    deliveryStatus: m.deliveryStatus,
                    isFlagged: m.isFlagged,
                    flaggedReason: m.flaggedReason,
                    createdAt: m.createdAt.toISOString()
                }))
        });

    } catch (error: any) {
        console.error("Staff Conversation API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST a new message
export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> | { conversationId: string } }) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const teacherId = payload.sub as string;
        
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { role: true, schoolId: true, firstName: true, lastName: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const { content } = await req.json();
        if (!content || content.trim() === '') {
            return NextResponse.json({ success: false, error: "Message content is required" }, { status: 400 });
        }

        const resolvedParams = await params;
        const conversationId = resolvedParams.conversationId;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { student: true }
        });

        if (!conversation) return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });

        // Check if teacher has access
        const scope = await getEnforcedScope(teacherId, user.role);
        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                if (!scope.allowedIds.includes(conversation.student.classroomId || "_NONE_")) {
                    return NextResponse.json({ success: false, error: "Unauthorized access to this conversation" }, { status: 403 });
                }
            } else {
                return NextResponse.json({ success: false, error: "Unauthorized access to this conversation" }, { status: 403 });
            }
        }

        const staffName = `${user.firstName} ${user.lastName}`;

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
                senderType: "STAFF",
                senderId: teacherId,
                senderName: staffName,
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
        console.error("Staff Send Message API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
