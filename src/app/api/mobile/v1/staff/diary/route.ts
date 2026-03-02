import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { createDiaryEntryAction, getDiaryEntriesAction } from "@/app/actions/diary-actions";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
        let payload: any;
        try {
            const { payload: p } = await jwtVerify(token, secret);
            payload = p;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true }
        });

        if (!user || !user.schoolId) return NextResponse.json({ success: false, error: "User or School not found" }, { status: 401 });

        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true }
        });

        if (!school) return NextResponse.json({ success: false, error: "School not found" }, { status: 401 });

        // Parse query params
        const url = new URL(req.url);
        const classroomId = url.searchParams.get("classroomId") || undefined;
        const month = url.searchParams.get("month") || undefined; // YYYY-MM
        const type = url.searchParams.get("type") || undefined;

        // Use the action to respect scope
        const result = await getDiaryEntriesAction(school.slug, { classroomId, month, type });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
        console.error("Staff Diary GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
        let payload: any;
        try {
            const { payload: p } = await jwtVerify(token, secret);
            payload = p;
        } catch {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true }
        });

        if (!user || !user.schoolId) return NextResponse.json({ success: false, error: "User or School not found" }, { status: 401 });

        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true }
        });

        if (!school) return NextResponse.json({ success: false, error: "School not found" }, { status: 401 });

        const body = await req.json();
        const { title, content, type, classroomId, studentIds, priority, requiresAck } = body;

        // Enforce date constraint: Mobile App can only create entries for TODAY.
        const todayStr = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'

        // Ensure that scheduledFor is today or null (meaning now)
        if (body.scheduledFor) {
            const plannedDateStr = new Date(body.scheduledFor).toISOString().split('T')[0];
            if (plannedDateStr !== todayStr) {
                return NextResponse.json({ success: false, error: "You can only post diary entries for the current date." }, { status: 400 });
            }
        }

        // Enforce recipients based on selection. Default to CLASS if a classroomId is provided but no students.
        let recipientType: "CLASS" | "STUDENT" | "GROUP" = body.recipientType;
        if (!recipientType) {
            if (studentIds && studentIds.length > 0) {
                recipientType = "STUDENT";
            } else if (classroomId) {
                recipientType = "CLASS";
            } else {
                return NextResponse.json({ success: false, error: "Either classroomId or studentIds must be provided." }, { status: 400 });
            }
        }

        // We will pass the current date for scheduling if not provided, ensuring it's today and not scheduled for future.
        const result = await createDiaryEntryAction({
            schoolSlug: school.slug,
            title,
            content,
            type: type || "HOMEWORK",
            classroomId,
            recipientType,
            studentIds,
            priority: priority || "NORMAL",
            requiresAck: requiresAck || false,
            // scheduledFor parameter not strictly passed from mobile, we assume it's "now"
        });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
        console.error("Staff Diary POST Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
