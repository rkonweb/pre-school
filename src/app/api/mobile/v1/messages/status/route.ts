import { NextResponse } from "next/server";
import { getMobileAuth, verifyToken } from "@/lib/auth-mobile";
import { updateMessageReceiptAction } from "@/app/actions/parent-actions";

export async function POST(req: Request) {
    try {
        // Support both parent (phone-based) and staff (Bearer JWT) auth
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        let auth: any = null;
        if (token) {
            auth = await verifyToken(token);
        }
        if (!auth) {
            auth = await getMobileAuth(req);
        }
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, messageIds, status } = await req.json();

        if (!conversationId || !Array.isArray(messageIds) || !status) {
            return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
        }

        const result = await updateMessageReceiptAction(conversationId, messageIds, status);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Mobile Message Receipt API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
