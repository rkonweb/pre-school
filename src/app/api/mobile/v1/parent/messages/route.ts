import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";

// GET all conversations for a student
export async function GET(req: Request) {
    try {
        console.log("Messages GET Headers Auth:", req.headers.get("Authorization"));
        const auth = await getMobileAuth(req);
        if (!auth) {
            console.log("Messages GET Auth Failed. Missing or invalid token.");
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
        const familyResult = await getFamilyStudentsAction(phone);
        const hasAccess = familyResult.success && familyResult.students.some((s: any) => s.id === studentId);
        if (!hasAccess) {
            console.log("Messages GET Auth Failed. studentId:", studentId, "familyResult students:", familyResult.students?.map((s:any)=>s.id));
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
