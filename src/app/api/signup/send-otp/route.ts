import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { mobile, phoneCode = '+91' } = await req.json();

        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
        }

        // Delete any existing OTPs for this mobile
        await prisma.otp.deleteMany({ where: { mobile } });

        // Hardcoded OTP for testing — change to random in production
        const code = '123456';
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.otp.create({
            data: { mobile, code, expiresAt }
        });

        // TODO: Send SMS via Twilio/MSG91/2Factor
        // In dev mode, log the OTP to console
        console.log(`[SIGNUP OTP] Mobile: ${phoneCode}${mobile}  Code: ${code}`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            // Remove 'dev_otp' in production
            ...(process.env.NODE_ENV === 'development' && { dev_otp: code })
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
