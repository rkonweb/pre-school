import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";
import { getCircularsAction, createCircularAction } from "@/app/actions/circular-actions";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            include: { school: { select: { slug: true } } }
        });

        if (!user || !user.school?.slug) {
            return NextResponse.json({ success: false, error: "User or School not found" }, { status: 404 });
        }

        // Use the existing action which already has role-based filtering logic
        const result = await getCircularsAction(user.school.slug);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Staff Circulars API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            include: { school: { select: { slug: true } } }
        });

        if (!user || !user.school?.slug) {
            return NextResponse.json({ success: false, error: "User or School not found" }, { status: 404 });
        }

        const data = await req.json();
        
        // Pass the authenticated user to avoid redundant lookups in the action
        const result = await createCircularAction({
            ...data,
            schoolSlug: user.school.slug
        }, user);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Staff Circulars POST API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
