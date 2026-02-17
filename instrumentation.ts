export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const fs = await import('fs');
        const path = await import('path');
        const logPath = path.join(process.cwd(), 'logs', 'automation.log');

        const log = (msg: string) => {
            const entry = `${new Date().toISOString()} - ${msg}\n`;
            try {
                fs.appendFileSync(logPath, entry);
            } catch (e) {
                console.error(e);
            }
        };

        log("Background instrumentation worker registered.");

        // Simple Background Pinger
        // Runs every 1 minute for faster debugging in local environment
        const INTERVAL_MS = 1 * 60 * 1000;

        setInterval(async () => {
            try {
                log("Starting scheduled check...");
                const { triggerServerAutoBlogAction } = await import('@/app/actions/blog-automation-actions');
                const result = await triggerServerAutoBlogAction();

                if (result.success && result.post) {
                    log(`Success: New post generated - "${result.post.title}"`);
                } else if (result.success) {
                    log("Check completed: No post due.");
                } else {
                    log(`Check skipped: ${result.error}`);
                }
            } catch (error: any) {
                log(`Worker error: ${error.message}`);
                console.error("[Blog AI Server] Worker error:", error);
            }
        }, INTERVAL_MS);
    }
}
