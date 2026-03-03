import { NextResponse } from "next/server";
import { getChatUser } from "@/lib/chat-auth";
import { rewriteMessagePolitely } from "@/lib/ai-moderation";

export async function POST(req: Request) {
    try {
        const user = await getChatUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { text, studentName } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const options = await rewriteMessagePolitely(text, studentName);

        return NextResponse.json({ success: true, options });
    } catch (error) {
        console.error("Rewrite Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
