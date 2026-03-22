import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth, verifyToken } from "@/lib/auth-mobile";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        let isParent = false;
        // determine if caller is staff or parent. 
        // the easiest way is to check the payload shape set by auth-mobile
        // getMobileAuth returns { phone } for parents
        const auth = await getMobileAuth(req);
        if (auth && (auth as any).phone) {
            isParent = true;
        }

        const { conversationId } = await params;
        
        if (isParent) {
             await prisma.conversation.update({
                 where: { id: conversationId },
                 data: { parentTypingAt: new Date() }
             });
        } else {
             await prisma.conversation.update({
                 where: { id: conversationId },
                 data: { staffTypingAt: new Date() }
             });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Typing API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
