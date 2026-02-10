'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFileAction } from "@/app/actions/upload-actions";

// --- ROUTES & STOPS ---

export async function createRouteAction(schoolSlug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
        if (!school) throw new Error("School not found");

        await prisma.transportRoute.create({
            data: {
                name: data.name,
                description: data.description,
                pickupVehicleId: data.pickupVehicleId || null,
                dropVehicleId: data.dropVehicleId || null,
                driverId: data.driverId,
                schoolId: school.id,
                stops: {
                    create: data.stops.map((s: any, idx: number) => ({
                        name: s.name,
                        pickupTime: s.pickupTime,
                        dropTime: s.dropTime,
                        monthlyFee: parseFloat(s.monthlyFee || 0),
                        latitude: parseFloat(s.latitude || 0),
                        longitude: parseFloat(s.longitude || 0),
                        sequenceOrder: idx + 1
                    }))
                }
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/routes`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRouteAction(routeId: string, data: any) {
    try {
        // Simple update for route details
        await prisma.transportRoute.update({
            where: { id: routeId },
            data: {
                name: data.name,
                description: data.description,
                pickupVehicleId: data.pickupVehicleId || null,
                dropVehicleId: data.dropVehicleId || null,
                driverId: data.driverId,
            }
        });

        // Handle stops separately or rebuild them (simplified here)
        // In a real app, we'd diff the stops. For now, we assume route details update.

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRouteAction(routeId: string) {
    try {
        await prisma.transportRoute.delete({ where: { id: routeId } });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- STOP MANAGEMENT ---

export async function addStopAction(routeId: string, data: any) {
    try {
        await prisma.transportStop.create({
            data: {
                routeId,
                name: data.name,
                pickupTime: data.pickupTime,
                dropTime: data.dropTime,
                monthlyFee: parseFloat(data.monthlyFee || 0),
                latitude: parseFloat(data.latitude || 0),
                longitude: parseFloat(data.longitude || 0),
                sequenceOrder: data.sequenceOrder || 1,
            }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- APPLICATION FLOW ---

export async function applyForTransportAction(studentId: string, data: any) {
    try {
        // 1. Check if profile exists
        const existing = await prisma.studentTransportProfile.findUnique({
            where: { studentId }
        });

        if (existing) {
            // Update existing application
            await prisma.studentTransportProfile.update({
                where: { studentId },
                data: {
                    status: "PENDING",
                    applicationAddress: data.address,
                    applicationLat: data.lat,
                    applicationLng: data.lng,
                    // Clear previous assignments if reapplying
                    routeId: null,
                    pickupStopId: null,
                    dropStopId: null
                }
            });
        } else {
            // Create new
            await prisma.studentTransportProfile.create({
                data: {
                    studentId,
                    status: "PENDING",
                    applicationAddress: data.address,
                    applicationLat: data.lat,
                    applicationLng: data.lng,
                }
            });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ADMIN APPROVAL ---

export async function approveTransportRequestAction(studentId: string, assignmentData: any) {
    try {
        // assignmentData: { routeId, stopId, startDate }

        const stop = await prisma.transportStop.findUnique({
            where: { id: assignmentData.stopId }
        });

        if (!stop) throw new Error("Invalid stop selected");

        // 1. Update Profile
        await prisma.studentTransportProfile.update({
            where: { studentId },
            data: {
                status: "APPROVED",
                routeId: assignmentData.routeId,
                pickupStopId: assignmentData.stopId,
                dropStopId: assignmentData.stopId, // Assume same for now
                startDate: new Date(assignmentData.startDate),
                transportFee: stop.monthlyFee
            }
        });

        // 2. Generate First Fee (Optional - could be automated scheduler)
        await prisma.fee.create({
            data: {
                title: `Transport Fee - First Month`,
                amount: stop.monthlyFee,
                dueDate: new Date(), // Immediate
                studentId: studentId,
                description: "Initial transport fee upon approval",
                status: "PENDING"
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectTransportRequestAction(studentId: string) {
    try {
        await prisma.studentTransportProfile.update({
            where: { studentId },
            data: { status: "REJECTED" }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- VEHICLE MANAGEMENT ---

export async function getVehiclesAction(schoolSlug: string) {
    try {
        const vehicles = await prisma.transportVehicle.findMany({
            where: { school: { slug: schoolSlug } },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: vehicles };
    } catch (error: any) {
        console.error("Error fetching vehicles:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteVehicleAction(vehicleId: string, schoolSlug: string) {
    try {
        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId }
        }) as any;

        if (vehicle) {
            // 1. Delete Compliance documents
            const complianceDocs = [
                vehicle.insuranceDocUrl,
                vehicle.pollutionDocUrl,
                vehicle.fitnessDocUrl,
                vehicle.permitDocUrl,
                vehicle.rcDocUrl
            ];

            for (const url of complianceDocs) {
                if (url) await deleteFileAction(url, schoolSlug);
            }

            // 2. Delete Additional documents
            try {
                const additionalDocs = JSON.parse(vehicle.documents || "[]");
                for (const doc of additionalDocs) {
                    if (doc.url) await deleteFileAction(doc.url, schoolSlug);
                }
            } catch (e) {
                console.error("Failed to parse additional documents for deletion:", e);
            }
        }

        await prisma.transportVehicle.delete({
            where: { id: vehicleId }
        });
        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting vehicle:", error);
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
                schoolId: school.id,

                insuranceNumber: data.insuranceNumber || null,
                insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
                insuranceDocUrl: data.insuranceDocUrl || null,

                pollutionNumber: data.pollutionNumber || null,
                pollutionExpiry: data.pollutionExpiry ? new Date(data.pollutionExpiry) : null,
                pollutionDocUrl: data.pollutionDocUrl || null,

                fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : null,
                fitnessDocUrl: data.fitnessDocUrl || null,

                permitNumber: data.permitNumber || null,
                permitExpiry: data.permitExpiry ? new Date(data.permitExpiry) : null,
                permitDocUrl: data.permitDocUrl || null,

                rcDocUrl: data.rcDocUrl || null,
                documents: JSON.stringify(data.documents || [])
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating vehicle:", error);
        return { success: false, error: error.message };
    }
}

export async function getVehicleByIdAction(vehicleId: string) {
    try {
        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId }
        });
        return { success: true, data: vehicle };
    } catch (error: any) {
        console.error("Error fetching vehicle:", error);
        return { success: false, error: error.message };
    }
}

export async function updateVehicleAction(vehicleId: string, data: any, schoolSlug: string) {
    try {
        await prisma.transportVehicle.update({
            where: { id: vehicleId },
            data: {
                registrationNumber: data.registrationNumber,
                model: data.model,
                capacity: parseInt(data.capacity),
                status: data.status,

                insuranceNumber: data.insuranceNumber || null,
                insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
                insuranceDocUrl: data.insuranceDocUrl || null,

                pollutionNumber: data.pollutionNumber || null,
                pollutionExpiry: data.pollutionExpiry ? new Date(data.pollutionExpiry) : null,
                pollutionDocUrl: data.pollutionDocUrl || null,

                fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : null,
                fitnessDocUrl: data.fitnessDocUrl || null,

                permitNumber: data.permitNumber || null,
                permitExpiry: data.permitExpiry ? new Date(data.permitExpiry) : null,
                permitDocUrl: data.permitDocUrl || null,

                rcDocUrl: data.rcDocUrl || null,
                documents: JSON.stringify(data.documents || [])
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating vehicle:", error);
        return { success: false, error: error.message };
    }
}

