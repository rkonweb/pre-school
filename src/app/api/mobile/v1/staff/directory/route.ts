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
            select: { id: true, role: true, schoolId: true },
        });
        if (!user?.schoolId) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") ?? "";
        const department = searchParams.get("department") ?? "";
        const role = searchParams.get("role") ?? "";

        const where: any = {
            schoolId: user.schoolId,
            role: { in: ["STAFF", "ADMIN", "DRIVER"] },
        };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { designation: { contains: search, mode: "insensitive" } },
            ];
        }
        if (department) where.department = { contains: department, mode: "insensitive" };
        if (role) where.role = role.toUpperCase();

        const staff = await prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                role: true,
                department: true,
                designation: true,
                avatar: true,
                status: true,
                joiningDate: true,
            },
            orderBy: [{ department: "asc" }, { firstName: "asc" }],
        });

        const formatted = staff.map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName ?? ""}`.trim(),
            email: s.email,
            phone: s.mobile,
            role: s.role,
            department: s.department ?? "General",
            designation: s.designation ?? s.role,
            avatar: s.avatar,
            status: s.status,
            joiningDate: s.joiningDate,
        }));

        // Group by department
        const grouped: Record<string, typeof formatted> = {};
        for (const m of formatted) {
            const dept = m.department;
            if (!grouped[dept]) grouped[dept] = [];
            grouped[dept].push(m);
        }

        return NextResponse.json({
            success: true,
            total: formatted.length,
            staff: formatted,
            grouped,
        });
    } catch (error: any) {
        console.error("Staff Directory API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
