'use server';

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

/**
 * 1. Predictive Maintenance Engine
 * Calculates current mileage and "Next Service Due" 
 */
export async function updatePredictiveMaintenanceAction(vehicleId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const vehicle = await prisma.transportVehicle.findUnique({
            where: { id: vehicleId, school: { slug } }
        });

        if (!vehicle) return { success: false, error: "Vehicle not found" };

        const logs = await prisma.transportDailyLog.findMany({
            where: { vehicleId },
            select: { totalDistance: true }
        });

        const totalMileage = logs.reduce((sum, log) => sum + (log.totalDistance || 0), 0);

        // Update current mileage
        const updated = await prisma.transportVehicle.update({
            where: { id: vehicleId },
            data: { currentMileage: totalMileage }
        });

        const distanceToService = updated.maintenanceIntervalMileage - (totalMileage - (updated.lastMaintenanceMileage || 0));

        let serviceStatus = "HEALTHY";
        if (distanceToService <= 0) serviceStatus = "OVERDUE";
        else if (distanceToService <= 500) serviceStatus = "DUE_SOON";

        return {
            success: true,
            data: {
                currentMileage: totalMileage,
                distanceToService: distanceToService > 0 ? distanceToService : 0,
                serviceStatus
            }
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 2. Driver Performance Scorecard System
 */
export async function getDriverScorecardAction(driverId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        // 2a. Parent/Admin Reviews
        const reviews = await prisma.transportDriverReview.findMany({
            where: { driverId, school: { slug } }
        });

        const avgReview = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 5; // Default perfect if no reviews

        // 2b. Telemetry efficiency (from routes driven)
        const routes = await prisma.transportRoute.findMany({
            where: { driverId, school: { slug } },
            select: { pickupVehicleId: true, dropVehicleId: true }
        });

        const vehicleIds = Array.from(new Set(
            routes.flatMap(r => [r.pickupVehicleId, r.dropVehicleId]).filter(Boolean) as string[]
        ));

        let avgEfficiencyFromLogs = 100;

        if (vehicleIds.length > 0) {
            const logs = await prisma.transportDailyLog.findMany({
                where: { vehicleId: { in: vehicleIds }, driverId }
            });

            if (logs.length > 0) {
                const totalEfficiency = logs.reduce((sum, log) => sum + (log.efficiencyScore || 100), 0);
                avgEfficiencyFromLogs = totalEfficiency / logs.length;
            }
        }

        // Weighted final score: 40% telemetry, 60% reviews
        const finalScore = Math.round((avgEfficiencyFromLogs * 0.4) + ((avgReview / 5) * 100 * 0.6));

        // Save back to driver
        await prisma.transportDriver.update({
            where: { id: driverId },
            data: { averageScore: finalScore }
        });

        return {
            success: true,
            data: {
                finalScore,
                avgReview,
                totalReviews: reviews.length,
                avgEfficiencyFromLogs
            }
        };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function submitDriverReviewAction(slug: string, data: { driverId: string, rating: number, comment?: string, reviewTheme?: string, studentId?: string }) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const review = await prisma.transportDriverReview.create({
            data: {
                driverId: data.driverId,
                reviewerId: auth.user.id,
                studentId: data.studentId || null,
                rating: data.rating,
                comment: data.comment,
                reviewTheme: data.reviewTheme,
                schoolId: auth.user.schoolId!
            }
        });

        // Fire background recalculation
        getDriverScorecardAction(data.driverId, slug).catch(console.error);

        return { success: true, data: review };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 3. Expense Anomaly Detection 2.0 (Fuel Efficiency)
 */
export async function calculateVehicleFuelEfficiencyAction(vehicleId: string, slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        // Get total fuel expenses
        const fuelExpenses = await prisma.transportExpense.findMany({
            where: { vehicleId, category: "FUEL", school: { slug }, status: "APPROVED" }
        });
        const totalFuelCost = fuelExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Assume average fuel price is ~100 INR/Liter for calculation if volume isn't provided directly
        const estimatedLiters = totalFuelCost / 100;

        const logs = await prisma.transportDailyLog.findMany({
            where: { vehicleId, school: { slug } },
            select: { totalDistance: true }
        });
        const totalDistance = logs.reduce((sum, log) => sum + (log.totalDistance || 0), 0) / 1000; // in km

        const kmPerLiter = estimatedLiters > 0 ? (totalDistance / estimatedLiters) : 0;

        return {
            success: true,
            data: {
                totalDistanceKm: totalDistance,
                estimatedLiters,
                kmPerLiter: Number(kmPerLiter.toFixed(2))
            }
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
