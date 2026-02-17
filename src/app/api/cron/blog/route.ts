import { NextRequest, NextResponse } from 'next/server';
import { triggerServerAutoBlogAction } from '@/app/actions/blog-automation-actions';

// This endpoint is designed to be called by an external cron service (e.g., Vercel Cron)
// It performs a fully autonomous check of the schedule and generates a post if due.
export async function GET(request: NextRequest) {
    try {
        // Security: Verify cron secret
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.log("[Blog Cron API] Unauthorized attempt.");
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log("[Blog Cron API] Trigger received. Starting autonomous check...");
        const result = await triggerServerAutoBlogAction();

        if (result.success) {
            console.log("[Blog Cron API] Success: Post generated or window already handled.");
            return NextResponse.json({
                success: true,
                message: result.post ? 'Blog post generated!' : 'Check completed, no post due.',
                timestamp: new Date().toISOString(),
            });
        } else {
            console.log(`[Blog Cron API] Check skipped/failed: ${result.error}`);
            return NextResponse.json(
                { error: result.error },
                { status: 200 } // Status 200 because it's a valid skip logic
            );
        }
    } catch (error: any) {
        console.error('[Blog Cron API] Internal Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
