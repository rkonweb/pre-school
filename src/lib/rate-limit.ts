import { headers } from "next/headers";

type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const globalRateLimits = new Map<string, RateLimitStore>();

/**
 * Basic In-Memory Rate Limiter (Token Bucket / Fixed Window)
 * NOTE: In a serverless/cluster environment (like Vercel), this memory is NOT shared across instances.
 * For production, use Redis (Vercel KV or Upstash).
 * 
 * @param key - Unique identifier (e.g., "otp:1234567890" or "ip:1.2.3.4")
 * @param items - Max items allowed
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(key: string, items: number, windowMs: number): Promise<{ success: boolean; reset: number }> {
    const now = Date.now();

    // Clean up old entries periodically or on access (lazy cleanup)
    // For simplicity, we just check the specific key here.

    // We use a global map to simulate persistence in a single-instance scenarios
    // In serverless, this will reset frequently, which is acceptable for "soft" limits.

    if (!globalRateLimits.has("default")) {
        globalRateLimits.set("default", new Map());
    }

    const store = globalRateLimits.get("default")!;
    const record = store.get(key) || { count: 0, lastReset: now };

    if (now - record.lastReset > windowMs) {
        // Reset window
        record.count = 0;
        record.lastReset = now;
    }

    if (record.count >= items) {
        return { success: false, reset: record.lastReset + windowMs };
    }

    record.count += 1;
    store.set(key, record);

    return { success: true, reset: record.lastReset + windowMs };
}

/**
 * Helper to get client IP for rate limiting
 */
export async function getClientIp() {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    return "127.0.0.1";
}
