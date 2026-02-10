"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserAction } from "./session-actions";

/**
 * Verify if user has permission to access transport tracking
 */
async function verifyTransportPermission(schoolSlug: string, requiredAction: "view" | "manage" = "view") {
    const currentUserRes = await getCurrentUserAction();
    if (!currentUserRes.success || !currentUserRes.data) {
        return { authorized: false, error: "Not authenticated" };
    }

    const user = currentUserRes.data;

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
                    select: {
                        id: true,
                        name: true,
                        driver: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                telemetry: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1
                }
            }
        });

        const fleetStatus = vehicles.map(vehicle => {
            const latestTelemetry = vehicle.telemetry[0];
            const route = vehicle.pickupRoutes[0];

            return {
                id: vehicle.id,
                registrationNumber: vehicle.registrationNumber,
                model: vehicle.model,
                status: vehicle.status,
                routeName: route?.name || null,
                driverName: route?.driver?.name || null,
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
                            orderBy: { sequence: 'asc' }
                        },
                        driver: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                },
                telemetry: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10 // Last 10 locations for trail
                }
            }
        });

        if (!vehicle) {
            return { success: false, error: "Vehicle not found" };
        }

        const route = vehicle.pickupRoutes[0];

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
                    stops: route.stops.map(stop => ({
                        id: stop.id,
                        name: stop.name,
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        sequence: stop.sequence
                    })),
                    driver: route.driver
                } : null,
                telemetry: vehicle.telemetry.map(t => ({
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
            include: { school: { select: { slug: true } } }
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
    vehicleId: string,
    startDate: Date,
    endDate: Date
) {
    try {
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
