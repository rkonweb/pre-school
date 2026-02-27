'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFileAction } from "@/app/actions/upload-actions";
import { validateUserSchoolAction } from "./session-actions";
import { checkPhoneExistsAction } from "./identity-validation";

// --- ROUTES & STOPS ---

export async function createRouteAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        await prisma.transportRoute.create({
            data: {
                name: data.name,
                description: data.description,
                pickupVehicleId: data.pickupVehicleId || null,
                dropVehicleId: data.dropVehicleId || null,
                driverId: data.driverId || null,
                schoolId: schoolId,
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

        revalidatePath(`/s/${schoolSlug}/transport/route/routes`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRouteAction(slug: string, routeId: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        // Update route details
        await prisma.transportRoute.update({
            where: { id: routeId, school: { slug } },
            data: {
                name: data.name,
                description: data.description,
                pickupVehicleId: data.pickupVehicleId || null,
                dropVehicleId: data.dropVehicleId || null,
                driverId: data.driverId || null,
            }
        });

        // Handle stops: Update existing ones, create new ones, and remove deleted ones
        if (data.stops) {
            const incomingStopIds = data.stops.map((s: any) => s.id).filter((id: string) => id && !id.startsWith('new-'));

            // 1. Delete stops that are no longer present
            await prisma.transportStop.deleteMany({
                where: {
                    routeId,
                    id: { notIn: incomingStopIds },
                    route: { school: { slug } }
                }
            });

            // 2. Upsert incoming stops
            for (let idx = 0; idx < data.stops.length; idx++) {
                const s = data.stops[idx];
                const stopData = {
                    name: s.name,
                    pickupTime: s.pickupTime,
                    dropTime: s.dropTime,
                    monthlyFee: parseFloat(s.monthlyFee || 0),
                    latitude: parseFloat(s.lat || s.latitude || 0),
                    longitude: parseFloat(s.lng || s.longitude || 0),
                    sequenceOrder: idx + 1,
                    routeId: routeId
                };

                if (s.id && !s.id.startsWith('new-')) {
                    // Update existing
                    await prisma.transportStop.update({
                        where: { id: s.id, route: { school: { slug } } },
                        data: stopData
                    });
                } else {
                    // Create new - verify route belongs to school first
                    const route = await prisma.transportRoute.findUnique({
                        where: { id: routeId, school: { slug } }
                    });
                    if (!route) throw new Error("Route not found or unauthorized");

                    await prisma.transportStop.create({
                        data: stopData
                    });
                }
            }
        }

        revalidatePath(`/s/${slug}/transport/route/routes`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRouteAction(slug: string, routeId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await prisma.transportRoute.delete({
            where: { id: routeId, school: { slug } }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRoutesAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const routes = await prisma.transportRoute.findMany({
            where: { schoolId: auth.user.schoolId! },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: routes };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllRoutesWithStopsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const routes = await prisma.transportRoute.findMany({
            where: { schoolId: auth.user.schoolId! },
            include: { stops: { orderBy: { sequenceOrder: 'asc' } } },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: routes };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRouteDetailsAction(routeId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const route = await prisma.transportRoute.findUnique({
            where: { id: routeId, school: { slug } },
            include: {
                stops: {
                    orderBy: { sequenceOrder: 'asc' }
                }
            }
        });

        return { success: true, data: route };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- STOP MANAGEMENT ---

export async function addStopAction(slug: string, routeId: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const route = await prisma.transportRoute.findUnique({
            where: { id: routeId, school: { slug } }
        });
        if (!route) return { success: false, error: "Route not found or unauthorized" };

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


// --- APPLICATION FLOW & ASSIGNMENTS ---

export async function searchStudentsForTransportAction(query: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const students = await prisma.student.findMany({
            where: {
                schoolId: auth.user.schoolId!,
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } }
                ]
            },
            take: 10,
            include: {
                transportProfile: true
            }
        });

        return { success: true, data: students };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignStudentToRouteAction(studentId: string, routeId: string, pickupStopId: string, dropStopId: string, slug: string, transportFee: number) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const student = await prisma.student.findUnique({
            where: { id: studentId, school: { slug } }
        });
        if (!student) return { success: false, error: "Student not found or unauthorized" };

        const route = await prisma.transportRoute.findUnique({
            where: { id: routeId, school: { slug } }
        });
        if (!route) return { success: false, error: "Route not found or unauthorized" };

        // Upsert Transport Profile
        const existing = await prisma.studentTransportProfile.findUnique({
            where: { studentId, student: { school: { slug } } }
        });
        if (existing) {
            await prisma.studentTransportProfile.update({
                where: { studentId, student: { school: { slug } } },
                data: {
                    routeId,
                    pickupStopId,
                    dropStopId,
                    transportFee,
                    status: 'APPROVED', // Direct assignment implies approval
                    startDate: new Date()
                }
            });
        } else {
            await prisma.studentTransportProfile.create({
                data: {
                    studentId,
                    routeId,
                    pickupStopId,
                    dropStopId,
                    transportFee,
                    status: 'APPROVED',
                    startDate: new Date()
                }
            });
        }

        // Create Fee Record
        if (transportFee > 0) {
            await prisma.fee.create({
                data: {
                    title: "Transport Fee (Manual Assignment)",
                    amount: transportFee,
                    dueDate: new Date(),
                    studentId,
                    category: "TRANSPORT",
                    description: "Fee for transport assignment",
                    status: "PENDING"
                }
            });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeStudentFromTransportAction(studentId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.studentTransportProfile.update({
            where: { studentId, student: { school: { slug } } },
            data: {
                routeId: null,
                pickupStopId: null,
                dropStopId: null,
                status: 'INACTIVE'
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function applyForTransportAction(slug: string, studentId: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        // 1. Check if profile exists
        const existing = await prisma.studentTransportProfile.findUnique({
            where: { studentId, student: { school: { slug } } }
        });

        if (existing) {
            // Update existing application
            await prisma.studentTransportProfile.update({
                where: { studentId, student: { school: { slug } } },
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
            // Create new after verifying student
            const student = await prisma.student.findUnique({
                where: { id: studentId, school: { slug } }
            });
            if (!student) return { success: false, error: "Student not found or unauthorized" };

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

export async function approveTransportRequestAction(slug: string, studentId: string, assignmentData: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        // assignmentData: { routeId, stopId, startDate }

        const stop = await prisma.transportStop.findUnique({
            where: { id: assignmentData.stopId, route: { school: { slug } } }
        });

        if (!stop) throw new Error("Invalid stop selected");

        // 1. Update Profile
        await prisma.studentTransportProfile.update({
            where: { studentId, student: { school: { slug } } },
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

export async function rejectTransportRequestAction(slug: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        await prisma.studentTransportProfile.update({
            where: { studentId, student: { school: { slug } } },
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
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const vehicles = await prisma.transportVehicle.findMany({
            where: { schoolId: school.id },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: vehicles };
    } catch (error: any) {
        console.error("Error fetching vehicles:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteVehicleAction(slug: string, vehicleId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId, school: { slug } }
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
                if (url) await deleteFileAction(url, slug);
            }

            // 2. Delete Additional documents
            try {
                const additionalDocs = JSON.parse(vehicle.documents || "[]");
                for (const doc of additionalDocs) {
                    if (doc.url) await deleteFileAction(doc.url, slug);
                }
            } catch (e) {
                console.error("Failed to parse additional documents for deletion:", e);
            }
        }

        await prisma.transportVehicle.delete({
            where: { id: vehicleId, school: { slug } }
        });
        revalidatePath(`/s/${slug}/transport/fleet/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting vehicle:", error);
        return { success: false, error: error.message };
    }
}

export async function createVehicleAction(data: any, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        await prisma.transportVehicle.create({
            data: {
                registrationNumber: data.registrationNumber,
                model: data.model,
                capacity: parseInt(data.capacity),
                status: data.status,
                schoolId: schoolId,

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

        revalidatePath(`/s/${schoolSlug}/transport/fleet/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating vehicle:", error);
        return { success: false, error: error.message };
    }
}

export async function getVehicleByIdAction(vehicleId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId, school: { slug } }
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
            where: { id: vehicleId, school: { slug: schoolSlug } },
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

        revalidatePath(`/s/${schoolSlug}/transport/fleet/vehicles`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating vehicle:", error);
        return { success: false, error: error.message };
    }
}


// --- DRIVER MANAGEMENT ---

export async function getDriversAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        // SYNC PROTOCOL: Detect staff with 'DRIVER' role or Access Profile (Custom Role) as 'Driver'
        const staffDrivers = await prisma.user.findMany({
            where: {
                schoolId: school.id,
                OR: [
                    { role: { in: ['DRIVER', 'Driver', 'driver'] } },
                    { customRole: { name: { contains: 'Driver' } } },
                    { customRole: { name: { contains: 'driver' } } },
                    { customRole: { name: { contains: 'DRIVER' } } }
                ]
            },
            include: {
                transportDriver: true,
                customRole: true
            }
        });

        // Initialize missing transport mappings
        for (const staff of staffDrivers) {
            if (!staff.transportDriver) {
                try {
                    await prisma.transportDriver.create({
                        data: {
                            name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || "Fleet Pilot",
                            phone: staff.mobile || "N/A",
                            licenseNumber: "PENDING", // Required field in schema
                            schoolId: school.id,
                            userId: staff.id,
                            status: 'ACTIVE'
                        }
                    });
                } catch (e) {
                    console.error(`Failed to sync staff driver ${staff.id}:`, e);
                }
            }
        }

        const drivers = await prisma.transportDriver.findMany({
            where: { schoolId: school.id },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: drivers };
    } catch (error: any) {
        console.error("Error fetching drivers:", error);
        return { success: false, error: error.message };
    }
}

export async function createDriverAction(data: any, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        // Check for phone overlap
        const phoneCheck = await checkPhoneExistsAction(data.phone);

        let linkedUserId = null;

        if (phoneCheck.exists) {
            if (phoneCheck.type === 'user') {
                // If it's a user, check if they are in the same school
                const existingUser = await prisma.user.findUnique({
                    where: { id: phoneCheck.entityId },
                    select: { schoolId: true }
                });

                if (existingUser?.schoolId === schoolId) {
                    // Allow overlap and link the userId
                    linkedUserId = phoneCheck.entityId;
                } else {
                    return { success: false, error: `Phone number is already in use by a staff member in another school.` };
                }
            } else {
                // For any other entity type (School, Student, etc.), still block it
                return { success: false, error: `Phone number is already in use by: ${phoneCheck.location}` };
            }
        }

        await prisma.transportDriver.create({
            data: {
                name: data.name,
                licenseNumber: data.licenseNumber,
                phone: data.phone,
                status: data.status || "ACTIVE",
                schoolId: schoolId,
                userId: linkedUserId
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/fleet/drivers`);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating driver:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get comprehensive stats for the transport dashboard
 */
export async function getTransportDashboardStatsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                transportVehicles: {
                    include: {
                        VehicleTelemetry: {
                            orderBy: { recordedAt: 'desc' },
                            take: 1
                        }
                    }
                },
                transportRoutes: {
                    include: {
                        driver: true
                    }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        // 1. Financial Stats
        const fees = await prisma.fee.findMany({
            where: {
                student: { schoolId: school.id },
                category: "TRANSPORT"
            }
        });

        const totalExpected = fees.reduce((sum, f) => sum + f.amount, 0);
        const totalCollected = fees.filter(f => f.status === "PAID").reduce((sum, f) => sum + f.amount, 0);

        // 2. Fleet Stats (AI based)
        const activeVehicles = school.transportVehicles.filter(v => v.status === "ACTIVE").length;
        const delayedVehicles = school.transportVehicles.filter(v =>
            v.VehicleTelemetry?.[0] && v.VehicleTelemetry[0].delayMinutes > 0
        ).length;

        // 3. Driver Stats
        const totalDrivers = await prisma.transportDriver.count({ where: { schoolId: school.id } });
        const driversOnRoute = new Set(school.transportRoutes.map(r => r.driverId).filter(Boolean)).size;

        return {
            success: true,
            data: {
                finances: {
                    totalExpected,
                    totalCollected,
                    collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0
                },
                fleet: {
                    total: school.transportVehicles.length,
                    active: activeVehicles,
                    delayed: delayedVehicles
                },
                drivers: {
                    total: totalDrivers,
                    active: driversOnRoute,
                    absent: totalDrivers - driversOnRoute
                }
            }
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- AUTOMATED FEE GENERATION ---

export async function generateMonthlyTransportFeesAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        // Find all active transport profiles for this school
        const activeProfiles = await prisma.studentTransportProfile.findMany({
            where: {
                student: { schoolId: schoolId },
                status: 'APPROVED',
                transportFee: { gt: 0 }
            },
            include: {
                student: true
            }
        });

        let generatedCount = 0;
        const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();

        for (const profile of activeProfiles) {
            const feeTitle = `Transport Fee - ${currentMonthName} ${currentYear}`;

            // Check if a fee for this month already exists to avoid duplicates
            const existingFee = await prisma.fee.findFirst({
                where: {
                    studentId: profile.studentId,
                    category: 'TRANSPORT',
                    title: feeTitle
                }
            });

            if (!existingFee) {
                // Due date is typically the 10th of the current month (or any school specific logic)
                const dueDate = new Date();
                dueDate.setDate(10);

                // If it's already past the 10th, maybe set due date to next few days
                if (new Date() > dueDate) {
                    dueDate.setDate(new Date().getDate() + 5);
                }

                await prisma.fee.create({
                    data: {
                        studentId: profile.studentId,
                        title: feeTitle,
                        amount: profile.transportFee,
                        category: "TRANSPORT",
                        status: "PENDING",
                        description: `Automated monthly transportation charge for Route.`,
                        dueDate: dueDate
                    }
                });
                generatedCount++;
            }
        }

        return { success: true, count: generatedCount };
    } catch (e: any) {
        console.error("Monthly Transport Fee Generation Error:", e);
        return { success: false, error: e.message };
    }
}

// --- STUDENT TRANSPORT TRACKING ---

export async function getFleetStudentsAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const students = await prisma.studentTransportProfile.findMany({
            where: {
                student: { schoolId: school.id },
                status: 'APPROVED' // Or active statuses
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        admissionNumber: true,
                        classroom: { select: { name: true } }
                    }
                },
                route: { select: { id: true, name: true } },
                pickupStop: { select: { id: true, name: true, pickupTime: true } },
                dropStop: { select: { id: true, name: true, dropTime: true } }
            },
            orderBy: {
                student: { firstName: 'asc' }
            }
        });

        return { success: true, data: students };
    } catch (error: any) {
        console.error("Error fetching fleet students:", error);
        return { success: false, error: error.message };
    }
}
