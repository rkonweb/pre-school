import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> | { conversationId: string } }) {
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

        // Mark incoming messages from staff as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderType: { not: "PARENT" },
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
        console.error("Mark Read Mobile API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
