import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mobile, code } = body;

        if (!mobile || !code) {
            return NextResponse.json({ success: false, error: "Mobile and OTP code are required" }, { status: 400 });
        }

        // 1. Verify OTP natively
        const isBackdoor = code === "123456" && process.env.NODE_ENV !== "production";

        if (isBackdoor) {
            // Dev backdoor: fetch the real school for proper branding data
            const devUser = await prisma.user.findFirst({
                where: { mobile },
                include: { school: true }
            });
            const devSchool = devUser?.school ?? await (prisma as any).school.findFirst({ orderBy: { createdAt: 'asc' } });

            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");
            const token = await new SignJWT({
                sub: devUser?.id ?? "usr_mock_123",
                role: devUser?.role ?? "ADMIN",
                schoolId: devUser?.schoolId ?? devSchool?.id ?? "scl_mock_123",
                firstName: devUser?.firstName ?? "System",
                lastName: devUser?.lastName ?? "Admin"
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('30d')
                .sign(secret);

            return NextResponse.json({
                success: true,
                token,
                user: {
                    id: devUser?.id ?? "usr_mock_123",
                    role: devUser?.role ?? "ADMIN",
                    schoolId: devUser?.schoolId ?? devSchool?.id ?? "scl_mock_123",
                    name: devUser ? `${devUser.firstName} ${devUser.lastName || ''}`.trim() : "System Admin",
                    photo: devUser?.avatar ?? null,
                    schoolName: devSchool?.name ?? "Test School",
                    schoolSlug: devSchool?.slug ?? "test-school"
                },
                school: {
                    id: devSchool?.id ?? null,
                    name: devSchool?.name ?? "Test School",
                    slug: devSchool?.slug ?? "test-school",
                    logo: devSchool?.logo ?? null,
                    primaryColor: devSchool?.brandColor ?? devSchool?.primaryColor ?? null,
                    secondaryColor: devSchool?.secondaryColor ?? null,
                }
            });
        }

        const record = await prisma.otp.findFirst({
            where: {
                mobile: mobile,
                code: code,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 401 });
        }

        // Mark as verified
        await prisma.otp.update({
            where: { id: record.id },
            data: { verified: true }
        });

        // 2. Lookup the User
        const user = await prisma.user.findUnique({
            where: { mobile },
            include: { school: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "Staff account not found" }, { status: 404 });
        }

        if (user.role !== "ADMIN" && user.role !== "STAFF") {
            return NextResponse.json({ success: false, error: "Unauthorized. App is for school staff only." }, { status: 403 });
        }


        // 3. Generate JWT Token
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-123");

        const token = await new SignJWT({
            sub: user.id,
            role: user.role,
            schoolId: user.schoolId,
            branchId: user.branchId,
            firstName: user.firstName,
            lastName: user.lastName
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d') // Sessions last 30 days on mobile
            .sign(secret);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                role: user.role,
                schoolId: user.schoolId,
                name: `${user.firstName} ${user.lastName || ''}`.trim(),
                photo: user.avatar ?? null,
                schoolName: user.school?.name,
                schoolSlug: user.school?.slug
            },
            // Full school branding — consumed by the Flutter app's SchoolBrandNotifier
            school: {
                id: user.school?.id,
                name: user.school?.name,
                slug: user.school?.slug,
                logo: user.school?.logo ?? null,
                primaryColor: user.school?.brandColor ?? user.school?.primaryColor ?? null,
                secondaryColor: user.school?.secondaryColor ?? null,
            }
        });

    } catch (error: any) {
        console.error("Staff Mobile Verify OTP Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
