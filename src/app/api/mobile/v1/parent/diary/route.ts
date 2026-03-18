import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authResult = await getMobileAuth(req);
        if (!authResult) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');

        if (!studentId) {
             return NextResponse.json({ success: false, error: "studentId is required" }, { status: 400 });
        }

        const entries = await prisma.diaryEntry.findMany({
             where: {
                 recipients: {
                      some: { studentId }
                 }
             },
             orderBy: { createdAt: 'desc' },
             include: {
                 author: { select: { firstName: true, lastName: true, avatar: true, role: true } },
                 school: { select: { name: true } }
             }
        });

        const formatted = entries.map(e => ({
            id: e.id,
            title: e.title,
            content: e.content,
            date: e.createdAt,
            teacherName: `${e.author.firstName} ${e.author.lastName}`,
            teacherAvatar: e.author.avatar,
            category: e.type,
            isImportant: e.priority === "HIGH"
        }));

        return NextResponse.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error("Parent Diary Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
