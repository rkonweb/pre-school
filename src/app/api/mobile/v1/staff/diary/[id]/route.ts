import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { updateDiaryEntryAction, deleteDiaryEntryAction } from "@/app/actions/diary-actions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
        const entryId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true, school: { select: { slug: true } } }
        });

        if (!user || !user.schoolId) return NextResponse.json({ success: false, error: "User or School not found" }, { status: 401 });

        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true }
        });

        if (!school) return NextResponse.json({ success: false, error: "School not found" }, { status: 401 });

        // Retrieve the entry to check if user authorized and if date is today
        const existingEntry = await prisma.diaryEntry.findUnique({
            where: { id: entryId }
        });

        if (!existingEntry) {
            return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
        }

        if (existingEntry.authorId !== userId) {
            return NextResponse.json({ success: false, error: "You can only edit your own entries" }, { status: 403 });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const entryDate = existingEntry.scheduledFor || existingEntry.publishedAt || existingEntry.createdAt;
        const entryStr = new Date(entryDate).toISOString().split('T')[0];

        if (entryStr !== todayStr) {
            return NextResponse.json({ success: false, error: "You can only edit entries created today" }, { status: 400 });
        }

        const body = await req.json();

        // Validate if they are trying to update scheduledFor to a different date
        if (body.scheduledFor) {
            const scheduledStr = new Date(body.scheduledFor).toISOString().split('T')[0];
            if (scheduledStr !== todayStr) {
                return NextResponse.json({ success: false, error: "Cannot reschedule to a different date. You can only post/edit for today." }, { status: 400 });
            }
        }

        const result = await updateDiaryEntryAction(school.slug, entryId, {
            title: body.title,
            content: body.content,
            type: body.type,
            scheduledFor: body.scheduledFor,
        }, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });

    } catch (error: any) {
        console.error("Staff Diary PUT Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
        const entryId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, schoolId: true, school: { select: { slug: true } } }
        });

        if (!user || !user.schoolId) return NextResponse.json({ success: false, error: "User or School not found" }, { status: 401 });

        const school = await prisma.school.findUnique({
            where: { id: user.schoolId },
            select: { slug: true }
        });

        if (!school) return NextResponse.json({ success: false, error: "School not found" }, { status: 401 });

        const existingEntry = await prisma.diaryEntry.findUnique({
            where: { id: entryId }
        });

        if (!existingEntry) {
            return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
        }

        if (existingEntry.authorId !== userId) {
            return NextResponse.json({ success: false, error: "You can only delete your own entries" }, { status: 403 });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const entryDate = existingEntry.scheduledFor || existingEntry.publishedAt || existingEntry.createdAt;
        const entryStr = new Date(entryDate).toISOString().split('T')[0];

        if (entryStr !== todayStr) {
            return NextResponse.json({ success: false, error: "You can only delete entries created today" }, { status: 400 });
        }

        const result = await deleteDiaryEntryAction(school.slug, entryId, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: { deletedId: entryId } });

    } catch (error: any) {
        console.error("Staff Diary DELETE Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
