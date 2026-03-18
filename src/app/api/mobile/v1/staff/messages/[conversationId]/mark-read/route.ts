import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getEnforcedScope } from "@/lib/access-control";

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

        // Mark incoming messages from parent as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderType: "PARENT",
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date(),
                deliveryStatus: "READ"
            }
        });

        return NextResponse.json({ success: true, message: "Messages marked as read" });

    } catch (error: any) {
        console.error("Staff Mark Read Mobile API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
