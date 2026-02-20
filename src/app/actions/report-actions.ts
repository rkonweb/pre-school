'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

/**
 * Aggregates raw telemetry data for a specific day into a Daily Log.
 * Calculates total distance, start/end times, and stop arrival actuals.
 */
export async function syncDailyLogsAction(schoolSlug: string, dateStr: string, vehicleId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        const date = new Date(dateStr);
        const start = startOfDay(date);
        const end = endOfDay(date);

        // Fetch vehicles to sync
        const vehicles = await prisma.transportVehicle.findMany({
            where: {
                schoolId,
                ...(vehicleId && { id: vehicleId }),
                status: "ACTIVE"
            }
        });

        for (const vehicle of vehicles) {
            // 1. Get Telemetry for the day
            const telemetry = await prisma.vehicleTelemetry.findMany({
                where: {
                    vehicleId: vehicle.id,
                    recordedAt: { gte: start, lte: end }
                },
                orderBy: { recordedAt: 'asc' }
            });

            if (telemetry.length === 0) continue;

            // 2. Calculate Distance and Timing
            const startTime = telemetry[0].recordedAt;
            const endTime = telemetry[telemetry.length - 1].recordedAt;

            let totalDistance = 0;
            for (let i = 1; i < telemetry.length; i++) {
                const dist = calculateDistance(
                    telemetry[i - 1].latitude, telemetry[i - 1].longitude,
                    telemetry[i].latitude, telemetry[i].longitude
                );
                totalDistance += dist;
            }

            // 3. Create/Update Daily Log
            const dailyLog = await prisma.transportDailyLog.upsert({
                where: {
                    vehicleId_date: { vehicleId: vehicle.id, date: start }
                },
                update: {
                    totalDistance,
                    startTime,
                    endTime,
                    avgSpeed: telemetry.reduce((sum, t) => sum + (t.speed || 0), 0) / telemetry.length,
                    updatedAt: new Date()
                },
                create: {
                    date: start,
                    vehicleId: vehicle.id,
                    schoolId,
                    totalDistance,
                    startTime,
                    endTime,
                    avgSpeed: telemetry.reduce((sum, t) => sum + (t.speed || 0), 0) / telemetry.length
                }
            });

            // 4. Sync Stop timings (Actual vs Scheduled)
            const route = await prisma.transportRoute.findFirst({
                where: {
                    OR: [
                        { pickupVehicleId: vehicle.id },
                        { dropVehicleId: vehicle.id }
                    ]
                },
                include: { stops: true }
            });

            if (route) {
                for (const stop of route.stops) {
                    // Check if an actual arrival was recorded near the stop coordinates (within 100m)
                    const arrival = telemetry.find(t =>
                        calculateDistance(t.latitude, t.longitude, stop.latitude || 0, stop.longitude || 0) < 0.1
                    );

                    if (arrival) {
                        const schedTime = stop.pickupTime || stop.dropTime;

                        await prisma.transportStopLog.create({
                            data: {
                                dailyLogId: dailyLog.id,
                                stopId: stop.id,
                                scheduledArrival: schedTime,
                                actualArrival: arrival.recordedAt,
                                // Delay calculation logic could go here
                            }
                        }).catch(e => {
                            // Handle duplicate logs if already synced (StopLogs don't have unique index in schema yet)
                            // console.log("StopLog already exists or error", e.message);
                        });
                    }
                }
            }
        }

        revalidatePath(`/s/${schoolSlug}/transport/reports/daily`);
        return { success: true };
    } catch (error: any) {
        console.error("Sync Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch daily logs for a vehicle or date range
 */
export async function getTransportDailyReportsAction(schoolSlug: string, filters?: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const logs = await prisma.transportDailyLog.findMany({
            where: {
                school: { slug: schoolSlug },
                ...(filters?.vehicleId && { vehicleId: filters.vehicleId }),
                ...(filters?.date && { date: new Date(filters.date) }),
            },
            include: {
                vehicle: { select: { registrationNumber: true, model: true } },
                stopLogs: { include: { stop: true } }
            },
            orderBy: { date: 'desc' }
        });

        return { success: true, data: logs };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Aggregate data for a monthly transport report
 */
export async function getMonthlyTransportReportAction(schoolSlug: string, month: number, year: number) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;

        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));

        const dailyLogs = await prisma.transportDailyLog.findMany({
            where: {
                schoolId: schoolId as string,
                date: { gte: start, lte: end }
            },
            include: { vehicle: true }
        });

        const expenses = await prisma.transportExpense.findMany({
            where: {
                schoolId: schoolId as string,
                date: { gte: start, lte: end }
            }
        });

        // Group by Vehicle
        const reportByVehicle = dailyLogs.reduce((acc: any, log) => {
            if (!acc[log.vehicleId]) {
                acc[log.vehicleId] = {
                    vehicle: (log as any).vehicle,
                    totalDistance: 0,
                    totalDaysActive: 0,
                    avgEfficiency: 0,
                    totalFuelCost: 0,
                    totalMaintenanceCost: 0
                };
            }
            acc[log.vehicleId].totalDistance += log.totalDistance;
            acc[log.vehicleId].totalDaysActive += 1;
            return acc;
        }, {});

        // Add Expenses to Grouping
        expenses.forEach(exp => {
            if (reportByVehicle[exp.vehicleId]) {
                if (exp.category === "FUEL") reportByVehicle[exp.vehicleId].totalFuelCost += exp.amount;
                else reportByVehicle[exp.vehicleId].totalMaintenanceCost += exp.amount;
            }
        });

        return { success: true, data: Object.values(reportByVehicle) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Distance Helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Generate a comprehensive daily intelligence report for the school
 */
export async function generateDailyReportAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const schoolId = auth.user.schoolId;

        const today = startOfDay(new Date());
        const tomorrow = endOfDay(today);

        // 1. Student Attendance
        const totalStudents = await prisma.student.count({ where: { schoolId, status: "ACTIVE" } });
        const presentStudents = await prisma.attendance.count({
            where: { student: { schoolId }, date: today, status: "PRESENT" }
        });
        const absentStudents = totalStudents - presentStudents;
        const studentPercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

        // 2. Staff Attendance
        const totalStaff = await prisma.user.count({ where: { schoolId, status: "ACTIVE" } });
        const presentStaff = await prisma.staffAttendance.count({
            where: { user: { schoolId }, date: today, status: "PRESENT" }
        });

        // 3. Finance
        const paymentsToday = await prisma.feePayment.findMany({
            where: { fee: { student: { schoolId } }, date: { gte: today, lte: tomorrow } }
        });
        const collectedToday = paymentsToday.reduce((sum, p) => sum + p.amount, 0);

        const pendingFees = await prisma.fee.aggregate({
            where: { student: { schoolId }, status: "PENDING" },
            _sum: { amount: true }
        });

        // 4. Admissions
        const newInquiries = await prisma.admission.count({
            where: { schoolId, dateReceived: { gte: today, lte: tomorrow } }
        });

        // 5. Narrative Generation (Simulated AI)
        const narrative = `Today at ${schoolSlug.toUpperCase()}, student attendance is at ${studentPercentage}%, with ${presentStudents} students present. In the staff lounge, ${presentStaff} out of ${totalStaff} members have checked in. Financially, we've recorded ₹${collectedToday.toLocaleString()} in fee payments today, while managing an outstanding ledger of ₹${(pendingFees._sum.amount || 0).toLocaleString()}. Our admissions pipeline remains active with ${newInquiries} new inquiries received in the last 24 hours. Overall, operations are proceeding normally with high engagement in the core academic modules.`;

        const data = {
            stats: {
                date: today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                students: {
                    total: totalStudents,
                    present: presentStudents,
                    absent: absentStudents,
                    percentage: studentPercentage
                },
                staff: {
                    total: totalStaff,
                    present: presentStaff
                },
                finance: {
                    collected: collectedToday,
                    pending: pendingFees._sum.amount || 0
                },
                admissions: {
                    new: newInquiries
                }
            },
            narrative
        };

        return { success: true, data };
    } catch (error: any) {
        console.error("Report Generation Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all report cards for a specific student (Staff version)
 */
/**
 * Fetches all report cards for a specific student (Staff version)
 */
export async function getStudentReportsAction(schoolSlug: string, studentId: string, academicYearId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const reports = await prisma.reportCard.findMany({
            where: {
                studentId,
                ...(academicYearId && { academicYearId })
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reports };
    } catch (error: any) {
        console.error("getStudentReportsAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Creates a new report card for a student
 */
export async function createReportCardAction(
    schoolSlug: string,
    studentId: string,
    term: string,
    marks: any,
    comments?: string,
    academicYearId?: string
) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { schoolId: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        const report = await prisma.reportCard.create({
            data: {
                studentId,
                term,
                marks: JSON.stringify(marks),
                comments,
                academicYearId,
                academicYearId,
                published: true, // Auto-publish for now
            }
        });

        revalidatePath(`/s/${schoolSlug}/students/${studentId}`);
        return { success: true, report };
    } catch (error: any) {
        console.error("createReportCardAction Error:", error);
        return { success: false, error: error.message };
    }
}
