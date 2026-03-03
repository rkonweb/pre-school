import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatUser } from "@/lib/chat-auth";
import { moderateContent } from "@/lib/ai-moderation";

export async function GET(req: Request) {
    const user = await getChatUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        let broadcasts;
        if (user.role === "PARENT") {
            // Find schoolIds for this parent
            const students = await prisma.student.findMany({
                where: {
                    OR: [
                        { parentMobile: user.mobile },
                        { fatherPhone: user.mobile },
                        { motherPhone: user.mobile }
                    ]
                },
                select: { schoolId: true }
            });
            const schoolIds = Array.from(new Set(students.map(s => s.schoolId)));

            // Parents only see APPROVED broadcasts for their school(s)
            broadcasts = await prisma.broadcast.findMany({
                where: {
                    schoolId: { in: schoolIds },
                    status: "APPROVED"
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Staff see all broadcasts in their school
            broadcasts = await prisma.broadcast.findMany({
                where: { schoolId: user.schoolId },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ success: true, broadcasts });
    } catch (error) {
        console.error("Chat Broadcasts Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getChatUser(req);
    if (!user || user.role === "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, content } = await req.json();

        if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

        // AI Moderation
        const moderation = await moderateContent(`${title}\n${content}`);

        const broadcast = await prisma.broadcast.create({
            data: {
                title,
                content,
                schoolId: user.schoolId!,
                authorId: user.id,
                status: "PENDING", // Requires Admin Approval
                isFlagged: moderation.flagged,
                flaggedReason: moderation.reason
            }
        });

        return NextResponse.json({ success: true, broadcast });
    } catch (error) {
        console.error("Create Broadcast Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const user = await getChatUser(req);
    // Only Admin can approve broadcasts
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized (Admin only)" }, { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const broadcast = await prisma.broadcast.update({
            where: { id },
            data: {
                status,
                approvedById: user.id,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, broadcast });
    } catch (error) {
        console.error("Approve Broadcast Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
