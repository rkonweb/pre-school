import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        console.log("[BIOMETRIC_PUSH] Received:", body);

        // Extract SN from query params
        const url = new URL(req.url);
        const deviceSn = url.searchParams.get("sn");

        if (!deviceSn) {
            console.error("[BIOMETRIC_PUSH] No Serial Number provided");
            return new NextResponse("ERROR: NO_SN", { status: 400 });
        }

        // Find school that has this device SN in their logs or mapping
        // For now, we'll try to find any log with this SN to find the school, 
        // OR better: schools should have a dedicated device mapping.
        // For MVP: Search BiometricLog for this SN to get schoolId, or default to a lookup.
        const existingLog = await prisma.biometricLog.findFirst({
            where: { deviceId: deviceSn },
            select: { schoolId: true }
        });

        const schoolId = existingLog?.schoolId;

        if (!schoolId) {
            console.error("[BIOMETRIC_PUSH] Device not associated with any school:", deviceSn);
            // In a real system, we'd have a 'Devices' table. For now, we'll just log it.
            return new NextResponse("OK", { status: 200 });
        }

        // ADMS format parsing (Example)
        // Usually it's multiple lines of "USERID=...&TIME=...&STATUS=..."
        const lines = body.split("\n").filter(l => l.trim().length > 0);

        for (const line of lines) {
            const params = new URLSearchParams(line);
            const deviceUserId = params.get("USERID");
            const timeStr = params.get("TIME");
            const status = parseInt(params.get("STATUS") || "0");

            if (deviceUserId && timeStr) {
                await prisma.biometricLog.create({
                    data: {
                        deviceId: deviceSn,
                        deviceUserId: deviceUserId,
                        timestamp: new Date(timeStr),
                        status: status,
                        schoolId: schoolId,
                        raw: line
                    }
                });
            }
        }

        return new NextResponse("OK", { status: 200 });

    } catch (e) {
        console.error("[BIOMETRIC_PUSH] Error:", e);
        return new NextResponse("ERROR", { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return new NextResponse("OK", { status: 200 });
}
