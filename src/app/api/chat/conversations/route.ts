import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChatUser } from "@/lib/chat-auth";

export async function GET(req: Request) {
    const user = await getChatUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        let conversations;
        if (user.role === "PARENT") {
            // Find students associated with this parent phone
            const students = await prisma.student.findMany({
                where: {
                    OR: [
                        { parentMobile: user.mobile },
                        { fatherPhone: user.mobile },
                        { motherPhone: user.mobile }
                    ]
                }
            });
            const studentIds = students.map(s => s.id);

            const allConversations = await prisma.conversation.findMany({
                where: {
                    studentId: { in: studentIds },
                },
                include: {
                    student: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });

            // Post-process to filter based on specific parent role matching mobile
            conversations = allConversations.filter(conv => {
                const s = conv.student;
                const isMother = s.motherPhone === user.mobile;
                const isFather = s.fatherPhone === user.mobile;
                const isGeneralParent = s.parentMobile === user.mobile;

                if (conv.participantType === "BOTH") return true;
                if (conv.participantType === "MOTHER" && (isMother || isGeneralParent)) return true;
                if (conv.participantType === "FATHER" && (isFather || isGeneralParent)) return true;
                return false;
            });

        } else {
            // Teacher/Admin
            conversations = await prisma.conversation.findMany({
                where: {
                    student: { schoolId: user.schoolId }
                },
                include: {
                    student: true,
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }

        return NextResponse.json({ success: true, conversations });
    } catch (error: any) {
        console.error("Chat Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error", trace: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getChatUser(req);
    if (!user || user.role === "PARENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { studentId, participantType, type = "GENERAL" } = await req.json();

        if (!studentId) return NextResponse.json({ error: "Student ID target required" }, { status: 400 });

        // Upsert conversation
        const conversation = await prisma.conversation.upsert({
            where: {
                studentId_type_participantType: {
                    studentId,
                    type,
                    participantType: participantType || "BOTH"
                }
            },
            create: {
                studentId,
                type,
                participantType: participantType || "BOTH",
            },
            update: {
                updatedAt: new Date()
            },
            include: {
                student: true
            }
        });

        return NextResponse.json({ success: true, conversation });
    } catch (error) {
        console.error("Create Conversation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
