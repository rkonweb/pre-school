import { NextRequest, NextResponse } from 'next/server';
import { processPendingNotificationsAction } from '@/app/actions/notification-actions';

// This endpoint should be called by a cron job every minute
// Example: Vercel Cron, GitHub Actions, or external cron service
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Process pending notifications
        const result = await processPendingNotificationsAction();

        if (result.success) {
            return NextResponse.json({
                success: true,
                processed: result.data?.processed || 0,
                timestamp: new Date().toISOString(),
            });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
