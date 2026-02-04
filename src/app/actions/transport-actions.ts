"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Vehicles ---

export async function getVehiclesAction(schoolSlug: string) {
    try {
        const vehicles = await prisma.transportVehicle.findMany({
            where: { school: { slug: schoolSlug } },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { routes: true, maintenanceLogs: true } } }
        });
        return { success: true, data: vehicles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createVehicleAction(data: any, schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        await prisma.transportVehicle.create({
            data: {
                registrationNumber: data.registrationNumber,
                model: data.model,
                capacity: parseInt(data.capacity),
                status: data.status,
                schoolId: school.id
            }
        });
        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateVehicleAction(id: string, data: any, schoolSlug: string) {
    try {
        await prisma.transportVehicle.update({
            where: { id },
            data: {
                registrationNumber: data.registrationNumber,
                model: data.model,
                capacity: parseInt(data.capacity),
                status: data.status,
            }
        });
        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVehicleAction(id: string, schoolSlug: string) {
    try {
        await prisma.transportVehicle.delete({ where: { id } });
        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Drivers ---

export async function getDriversAction(schoolSlug: string) {
    try {
        const drivers = await prisma.transportDriver.findMany({
            where: { school: { slug: schoolSlug } },
            include: { user: true },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: drivers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createDriverAction(data: any, schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        await prisma.transportDriver.create({
            data: {
                name: data.name,
                licenseNumber: data.licenseNumber,
                phone: data.phone,
                status: data.status || "ACTIVE",
                schoolId: school.id,
                userId: data.userId || null // Optional link to User
            }
        });
        revalidatePath(`/s/${schoolSlug}/transport/drivers`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Routes & Stops ---

export async function getRoutesAction(schoolSlug: string) {
    try {
        const routes = await prisma.transportRoute.findMany({
            where: { school: { slug: schoolSlug } },
            include: {
                vehicle: true,
                driver: true,
                _count: { select: { stops: true, students: true } }
            }
        });
        return { success: true, data: routes };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRouteDetailsAction(routeId: string) {
    try {
        const route = await prisma.transportRoute.findUnique({
            where: { id: routeId },
            include: {
                stops: { orderBy: { sequenceOrder: 'asc' } },
                vehicle: true,
                driver: true,
                students: { include: { student: true, pickupStop: true, dropStop: true } }
            }
        });
        return { success: true, data: route };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRouteAction(data: any, schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        const route = await prisma.transportRoute.create({
            data: {
                name: data.name,
                description: data.description,
                vehicleId: data.vehicleId || null,
                driverId: data.driverId || null,
                schoolId: school.id,
                stops: {
                    create: data.stops?.map((stop: any, index: number) => ({
                        name: stop.name,
                        pickupTime: stop.pickupTime,
                        dropTime: stop.dropTime,
                        sequenceOrder: index + 1,
                        latitude: stop.lat,
                        longitude: stop.lng
                    }))
                }
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/routes`);
        return { success: true, id: route.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Assignments ---

export async function searchStudentsForTransportAction(query: string, schoolSlug: string) {
    try {
        const students = await prisma.student.findMany({
            where: {
                school: { slug: schoolSlug },
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } }
                ]
            },
            include: {
                transportProfile: {
                    include: { route: true, pickupStop: true, dropStop: true }
                }
            },
            take: 20
        });
        return { success: true, data: students };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignStudentToRouteAction(studentId: string, routeId: string, pickupStopId: string, dropStopId: string, schoolSlug: string) {
    try {
        // Upsert profile
        await prisma.studentTransportProfile.upsert({
            where: { studentId },
            create: {
                studentId,
                routeId,
                pickupStopId,
                dropStopId
            },
            update: {
                routeId,
                pickupStopId,
                dropStopId
            }
        });
        revalidatePath(`/s/${schoolSlug}/transport/assignments`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeStudentFromTransportAction(studentId: string, schoolSlug: string) {
    try {
        await prisma.studentTransportProfile.delete({ where: { studentId } });
        revalidatePath(`/s/${schoolSlug}/transport/assignments`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Dashboard ---

export async function getTransportStatsAction(schoolSlug: string) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug }, select: { id: true } });
        if (!school) return { success: false };

        const [vehicles, drivers, routes, studentsOnTransport] = await Promise.all([
            prisma.transportVehicle.count({ where: { schoolId: school.id } }),
            prisma.transportDriver.count({ where: { schoolId: school.id } }),
            prisma.transportRoute.count({ where: { schoolId: school.id } }),
            prisma.studentTransportProfile.count({ where: { student: { schoolId: school.id } } }) // Ensure student belongs to school
        ]);

        return {
            success: true,
            data: {
                vehicles,
                drivers,
                routes,
                studentsOnTransport
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRouteAction(id: string, data: any, schoolSlug: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Update basic details
            await tx.transportRoute.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    vehicleId: data.vehicleId || null,
                    driverId: data.driverId || null,
                }
            });

            // Handle stops: Delete existing and recreate
            // We check assignments first to be safe, though cascade might handle it if configured
            // Ideally we should smart-merge, but full replace is simpler for now.
            // If students are assigned, we might block structural changes or require careful handling.
            // For now, let's just attempt to replace stops.

            // Clear old stops (this might fail if FK constraints exist and students are assigned to stops)
            // Strategy: Unlink students from stops? Or just Block update if assigned?
            // Let's block if assigned for safety in this version.
            const assignmentsCount = await tx.studentTransportProfile.count({ where: { routeId: id } });

            if (assignmentsCount === 0) {
                await tx.transportStop.deleteMany({ where: { routeId: id } });
                if (data.stops && data.stops.length > 0) {
                    await tx.transportStop.createMany({
                        data: data.stops.map((stop: any, index: number) => ({
                            routeId: id,
                            name: stop.name,
                            pickupTime: stop.pickupTime,
                            dropTime: stop.dropTime,
                            sequenceOrder: index + 1,
                            latitude: stop.lat,
                            longitude: stop.lng
                        }))
                    });
                }
            } else {
                // If students are assigned, we only update basics. 
                // Updating stops with live assignments is complex (re-mapping IDs).
                // We'll skip stop updates for now if students are present to prevent data loss/errors.
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/routes`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRouteAction(id: string, schoolSlug: string) {
    try {
        // Check for assignments
        const assignmentsCount = await prisma.studentTransportProfile.count({ where: { routeId: id } });
        if (assignmentsCount > 0) {
            return { success: false, error: "Cannot delete route with assigned students. Unassign them first." };
        }

        await prisma.transportRoute.delete({ where: { id } });
        revalidatePath(`/s/${schoolSlug}/transport/routes`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
