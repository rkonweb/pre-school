import { NextRequest, NextResponse } from "next/server";
import { updateVehicleTelemetryAction } from "@/app/actions/tracking-actions";

/**
 * POST /api/tracking/[vehicleId]
 * 
 * Endpoint for GPS devices or driver apps to send location updates
 * 
 * Body:
 * {
 *   "latitude": number,
 *   "longitude": number,
 *   "speed": number (optional),
 *   "heading": number (optional),
 *   "status": "MOVING" | "STOPPED" | "IDLE" (optional),
 *   "delayMinutes": number (optional)
 * }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { vehicleId: string } }
) {
    try {
        const body = await request.json();
        const { vehicleId } = params;

        // Validate required fields
        if (!body.latitude || !body.longitude) {
            return NextResponse.json(
                { success: false, error: "Latitude and longitude are required" },
                { status: 400 }
            );
        }

        // Validate latitude/longitude ranges
        if (body.latitude < -90 || body.latitude > 90) {
            return NextResponse.json(
                { success: false, error: "Invalid latitude" },
                { status: 400 }
            );
        }

        if (body.longitude < -180 || body.longitude > 180) {
            return NextResponse.json(
                { success: false, error: "Invalid longitude" },
                { status: 400 }
            );
        }

        // Update telemetry
        const result = await updateVehicleTelemetryAction(vehicleId, {
            latitude: body.latitude,
            longitude: body.longitude,
            speed: body.speed,
            heading: body.heading,
            status: body.status,
            delayMinutes: body.delayMinutes
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Telemetry updated successfully",
            data: result.data
        });

    } catch (error: any) {
        console.error("GPS Update Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tracking/[vehicleId]
 * 
 * Get latest telemetry for a vehicle
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { vehicleId: string } }
) {
    try {
        const { vehicleId } = params;
        const { getVehicleTelemetryAction } = await import("@/app/actions/tracking-actions");

        const result = await getVehicleTelemetryAction(vehicleId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error: any) {
        console.error("Telemetry Fetch Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
