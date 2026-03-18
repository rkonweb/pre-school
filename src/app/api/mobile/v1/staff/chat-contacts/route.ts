import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getEnforcedScope } from "@/lib/access-control";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const teacherId = payload.sub as string;
        
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { role: true, schoolId: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const scope = await getEnforcedScope(teacherId, user.role);
        
        let studentWhere: any = { schoolId: user.schoolId };

        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                studentWhere.classroomId = { in: scope.allowedIds };
            } else {
                studentWhere.id = "_NONE_"; // block
            }
        }

        const students = await prisma.student.findMany({
            where: studentWhere,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
            },
            orderBy: { firstName: 'asc' }
        });

        return NextResponse.json({
            success: true,
            contacts: students.map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                rollNo: s.admissionNumber
            }))
        });

    } catch (error: any) {
        console.error("Staff Chat Contacts API Error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
