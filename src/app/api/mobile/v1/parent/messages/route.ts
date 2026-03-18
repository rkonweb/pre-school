import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

        // Get parent's students
        const familyResult = await getFamilyStudentsAction(phone);
        if (!familyResult.success || !familyResult.students || familyResult.students.length === 0) {
            return NextResponse.json({ success: false, conversations: [], unreadCount: 0 });
        }

        const allowedStudentIds = familyResult.students.map((s: any) => s.id);

        let queryStudentIds = allowedStudentIds;
        if (studentId) {
            if (!allowedStudentIds.includes(studentId)) {
                return NextResponse.json({ success: false, error: "Unauthorized access to student data" }, { status: 403 });
            }
            queryStudentIds = [studentId];
        }

        // Fetch conversations with the latest message snippet
        const conversationsRaw = await prisma.conversation.findMany({
            where: {
                studentId: { in: queryStudentIds },
            },
            include: {
                student: { select: { firstName: true, lastName: true } },
                messages: {
                    where: {
                        OR: [
                            { isFlagged: false },
                            { senderType: 'PARENT' }
                        ]
                    },
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
                conversation: { studentId: { in: queryStudentIds } },
                isRead: false,
                senderType: { not: 'PARENT' }
            }
        });

        const conversations = await Promise.all(
            conversationsRaw.map(async (c: any) => {
                // Determine true title by finding the STAFF sender name
                const staffMsg = await prisma.message.findFirst({
                    where: { conversationId: c.id, senderType: 'STAFF' },
                    orderBy: { createdAt: 'desc' }
                });
                
                let staffAvatar: string | null = null;
                if (staffMsg && staffMsg.senderId) {
                    const staffUser = await prisma.user.findUnique({
                        where: { id: staffMsg.senderId },
                        select: { avatar: true }
                    });
                    if (staffUser) {
                        staffAvatar = staffUser.avatar;
                    }
                }
                
                const dynamicTitle = staffMsg?.senderName || c.title || 'Teacher Conversation';

                return {
                    id: c.id,
                    title: dynamicTitle,
                    avatar: staffAvatar,
                    studentName: `${c.student?.firstName || ''} ${c.student?.lastName || ''}`.trim(),
                    type: c.type,
                    participantType: c.participantType,
                    lastMessageAt: c.lastMessageAt.toISOString(),
                    latestMessage: c.messages.length > 0 ? {
                        content: c.messages[0].content,
                        senderName: c.messages[0].senderName,
                        senderType: c.messages[0].senderType,
                        createdAt: c.messages[0].createdAt.toISOString(),
                        isRead: c.messages[0].isRead,
                        isFlagged: c.messages[0].isFlagged
                    } : null
                };
            })
        );

        return NextResponse.json({
            success: true,
            unreadCount,
            conversations
        });

    } catch (error: any) {
        console.error("Messages API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
