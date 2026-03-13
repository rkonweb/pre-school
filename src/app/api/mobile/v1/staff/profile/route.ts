import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-mobile";

// GET /api/mobile/v1/staff/profile — Get own profile
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
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
                gender: true,
                dateOfBirth: true,
                joiningDate: true,
                address: true,
                addressCity: true,
                addressState: true,
                addressZip: true,
                bloodGroup: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
                emergencyContactRelation: true,
                qualifications: true,
                experience: true,
                employmentType: true,
                subjects: true,
                bankName: true,
                bankAccountNo: true,
                bankIfsc: true,
                facebook: true,
                linkedin: true,
                twitter: true,
                instagram: true,
                school: {
                    select: { id: true, name: true, slug: true, logo: true }
                }
            }
        });

        if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

        return NextResponse.json({
            success: true,
            profile: {
                ...user,
                name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
                schoolName: user.school?.name,
                schoolLogo: user.school?.logo,
            }
        });
    } catch (error: any) {
        console.error("Staff Profile GET Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/mobile/v1/staff/profile — Update own profile
export async function PUT(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return NextResponse.json({ success: false, error: "Missing token" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload?.sub) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const {
            avatar, address, addressCity, addressState, addressZip,
            emergencyContactName, emergencyContactPhone, emergencyContactRelation,
            facebook, linkedin, twitter, instagram,
        } = body;

        // Only allow updating safe/personal fields (not role, schoolId, etc.)
        const updated = await prisma.user.update({
            where: { id: payload.sub as string },
            data: {
                ...(avatar !== undefined && { avatar }),
                ...(address !== undefined && { address }),
                ...(addressCity !== undefined && { addressCity }),
                ...(addressState !== undefined && { addressState }),
                ...(addressZip !== undefined && { addressZip }),
                ...(emergencyContactName !== undefined && { emergencyContactName }),
                ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
                ...(emergencyContactRelation !== undefined && { emergencyContactRelation }),
                ...(facebook !== undefined && { facebook }),
                ...(linkedin !== undefined && { linkedin }),
                ...(twitter !== undefined && { twitter }),
                ...(instagram !== undefined && { instagram }),
            },
            select: { id: true, firstName: true, lastName: true, avatar: true }
        });

        return NextResponse.json({ success: true, profile: updated });
    } catch (error: any) {
        console.error("Staff Profile PUT Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
