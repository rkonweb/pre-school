import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || !payload.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            include: {
                school: { select: { id: true, slug: true } },
                customRole: { select: { name: true } }
            }
        });

        if (!user || !user.schoolId) {
            return NextResponse.json({ success: false, error: "User or School not found" }, { status: 404 });
        }

        const role = user.role.toUpperCase();
        const isAdmin = ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"].includes(role);

        // Build the where clause based on role
        const where: any = { schoolId: user.schoolId };

        if (!isAdmin) {
            // Non-admins only see published circulars
            where.isPublished = true;

            // Role names to match against
            const rolesToMatch = [role];
            if (user.customRole?.name) rolesToMatch.push(user.customRole.name);

            // Show if targeted to their role, PUBLIC, or has empty targetRoles (all)
            where.OR = [
                { targetRoles: "[]" },
                { targetRoles: JSON.stringify(["PUBLIC"]) },
                ...rolesToMatch.map((r) => ({ targetRoles: { contains: `"${r}"` } })),
            ];
        }

        const circulars = await prisma.schoolCircular.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        designation: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: circulars });
    } catch (error: any) {
        console.error("Staff Circulars GET Error:", error);
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

        if (!user || !user.schoolId) {
            return NextResponse.json({ success: false, error: "User or School not found" }, { status: 404 });
        }

        const role = user.role.toUpperCase();
        const allowedRoles = ["PRINCIPAL", "ADMIN"];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ success: false, error: "Only Principal or Admin can post circulars." }, { status: 403 });
        }

        const data = await req.json();

        const circular = await prisma.schoolCircular.create({
            data: {
                title: data.title,
                subject: data.subject || null,
                content: data.content || null,
                type: data.type || "CIRCULAR",
                priority: data.priority || "NORMAL",
                category: data.category || "GENERAL",
                targetClassIds: data.targetClassIds ? JSON.stringify(data.targetClassIds) : "[]",
                targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : "[]",
                isPublished: data.isPublished || false,
                publishedAt: data.isPublished ? new Date() : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                fileUrl: data.fileUrl || null,
                attachments: data.attachments ? JSON.stringify(data.attachments) : "[]",
                schoolId: user.schoolId,
                authorId: user.id,
            },
        });

        return NextResponse.json({ success: true, data: circular });
    } catch (error: any) {
        console.error("Staff Circulars POST Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
