import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileAuth } from "@/lib/auth-mobile";

// Normalize phone: strip +91, spaces, dashes
function normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');
}

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

        // Security Check — match phone with or without country code
        const rawPhone = phone;
        const cleanPhone = normalizePhone(phone);
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { fatherPhone: rawPhone }, { motherPhone: rawPhone }, { parentMobile: rawPhone },
                    { fatherPhone: cleanPhone }, { motherPhone: cleanPhone }, { parentMobile: cleanPhone },
                    { fatherPhone: { contains: cleanPhone } }, { motherPhone: { contains: cleanPhone } }, { parentMobile: { contains: cleanPhone } },
                ]
            },
            include: {
                school: { select: { id: true, name: true } },
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

        // No transport profile at all — never applied
        if (!profile) {
            // Fetch available routes so parent can see options
            const routes = await prisma.transportRoute.findMany({
                where: { schoolId: student.school.id },
                include: { stops: { orderBy: { sequenceOrder: 'asc' } } },
                orderBy: { name: 'asc' }
            });

            return NextResponse.json({
                success: true,
                isActive: false,
                applicationStatus: 'NOT_APPLIED',
                message: "Your child is not enrolled in transport yet. Apply below!",
                availableRoutes: routes.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    stops: r.stops.map(s => ({
                        id: s.id,
                        name: s.name,
                        pickupTime: s.pickupTime,
                        dropTime: s.dropTime,
                        monthlyFee: s.monthlyFee,
                        lat: s.latitude,
                        lng: s.longitude,
                    }))
                }))
            });
        }

        // Has profile but not active/approved — pending or rejected
        if (profile.status !== 'ACTIVE' && profile.status !== 'APPROVED') {
            return NextResponse.json({
                success: true,
                isActive: false,
                applicationStatus: profile.status, // PENDING, REJECTED, INACTIVE
                applicationAddress: profile.applicationAddress,
                rejectionReason: profile.rejectionReason,
                message: profile.status === 'PENDING'
                    ? "Your transport application is under review."
                    : profile.status === 'REJECTED'
                        ? "Your transport application was not approved."
                        : "Transport is currently inactive."
            });
        }

        // Active/Approved — return full tracking data
        const hour = new Date().getHours();
        const tripType = hour < 12 ? "PICKUP" : "DROP";

        const vehicleId = tripType === "PICKUP" ? profile.route?.pickupVehicleId : profile.route?.dropVehicleId;

        if (!vehicleId) {
            return NextResponse.json({ success: true, isActive: false, applicationStatus: 'APPROVED', message: "No vehicle assigned for current trip" });
        }

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

        // Fetch all stops on the route for map display
        const routeStops = profile.route ? await prisma.transportStop.findMany({
            where: { routeId: profile.route.id },
            select: {
                id: true,
                name: true,
                sequenceOrder: true,
                latitude: true,
                longitude: true,
                pickupTime: true,
                dropTime: true,
            },
            orderBy: { sequenceOrder: 'asc' }
        }) : [];

        return NextResponse.json({
            success: true,
            isActive: true,
            applicationStatus: profile.status,
            tripType,
            route: profile.route ? { id: profile.route.id, name: profile.route.name } : null,
            vehicle: vehicle ? { registrationNumber: vehicle.registrationNumber, capacity: vehicle.capacity } : null,
            driver: driver ? { name: driver.name, phone: driver.phone } : null,
            studentStops: {
                pickup: profile.pickupStop ? {
                    id: profile.pickupStop.id,
                    name: profile.pickupStop.name,
                    time: profile.pickupStop.pickupTime,
                    lat: profile.pickupStop.latitude,
                    lng: profile.pickupStop.longitude
                } : null,
                drop: profile.dropStop ? {
                    id: profile.dropStop.id,
                    name: profile.dropStop.name,
                    time: profile.dropStop.dropTime,
                    lat: profile.dropStop.latitude,
                    lng: profile.dropStop.longitude
                } : null
            },
            routeStops: routeStops.map(s => ({
                id: s.id,
                name: s.name,
                order: s.sequenceOrder,
                lat: s.latitude,
                lng: s.longitude,
                pickupTime: s.pickupTime,
                dropTime: s.dropTime,
            })),
            liveTelemetry: telemetry ? {
                lat: telemetry.latitude,
                lng: telemetry.longitude,
                speed: telemetry.speed,
                heading: telemetry.heading,
                status: telemetry.status,
                lastUpdated: telemetry.recordedAt.toISOString()
            } : null
        });

    } catch (error: any) {
        console.error("Transport API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// POST — Parent applies for transport
export async function POST(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        if (!phone) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { studentId, address, lat, lng, preferredRouteId, preferredStopId } = body;

        if (!studentId) {
            return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 });
        }
        if (!address) {
            return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 });
        }

        // Security Check — parent owns this student
        const rawPhone = phone;
        const cleanPhone = normalizePhone(phone);
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { fatherPhone: rawPhone }, { motherPhone: rawPhone }, { parentMobile: rawPhone },
                    { fatherPhone: cleanPhone }, { motherPhone: cleanPhone }, { parentMobile: cleanPhone },
                    { fatherPhone: { contains: cleanPhone } }, { motherPhone: { contains: cleanPhone } }, { parentMobile: { contains: cleanPhone } },
                ]
            }
        });

        if (!student) {
            return NextResponse.json({ success: false, error: "Unauthorized access to student" }, { status: 403 });
        }

        // Check for existing profile
        const existing = await prisma.studentTransportProfile.findUnique({
            where: { studentId }
        });

        if (existing) {
            // Update existing application
            await prisma.studentTransportProfile.update({
                where: { studentId },
                data: {
                    status: "PENDING",
                    applicationAddress: address,
                    applicationLat: lat ? parseFloat(lat) : null,
                    applicationLng: lng ? parseFloat(lng) : null,
                    // Clear previous assignments on reapply
                    routeId: preferredRouteId || null,
                    pickupStopId: preferredStopId || null,
                    dropStopId: preferredStopId || null,
                    rejectionReason: null,
                }
            });
        } else {
            // Create new application
            await prisma.studentTransportProfile.create({
                data: {
                    studentId,
                    status: "PENDING",
                    applicationAddress: address,
                    applicationLat: lat ? parseFloat(lat) : null,
                    applicationLng: lng ? parseFloat(lng) : null,
                    routeId: preferredRouteId || null,
                    pickupStopId: preferredStopId || null,
                    dropStopId: preferredStopId || null,
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Transport application submitted successfully! The school will review your request."
        });

    } catch (error: any) {
        console.error("Transport Apply Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
