import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        if (!phone) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 });
        }

        // Security Check
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [{ fatherPhone: phone }, { motherPhone: phone }, { parentMobile: phone }]
            },
            include: {
                transportProfile: {
                    include: {
                        route: true,
                        pickupStop: true,
                        dropStop: true
                    }
                }
            }
        });

        if (!student) {
            return NextResponse.json({ success: false, error: "Unauthorized access to student" }, { status: 403 });
        }

        const profile = student.transportProfile;
        if (!profile || (profile.status !== 'ACTIVE' && profile.status !== 'APPROVED')) {
            return NextResponse.json({ success: true, isActive: false, message: "Transport not active for this student" });
        }

        // Determine if it's currently a Pickup or Drop window. 
        // Usually, before 12 PM is Pickup, after 12 PM is Drop.
        const hour = new Date().getHours();
        const tripType = hour < 12 ? "PICKUP" : "DROP";

        const vehicleId = tripType === "PICKUP" ? profile.route?.pickupVehicleId : profile.route?.dropVehicleId;

        if (!vehicleId) {
            return NextResponse.json({ success: true, isActive: false, message: "No vehicle assigned for current trip" });
        }

        // Fetch the vehicle and its latest telemetry
        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId }
        });

        const driver = profile.route?.driverId ? await prisma.transportDriver.findUnique({
            where: { id: profile.route.driverId }
        }) : null;

        const telemetry = await prisma.vehicleTelemetry.findFirst({
            where: { vehicleId },
            orderBy: { recordedAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            isActive: true,
            tripType,
            route: profile.route ? { id: profile.route.id, name: profile.route.name } : null,
            vehicle: vehicle ? { registrationNumber: vehicle.registrationNumber, capacity: vehicle.capacity } : null,
            driver: driver ? { name: driver.name, phone: driver.phone } : null,
            studentStops: {
                pickup: profile.pickupStop ? {
                    name: profile.pickupStop.name,
                    time: profile.pickupStop.pickupTime,
                    lat: profile.pickupStop.latitude,
                    lng: profile.pickupStop.longitude
                } : null,
                drop: profile.dropStop ? {
                    name: profile.dropStop.name,
                    time: profile.dropStop.dropTime,
                    lat: profile.dropStop.latitude,
                    lng: profile.dropStop.longitude
                } : null
            },
            liveTelemetry: telemetry ? {
                lat: telemetry.latitude,
                lng: telemetry.longitude,
                speed: telemetry.speed,
                status: telemetry.status,
                lastUpdated: telemetry.recordedAt.toISOString()
            } : null
        });

    } catch (error: any) {
        console.error("Transport API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
