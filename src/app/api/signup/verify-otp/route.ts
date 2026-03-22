import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { mobile, otp } = await req.json();

        if (!mobile || !otp) {
            return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 });
        }

        const record = await prisma.otp.findFirst({
            where: { mobile, code: otp, verified: false },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Mark as verified
        await prisma.otp.update({ where: { id: record.id }, data: { verified: true } });

        return NextResponse.json({ success: true, message: 'Mobile verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
