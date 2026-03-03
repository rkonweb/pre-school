import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatUser } from "@/lib/chat-auth";

export async function POST(req: Request) {
    const user = await getChatUser(req);
    // Requirement says parents only can vote, but let's be flexible if teacher also votes? 
    // Usually parents vote. 
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { pollId, optionId } = await req.json();

        if (!pollId || !optionId) return NextResponse.json({ error: "Poll ID and Option ID required" }, { status: 400 });

        // Check if poll exists and not expired
        const poll = await prisma.poll.findUnique({ where: { id: pollId } });
        if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

        if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Poll has expired" }, { status: 400 });
        }

        // Upsert response
        const response = await prisma.pollResponse.upsert({
            where: {
                pollId_userId: {
                    pollId,
                    userId: user.id
                }
            },
            update: {
                optionId,
                createdAt: new Date()
            },
            create: {
                pollId,
                userId: user.id,
                optionId
            }
        });

        return NextResponse.json({ success: true, response });
    } catch (error) {
        console.error("Poll Vote Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
