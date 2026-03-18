import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
        let payload: any;
        try {
            const { payload: p } = await jwtVerify(token, secret);
            payload = p;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const teacherId = payload.sub;
        
        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: { role: true, schoolId: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const { getEnforcedScope } = await import("@/lib/access-control");
        const scope = await getEnforcedScope(teacherId, user.role);

        let whereClause: any = { schoolId: user.schoolId };

        if (scope.restriction) {
            if (scope.allowedIds.length > 0) {
                // To allow class teachers to see their own class, even without explicit ClassAccess
                whereClause.OR = [
                    { id: { in: scope.allowedIds } },
                    { teacherId: teacherId }
                ];
            } else {
                whereClause.teacherId = teacherId;
            }
        }

        const classrooms = await prisma.classroom.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                teacherId: true,
                _count: {
                    select: { students: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            classrooms: classrooms.map(c => ({
                id: c.id,
                name: c.name,
                studentCount: c._count.students,
                isClassTeacher: c.teacherId === teacherId,
            }))
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("Staff Classrooms API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500, headers: corsHeaders });
    }
}
