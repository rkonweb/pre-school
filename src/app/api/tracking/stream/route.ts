import { NextRequest } from "next/server";
import { getFleetStatusAction } from "@/app/actions/tracking-actions";

/**
 * Server-Sent Events (SSE) endpoint for real-time fleet tracking updates
 * 
 * Usage:
 * const eventSource = new EventSource('/api/tracking/stream?schoolSlug=test');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   // Update UI with new fleet status
 * };
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const schoolSlug = searchParams.get('schoolSlug');

    if (!schoolSlug) {
        return new Response('Missing schoolSlug parameter', { status: 400 });
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial data
            const sendUpdate = async () => {
                try {
                    const result = await getFleetStatusAction(schoolSlug);

                    if (result.success && result.data) {
                        const data = `data: ${JSON.stringify(result.data)}\n\n`;
                        controller.enqueue(encoder.encode(data));
                    }
                } catch (error) {
                    console.error('SSE Error:', error);
                }
            };

            // Send initial update
            await sendUpdate();

            // Send updates every 5 seconds
            const interval = setInterval(async () => {
                await sendUpdate();
            }, 5000);

            // Cleanup on connection close
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
