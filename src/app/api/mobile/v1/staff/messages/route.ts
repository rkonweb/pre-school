import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getEnforcedScope } from "@/lib/access-control";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

        const scope = await getEnforcedScope(teacherId, user.role);
        
        // Fetch conversations
        let studentWhere: any = { schoolId: user.schoolId };

        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                studentWhere.classroomId = { in: scope.allowedIds };
            } else {
                studentWhere.id = "_NONE_"; // block
            }
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                student: studentWhere,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        avatar: true,
                    }
                },
                messages: {
                    where: {
                        OR: [
                            { isFlagged: false },
                            { senderType: 'STAFF' }
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
                conversation: { student: studentWhere },
                isRead: false,
                senderType: { not: 'STAFF' },
                senderId: { not: teacherId }
            }
        });

        return NextResponse.json({
            success: true,
            unreadCount,
            conversations: conversations.map((c: any) => ({
                id: c.id,
                title: c.title || `${c.student.firstName} ${c.student.lastName}`,
                type: c.type,
                participantType: c.participantType,
                lastMessageAt: c.lastMessageAt.toISOString(),
                student: {
                    id: c.student.id,
                    name: `${c.student.firstName} ${c.student.lastName}`,
                    rollNo: c.student.admissionNumber,
                    avatar: c.student.avatar
                },
                latestMessage: c.messages.length > 0 ? {
                    content: c.messages[0].content,
                    senderName: c.messages[0].senderName,
                    senderType: c.messages[0].senderType,
                    createdAt: c.messages[0].createdAt.toISOString(),
                    isRead: c.messages[0].isRead,
                    isFlagged: c.messages[0].isFlagged
                } : null
            }))
        });

    } catch (error: any) {
        console.error("Staff Messages API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
