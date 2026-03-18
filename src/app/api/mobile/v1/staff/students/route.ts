import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

async function getAuthorizedUser(req: Request) {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) return null;

    const userId = payload.sub as string;
    return await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, schoolId: true, branchId: true }
    });
}

export async function GET(req: Request) {
    try {
        const user = await getAuthorizedUser(req);
        if (!user || !user.schoolId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const grade = searchParams.get("grade");

        const whereClause: any = { schoolId: user.schoolId };

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNumber: { contains: search, mode: 'insensitive' } },
                { parentMobile: { contains: search } },
            ];
        }

        if (grade) {
            whereClause.AND = [
                ...(whereClause.AND || []),
                {
                    OR: [
                        { grade: grade },
                        { classroom: { name: grade } }
                    ]
                }
            ];
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                grade: true,
                status: true,
                parentName: true,
                parentMobile: true,
                classroomId: true,
                avatar: true,
                classroom: { select: { name: true } }
            },
            orderBy: { firstName: 'asc' }
        });

        return NextResponse.json({ success: true, data: students });
    } catch (error: any) {
        console.error("Staff Students GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getAuthorizedUser(req);
        if (!user || !user.schoolId || user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const student = await prisma.student.create({
            data: {
                ...body,
                schoolId: user.schoolId,
                branchId: user.branchId || undefined,
            }
        });

        return NextResponse.json({ success: true, data: student });
    } catch (error: any) {
        console.error("Staff Students POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getAuthorizedUser(req);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        const student = await prisma.student.update({
            where: { id },
            data
        });

        return NextResponse.json({ success: true, data: student });
    } catch (error: any) {
        console.error("Staff Students PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getAuthorizedUser(req);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

        await prisma.student.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Staff Students DELETE Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
