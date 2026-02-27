"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

/**
 * Verify if user has permission to access transport tracking
 */
async function verifyTransportPermission(schoolSlug: string, requiredAction: "view" | "manage" = "view") {
    const auth = await validateUserSchoolAction(schoolSlug);
    if (!auth.success || !auth.user) {
        return { authorized: false, error: auth.error || "Not authenticated" };
    }

    const user = auth.user;

    // SUPER_ADMIN and ADMIN have full access
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        return { authorized: true };
    }

    // Check custom role permissions
    const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { customRole: true } as any
    });

    if (!userWithRole) {
        return { authorized: false, error: "User not found" };
    }

    let permissions: any[] = [];
    try {
        permissions = typeof (userWithRole as any).customRole?.permissions === 'string'
            ? JSON.parse((userWithRole as any).customRole.permissions)
            : (userWithRole as any).customRole?.permissions || [];
    } catch (e) {
        return { authorized: false, error: "Invalid permissions" };
    }

    const transportPerm = permissions.find(p => p.module === "transport");

    if (!transportPerm) {
        return { authorized: false, error: "No transport permissions" };
    }

    const hasRequiredPermission = transportPerm.actions.includes(requiredAction) ||
        transportPerm.actions.includes("manage");

    if (!hasRequiredPermission) {
        return { authorized: false, error: `Missing ${requiredAction} permission` };
    }

    return { authorized: true };
}

/**
 * Calculate distance between two coordinates in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get AI insights for a list of vehicles
 */
async function getAIInsights(vehicles: any[]) {
    return vehicles.map(vehicle => {
        const telemetry = vehicle.VehicleTelemetry?.[0];
        const route = vehicle.pickupRoutes?.[0] || vehicle.dropRoutes?.[0];
        const insights: string[] = [];

        if (telemetry) {
            // 1. Detect Idling
            if (telemetry.status === "IDLE" && telemetry.speed === 0) {
                const idleTime = (new Date().getTime() - new Date(telemetry.recordedAt).getTime()) / (1000 * 60);
                if (idleTime > 5) insights.push(`Unusual Idling (${Math.floor(idleTime)}m)`);
            }

            // 2. Detect Route Deviation
            const route = vehicle.pickupRoutes?.[0] || vehicle.dropRoutes?.[0];
            if (route?.stops?.length > 0) {
                // Find nearest stop
                let minDistance = Infinity;
                route.stops.forEach((stop: any) => {
                    const dist = calculateDistance(telemetry.latitude, telemetry.longitude, stop.latitude, stop.longitude);
                    if (dist < minDistance) minDistance = dist;
                });

                // If further than 500m from ANY stop, flag deviation (rough heuristic)
                if (minDistance > 500 && telemetry.speed > 5) {
                    insights.push("Possible Route Deviation");
                }
            }

            // 3. Speeding
            if (telemetry.speed && telemetry.speed > 50) {
                insights.push("High Speed Alert");
            }
        }

        return {
            vehicleId: vehicle.id,
            insights
        };
    });
}

/**
 * Get all vehicles with their latest telemetry for the fleet tracker table
 */
export async function getFleetStatusAction(schoolSlug: string) {
    try {
        // Verify permission
        const permCheck = await verifyTransportPermission(schoolSlug, "view");
        if (!permCheck.authorized) {
            return { success: false, error: permCheck.error || "Unauthorized" };
        }

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) {
            return { success: false, error: "School not found" };
        }

        const vehicles = await prisma.transportVehicle.findMany({
            where: { schoolId: school.id },
            include: {
                pickupRoutes: {
                    take: 1,
                    include: {
                        driver: { select: { name: true } },
                        stops: { select: { latitude: true, longitude: true } }
                    }
                },
                dropRoutes: {
                    take: 1,
                    include: {
                        driver: { select: { name: true } },
                        stops: { select: { latitude: true, longitude: true } }
                    }
                },
                VehicleTelemetry: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1
                }
            }
        });

        const insights = await getAIInsights(vehicles);

        const fleetStatus = vehicles.map((vehicle: any) => {
            const latestTelemetry = vehicle.VehicleTelemetry?.[0];
            const route = vehicle.pickupRoutes?.[0] || vehicle.dropRoutes?.[0];
            const vehicleInsights = insights.find(i => i.vehicleId === vehicle.id)?.insights || [];

            return {
                id: vehicle.id,
                registrationNumber: vehicle.registrationNumber,
                model: vehicle.model,
                status: vehicle.status,
                routeName: route?.name || null,
                driverName: route?.driver?.name || null,
                aiInsights: vehicleInsights,
                telemetry: latestTelemetry ? {
                    latitude: latestTelemetry.latitude,
                    longitude: latestTelemetry.longitude,
                    speed: latestTelemetry.speed,
                    heading: latestTelemetry.heading,
                    status: latestTelemetry.status,
                    delayMinutes: latestTelemetry.delayMinutes,
                    recordedAt: latestTelemetry.recordedAt
                } : null
            };
        });

        return { success: true, data: fleetStatus };
    } catch (error: any) {
        console.error("Error fetching fleet status:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get detailed telemetry for a specific vehicle (for map modal)
 */
export async function getVehicleTelemetryAction(vehicleId: string) {
    try {
        // Get vehicle to check school
        const vehicleCheck = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId },
            include: { school: { select: { slug: true } } }
        });

        if (!vehicleCheck) {
            return { success: false, error: "Vehicle not found" };
        }

        // Verify permission
        const permCheck = await verifyTransportPermission(vehicleCheck.school.slug, "view");
        if (!permCheck.authorized) {
            return { success: false, error: permCheck.error || "Unauthorized" };
        }

        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId },
            include: {
                pickupRoutes: {
                    include: {
                        stops: {
                            orderBy: { sequenceOrder: 'asc' }
                        },
                        driver: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                },
                dropRoutes: {
                    include: {
                        stops: {
                            orderBy: { sequenceOrder: 'asc' }
                        },
                        driver: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                },
                VehicleTelemetry: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10 // Last 10 locations for trail
                }
            }
        });

        if (!vehicle) {
            return { success: false, error: "Vehicle not found" };
        }

        const route = (vehicle as any).pickupRoutes?.[0] || (vehicle as any).dropRoutes?.[0];

        return {
            success: true,
            data: {
                vehicle: {
                    id: vehicle.id,
                    registrationNumber: vehicle.registrationNumber,
                    model: vehicle.model,
                    status: vehicle.status
                },
                route: route ? {
                    id: route.id,
                    name: route.name,
                    stops: (route.stops || []).map((stop: any) => ({
                        id: stop.id,
                        name: stop.name,
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        sequence: stop.sequenceOrder
                    })),
                    driver: route.driver
                } : null,
                telemetry: (vehicle as any).VehicleTelemetry.map((t: any) => ({
                    latitude: t.latitude,
                    longitude: t.longitude,
                    speed: t.speed,
                    heading: t.heading,
                    status: t.status,
                    delayMinutes: t.delayMinutes,
                    recordedAt: t.recordedAt
                }))
            }
        };
    } catch (error: any) {
        console.error("Error fetching vehicle telemetry:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check and trigger proactive alerts based on telemetry
 */
async function triggerProactiveAlerts(vehicleId: string, telemetry: any, schoolId: string) {
    try {
        // 1. Get the route and its stops/students
        const route = await prisma.transportRoute.findFirst({
            where: {
                OR: [
                    { pickupVehicleId: vehicleId },
                    { dropVehicleId: vehicleId }
                ]
            },
            include: {
                stops: true,
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                parentMobile: true
                            }
                        }
                    }
                }
            }
        });

        if (!route) return;

        // 2. Check for Delay Alert
        if (telemetry.delayMinutes >= 5) {
            // Send delay notification to all parents on route
            const studentIds = route.students.map(s => s.student.id);
            // In a real app, we'd batch these. Here we'll create a single broadcast notification record
            await prisma.notification.createMany({
                data: route.students.map(s => ({
                    userId: s.student.id,
                    userType: "STUDENT",
                    title: "Transport Delay Alert",
                    message: `Vehicle ${telemetry.vehicleId} on route ${route.name} is delayed by ${telemetry.delayMinutes} minutes.`,
                    type: "TRANSPORT_DELAY",
                    relatedId: vehicleId,
                    relatedType: "TransportVehicle",
                    createdAt: new Date()
                }))
            });
        }

        // 3. Check for "Bus Nearby" alerts
        for (const stop of route.stops) {
            const dist = calculateDistance(telemetry.latitude, telemetry.longitude, stop.latitude!, stop.longitude!);
            if (dist < 500) { // Within 500m
                // Find students at this stop
                const studentsAtStop = route.students.filter(s => s.pickupStopId === stop.id || s.dropStopId === stop.id);

                if (studentsAtStop.length > 0) {
                    await prisma.notification.createMany({
                        data: studentsAtStop.map(s => ({
                            userId: s.student.id,
                            userType: "STUDENT",
                            title: "Bus Nearby",
                            message: `The bus is approaching ${stop.name}. Please be ready!`,
                            type: "TRANSPORT_NEARBY",
                            relatedId: stop.id,
                            relatedType: "TransportStop",
                            createdAt: new Date()
                        }))
                    });

                    // If Bus is Near Drop Stop (Home) - Send Pre-Arrival & Prepare for Safe Trip trigger
                    if (studentsAtStop.some(s => s.dropStopId === stop.id)) {
                        await prisma.notification.createMany({
                            data: studentsAtStop.filter(s => s.dropStopId === stop.id).map(s => ({
                                userId: s.student.id,
                                userType: "STUDENT",
                                title: "Arriving Home",
                                message: `The bus is arriving at ${stop.name}. Safe drop-off imminent.`,
                                type: "TRANSPORT_SAFE_TRIP",
                                relatedId: stop.id,
                                relatedType: "TransportStop",
                                createdAt: new Date()
                            }))
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.error("Alert Trigger Error:", e);
    }
}

/**
 * Update vehicle telemetry (called by GPS device or driver app)
 */
export async function updateVehicleTelemetryAction(
    vehicleId: string,
    data: {
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
        status?: string;
        delayMinutes?: number;
    }
) {
    try {
        // Get vehicle to check school
        const vehicleCheck = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId },
            include: { school: { select: { id: true, slug: true } } }
        });

        if (!vehicleCheck) {
            return { success: false, error: "Vehicle not found" };
        }

        // Verify permission (manage required for updates)
        const permCheck = await verifyTransportPermission(vehicleCheck.school.slug, "manage");
        if (!permCheck.authorized) {
            return { success: false, error: permCheck.error || "Unauthorized" };
        }

        const telemetry = await prisma.vehicleTelemetry.create({
            data: {
                id: `tel-${Date.now()}`,
                vehicleId,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                heading: data.heading,
                status: data.status || "MOVING",
                delayMinutes: data.delayMinutes || 0,
                recordedAt: new Date()
            }
        });

        // Trigger proactive alerts in background (non-blocking)
        triggerProactiveAlerts(vehicleId, telemetry, vehicleCheck.school.id);

        return { success: true, data: telemetry };
    } catch (error: any) {
        console.error("Error updating vehicle telemetry:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get telemetry history for a vehicle within a date range
 */
export async function getVehicleTelemetryHistoryAction(
    slug: string,
    vehicleId: string,
    startDate: Date,
    endDate: Date
) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const telemetry = await prisma.vehicleTelemetry.findMany({
            where: {
                vehicleId,
                recordedAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { recordedAt: 'asc' }
        });

        return { success: true, data: telemetry };
    } catch (error: any) {
        console.error("Error fetching telemetry history:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Log student boarding (IN/OUT/ABSENT)
 */
export async function logStudentBoardingAction(
    slug: string,
    data: {
        studentId: string;
        vehicleId: string;
        routeId: string;
        status: "IN" | "OUT" | "ABSENT";
        type: "PICKUP" | "DROP";
        notes?: string;
        recordedBy?: string;
    }
) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const log = await prisma.transportBoardingLog.create({
            data: {
                studentId: data.studentId,
                vehicleId: data.vehicleId,
                routeId: data.routeId,
                status: data.status,
                type: data.type,
                notes: data.notes,
                recordedBy: data.recordedBy
            },
            include: {
                student: { select: { firstName: true, lastName: true } },
                route: { select: { name: true } }
            }
        });

        // Trigger parent notifications based on status
        let message = "";
        let title = "";

        const studentName = `${log.student.firstName} ${log.student.lastName}`;

        if (data.status === "IN") {
            title = "Student Boarded Bus";
            message = `${studentName} has boarded the bus for the ${data.type.toLowerCase()} route (${log.route.name}).`;
        } else if (data.status === "OUT") {
            title = "Student Dropped Off";
            message = `${studentName} has been dropped off from the ${data.type.toLowerCase()} route (${log.route.name}).`;
        } else if (data.status === "ABSENT") {
            title = "Student Missed Bus";
            message = `${studentName} was marked absent for the ${data.type.toLowerCase()} route (${log.route.name}).`;
        }

        if (title && message) {
            await prisma.notification.create({
                data: {
                    userId: log.studentId, // Parent would theoretically be linked, targeting student for now as proxy
                    userType: "STUDENT",   // Adjust if PARENT role exists
                    title,
                    message,
                    type: "TRANSPORT_BOARDING_ALERT",
                    relatedId: log.id,
                    relatedType: "TransportBoardingLog"
                }
            });
        }

        return { success: true, data: log };
    } catch (error: any) {
        console.error("Error logging student boarding:", error);
        return { success: false, error: error.message };
    }
}
