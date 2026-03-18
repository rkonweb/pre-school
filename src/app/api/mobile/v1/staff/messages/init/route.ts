import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getEnforcedScope } from "@/lib/access-control";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const teacherId = payload.sub as string;
        
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { role: true, schoolId: true, firstName: true, lastName: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const body = await req.json();
        const { studentId } = body;

        if (!studentId) {
             return NextResponse.json({ success: false, error: "Student ID required" }, { status: 400 });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student || student.schoolId !== user.schoolId) {
             return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
        }

        const scope = await getEnforcedScope(teacherId, user.role);
        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                if (!scope.allowedIds.includes(student.classroomId || "_NONE_")) {
                    return NextResponse.json({ success: false, error: "Unauthorized access to this student" }, { status: 403 });
                }
            } else {
                return NextResponse.json({ success: false, error: "Unauthorized access to this student" }, { status: 403 });
            }
        }

        // Check if conversation exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                studentId: studentId,
                type: '1ON1',
                participantType: 'STAFF_PARENT'
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    studentId: studentId,
                    type: '1ON1',
                    participantType: 'STAFF_PARENT',
                    title: `Parent of ${student.firstName} ${student.lastName}`
                }
            });
        }

        return NextResponse.json({
            success: true,
            conversation: {
                id: conversation.id,
                title: conversation.title,
            }
        });

    } catch (error: any) {
        console.error("Staff Init Message API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
