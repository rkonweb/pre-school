import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth-mobile";

// ─── Mobile normalization ─────────────────────────────────────────────────────
// Tries multiple representations to handle inconsistencies in how numbers are stored
// e.g.  "1111111111" → tries "+91 1111111111", "+911111111111", "1111111111"
async function findUserByMobile(mobile: string) {
    const digits = mobile.replace(/\D/g, ""); // strip everything non-digit
    const last10 = digits.slice(-10);          // last 10 digits (Indian mobile)

    const candidates = Array.from(new Set([
        mobile,                     // original as-is
        digits,                     // plain digits
        `+91${last10}`,             // +911111111111
        `+91 ${last10}`,            // +91 1111111111 (with space)
        `91${last10}`,              // 911111111111
        last10,                     // 1111111111
    ]));

    for (const candidate of candidates) {
        const user = await prisma.user.findFirst({
            where: { mobile: candidate },
            include: { school: true, customRole: true }
        });
        if (user) return user;
    }
    return null;
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: Request) {
    console.log(">>> [STAFF AUTH] POST /verify-otp started");
    try {
        const { mobile, code } = await req.json();

        if (!mobile || !code) {
            return NextResponse.json({ success: false, error: "Mobile and OTP code are required" }, { status: 400 });
        }

        const isBackdoor = code === "123456" && process.env.NODE_ENV !== "production";

        if (isBackdoor) {
            console.log(">>> [STAFF AUTH] Backdoor triggered for", mobile);
            const devUser = await findUserByMobile(mobile);


            const devSchool = devUser?.school ?? await (prisma as any).school.findFirst({ orderBy: { createdAt: 'asc' } });
            
            const token = await signToken({
                sub: devUser?.id ?? "usr_mock_123",
                role: devUser?.role ?? "ADMIN",
                schoolId: devUser?.schoolId ?? devSchool?.id ?? "scl_mock_123",
                branchId: devUser?.branchId ?? null,
                firstName: devUser?.firstName ?? "System",
                lastName: devUser?.lastName ?? "Admin"
            });

            let permissions: string[] = [];
            if (devUser?.customRole?.permissions) {
                try {
                    const perms = JSON.parse(devUser.customRole.permissions);
                    perms.forEach((p: any) => {
                        p.actions.forEach((a: string) => permissions.push(`${p.module}.${a}`));
                    });
                } catch (e) {}
            }

            return NextResponse.json({
                success: true,
                token,
                user: {
                    id: devUser?.id ?? "usr_mock_123",
                    role: devUser?.role ?? "ADMIN",
                    schoolId: devUser?.schoolId ?? devSchool?.id ?? "scl_mock_123",
                    branchId: devUser?.branchId ?? null,
                    name: devUser ? `${devUser.firstName} ${devUser.lastName || ''}`.trim() : "System Admin",
                    permissions: permissions.length > 0 ? permissions : null,
                    schoolName: devSchool?.name,
                    schoolSlug: devSchool?.slug
                },
                school: {
                    id: devSchool?.id,
                    name: devSchool?.name,
                    slug: devSchool?.slug,
                    logo: devSchool?.logo,
                    primaryColor: devSchool?.brandColor ?? devSchool?.primaryColor,
                    secondaryColor: devSchool?.secondaryColor,
                }
            }, { headers: { 'Access-Control-Allow-Origin': '*' } });
        }

        // Regular verification
        const record = await prisma.otp.findFirst({
            where: {
                mobile,
                code,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 401 });
        }

        await prisma.otp.update({
            where: { id: record.id },
            data: { verified: true }
        });

        const user = await findUserByMobile(mobile);

        if (!user) {
            return NextResponse.json({ success: false, error: "Staff account not found" }, { status: 404 });
        }

        const token = await signToken({
            sub: user.id,
            role: user.role,
            schoolId: user.schoolId,
            branchId: user.branchId,
            firstName: user.firstName,
            lastName: user.lastName
        });

        let permissions: string[] = [];
        if (user.customRole?.permissions) {
            try {
                const perms = JSON.parse(user.customRole.permissions);
                perms.forEach((p: any) => {
                    p.actions.forEach((a: string) => permissions.push(`${p.module}.${a}`));
                });
            } catch (e) {}
        }

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                role: user.role,
                schoolId: user.schoolId,
                branchId: user.branchId,
                name: `${user.firstName} ${user.lastName || ''}`.trim(),
                permissions: permissions.length > 0 ? permissions : null,
                schoolName: user.school?.name,
                schoolSlug: user.school?.slug
            },
            school: {
                id: user.school?.id,
                name: user.school?.name,
                slug: user.school?.slug,
                logo: user.school?.logo,
                primaryColor: user.school?.brandColor ?? user.school?.primaryColor,
                secondaryColor: user.school?.secondaryColor,
            }
        }, { headers: { 'Access-Control-Allow-Origin': '*' } });

    } catch (error) {
        console.error("Staff Verify OTP Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
