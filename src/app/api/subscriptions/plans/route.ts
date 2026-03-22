import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subscriptions/plans — returns all active subscription plans
export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true, price: true, tier: true, slug: true }
        });
        return NextResponse.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}
