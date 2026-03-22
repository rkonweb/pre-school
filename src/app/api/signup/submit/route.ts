import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            phoneCode, mobile, email, firstName, lastName, designation,
            schoolName, schoolTagline, schoolType, schoolCategory, board,
            schoolSize, city, state, pincode, yearEstd,
            website, schoolPhone, schoolAbout, features, referralSource
        } = body;

        // Validate that OTP was verified for this mobile
        const otpRecord = await prisma.otp.findFirst({
            where: { mobile, verified: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return NextResponse.json({ error: 'Mobile number not verified. Please complete OTP verification.' }, { status: 400 });
        }

        // Check for duplicate application from same mobile
        const existing = await prisma.schoolApplication.findFirst({
            where: { mobile, status: 'PENDING' }
        });

        if (existing) {
            return NextResponse.json({
                error: 'An application from this mobile is already pending review.',
                applicationId: existing.id
            }, { status: 409 });
        }

        const application = await prisma.schoolApplication.create({
            data: {
                phoneCode: phoneCode || '+91',
                mobile,
                email,
                firstName,
                lastName,
                designation,
                schoolName,
                schoolTagline: schoolTagline || null,
                schoolType,
                schoolCategory,
                board,
                schoolSize,
                city,
                state,
                pincode,
                yearEstd,
                website: website || null,
                schoolPhone: schoolPhone || null,
                schoolAbout,
                features: JSON.stringify(features || []),
                referralSource: referralSource || null,
                status: 'PENDING'
            }
        });

        console.log(`[SIGNUP] New school application: ${schoolName} by ${firstName} ${lastName} (${mobile})`);

        return NextResponse.json({
            success: true,
            applicationId: application.id,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Submit application error:', error);
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Super admin endpoint to list applications
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const applications = await prisma.schoolApplication.findMany({
        where: status !== 'ALL' ? { status } : {},
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ applications });
}
