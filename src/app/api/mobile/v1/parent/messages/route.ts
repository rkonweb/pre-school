import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

// GET all conversations for a student
export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        if (!phone) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 });
        }

        // Security check: ensure this parent is linked to this student
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { fatherPhone: phone },
                    { motherPhone: phone },
                    { emergencyContactPhone: phone }
                ]
            }
        });

        if (!student) {
            return NextResponse.json({ success: false, error: "Unauthorized access to student data" }, { status: 403 });
        }

        // Fetch conversations with the latest message snippet
        const conversations = await prisma.conversation.findMany({
            where: {
                studentId,
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        const unreadCount = await prisma.message.count({
            where: {
                conversation: { studentId },
                isRead: false,
                senderType: { not: 'PARENT' }
            }
        });

        return NextResponse.json({
            success: true,
            unreadCount,
            conversations: conversations.map((c: any) => ({
                id: c.id,
                title: c.title || 'Teacher Conversation',
                type: c.type,
                participantType: c.participantType,
                lastMessageAt: c.lastMessageAt.toISOString(),
                latestMessage: c.messages.length > 0 ? {
                    content: c.messages[0].content,
                    senderName: c.messages[0].senderName,
                    createdAt: c.messages[0].createdAt.toISOString(),
                    isRead: c.messages[0].isRead
                } : null
            }))
        });

    } catch (error: any) {
        console.error("Messages API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
