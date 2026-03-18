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

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { classroomId: true }
        });

        if (!student || !student.classroomId) {
             return NextResponse.json({ success: false, error: "Student or classroom not found" }, { status: 404 });
        }

        const homeworks = await prisma.homework.findMany({
            where: { classroomId: student.classroomId },
            orderBy: { dueDate: 'asc' },
            // In a real scenario, createdById would link to a User, but Prisma schema doesn't have a direct relation defined here.
            // For now, we omit the include and set a default teacher name.
        });

        // Format for mobile
        const formattedHomework = homeworks.map(h => {
             const isPastDue = h.dueDate ? new Date(h.dueDate) < new Date() : false;
             return {
                 id: h.id,
                 title: h.title,
                 subject: h.subject,
                 description: h.description,
                 dueDate: h.dueDate,
                 isPastDue,
                 teacherName: "Class Teacher"
             }
        });

        const pending = formattedHomework.filter(h => !h.isPastDue);
        const completed = formattedHomework.filter(h => h.isPastDue); // Simplification

        return NextResponse.json({
            success: true,
            data: {
                pending,
                completed
            }
        });

    } catch (error) {
        console.error("Parent Homework Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
