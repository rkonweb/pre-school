import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        // Extract Bearer token from Authorization header
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });
        }

        // Verify JWT
        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
        }

        // Fetch user + school — fall back to schoolId claim for dev mock tokens
        let user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            include: { school: true, customRole: true }
        });

        // Fallback: if sub is a mock ID, lookup school directly via schoolId claim
        let school = user?.school ?? null;
        if (!school && payload.schoolId) {
            school = await (prisma as any).school.findUnique({
                where: { id: payload.schoolId as string }
            }) ?? null;
        }

        // Last resort: first school in DB (dev only)
        if (!school && process.env.NODE_ENV !== 'production') {
            school = await (prisma as any).school.findFirst({ orderBy: { createdAt: 'asc' } }) ?? null;
        }

        // Convert role permissions to flat string array
        let permissions: string[] = [];
        if (user?.customRole?.permissions) {
            try {
                const perms = JSON.parse(user.customRole.permissions);
                perms.forEach((p: any) => {
                    p.actions.forEach((a: string) => permissions.push(`${p.module}.${a}`));
                });
            } catch (e) {
                console.error("Permission parse error:", e);
            }
        }

        return NextResponse.json({
            success: true,
            user: user ? {
                id: user.id,
                role: user.role,
                schoolId: user.schoolId,
                branchId: user.branchId,
                name: `${user.firstName} ${user.lastName || ''}`.trim(),
                photo: user.avatar ?? null,
                schoolName: (school as any)?.name,
                schoolSlug: (school as any)?.slug,
                permissions: permissions.length > 0 ? permissions : null
            } : {
                id: payload.sub,
                role: payload.role,
                schoolId: payload.schoolId,
                branchId: payload.branchId ?? null,
                name: `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim(),
                photo: null,
                schoolName: (school as any)?.name ?? 'School',
                schoolSlug: (school as any)?.slug ?? '',
                permissions: null
            },
            // Full school branding for the Flutter app's SchoolBrandNotifier
            school: {
                id: (school as any)?.id ?? null,
                name: (school as any)?.name ?? null,
                slug: (school as any)?.slug ?? null,
                logo: (school as any)?.logo ?? null,
                primaryColor: (school as any)?.brandColor ?? (school as any)?.primaryColor ?? null,
                secondaryColor: (school as any)?.secondaryColor ?? null,
            }
        });

    } catch (error: any) {
        console.error("Staff Mobile /me Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
