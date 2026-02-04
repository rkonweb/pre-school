import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text(); // ZKTeco often pushes raw text or form-data
        console.log("[BIOMETRIC_PUSH] Received:", body);

        // Basic parsing for ADMS format (example: "cdata?SN=...&table=ATTLOG&...")
        // In a real implementation, we would parse the specific ZKTeco/hikvision format
        // For this MVP, we'll assume a JSON push or basic text parsing

        let logs = [];
        try {
            logs = JSON.parse(body);
        } catch (e) {
            // Fallback for text format if needed, but for now we expect a JSON wrapper or will log raw
            console.log("[BIOMETRIC_PUSH] Not JSON, processing as raw text");
        }

        // TODO: Extract Serial Number (SN) to identify the school/device
        // For MVP, we will extract from a query param or header if available
        const url = new URL(req.url);
        const deviceSn = url.searchParams.get("sn") || "UNKNOWN_DEVICE";

        // Find school by device mapping (skipping for now, assuming deviceId is enough)

        // Simulating log storage
        const timestamp = new Date();

        // Return protocol success code (often "OK" or "cdata=OK")
        return new NextResponse("OK", { status: 200 });

    } catch (e) {
        console.error("[BIOMETRIC_PUSH] Error:", e);
        return new NextResponse("ERROR", { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // ZKTeco devices often "ping" the server with a GET request to check connectivity
    return new NextResponse("OK", { status: 200 });
}
