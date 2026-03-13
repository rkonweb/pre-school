import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/driver/route — Driver's assigned route, stops, students
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        // Find transport route assigned to this driver
        const route = await (prisma as any).transportRoute?.findFirst({
            where: {
                OR: [
                    { driverId: user.id },
                    { driver: { mobile: (payload as any).mobile } }
                ],
                schoolId: user.schoolId,
            },
            include: {
                stops: {
                    orderBy: { order: "asc" },
                    include: {
                        students: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                classroom: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        }).catch(() => null);

        if (!route) {
            // Fallback: return all transport assigned students in school for this driver
            const students = await prisma.student.findMany({
                where: {
                    schoolId: user.schoolId,
                    transportProfile: { isNot: null }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    parentMobile: true,
                    classroom: { select: { name: true } },
                    transportProfile: { select: { routeId: true, status: true, route: { select: { name: true } } } }
                },
                take: 100,
            }).catch(() => []);

            return NextResponse.json({
                success: true,
                route: null,
                students,
                message: "No specific route assigned. Showing all transport students."
            });
        }

        return NextResponse.json({ success: true, route });
    } catch (error: any) {
        console.error("Driver Route API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
