'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

/**
 * Add a new transport expense (Fuel, Repair, Maintenance, etc.)
 * Includes automated anomaly detection for fuel theft or unusual spending.
 */
export async function addTransportExpenseAction(schoolSlug: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;
        const schoolId = user.schoolId;
        if (!schoolId) return { success: false, error: "School not found" };

        // --- Permission & Status Logic ---
        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        const status = canApprove ? "APPROVED" : "PENDING";

        let isSuspicious = false;
        let anomalyReason: string | null = null;

        // --- AI Anomaly Detection Logic for Fuel ---
        if (data.category === "FUEL") {
            // Compare with vehicle's recent fuel expenses
            const recentAvg = await prisma.transportExpense.aggregate({
                where: { vehicleId: data.vehicleId, category: "FUEL" },
                _avg: { amount: true }
            });

            // Flag if expense is > 150% of the vehicle's historical average
            if (recentAvg._avg.amount && data.amount > recentAvg._avg.amount * 1.5) {
                isSuspicious = true;
                anomalyReason = `Fuel expense (${data.amount}) is over 150% of vehicle average (${recentAvg._avg.amount.toFixed(2)})`;
            }

            // Flag very large round numbers (potential placeholder entries)
            if (data.amount > 1000 && data.amount % 1000 === 0) {
                isSuspicious = true;
                anomalyReason = anomalyReason ? `${anomalyReason} + Potential round number estimate` : 'Potential round number estimate (suspicious behavior)';
            }
        }

        const expense = await prisma.transportExpense.create({
            data: {
                schoolId: schoolId,
                vehicleId: data.vehicleId,
                category: data.category,
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                receiptUrl: data.receiptUrl,
                status,
                createdById: user.id,
                approvedById: canApprove ? user.id : null,
                isSuspicious,
                anomalyReason
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true, data: expense };
    } catch (error: any) {
        console.error("Error adding expense:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing transport expense
 */
export async function updateTransportExpenseAction(schoolSlug: string, expenseId: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;

        const existing = await prisma.transportExpense.findUnique({
            where: { id: expenseId, schoolId: user.schoolId as string }
        });
        if (!existing) return { success: false, error: "Expense not found" };

        // Permission check
        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        const isOwner = existing.createdById === user.id;

        if (!canApprove && !isOwner) {
            return { success: false, error: "Unauthorized to edit this expense" };
        }

        let isSuspicious = false;
        let anomalyReason: string | null = null;

        if (data.category === "FUEL") {
            const recentAvg = await prisma.transportExpense.aggregate({
                where: { vehicleId: data.vehicleId, category: "FUEL", NOT: { id: expenseId } },
                _avg: { amount: true }
            });

            if (recentAvg._avg.amount && data.amount > recentAvg._avg.amount * 1.5) {
                isSuspicious = true;
                anomalyReason = `Fuel expense (${data.amount}) is over 150% of vehicle average (${recentAvg._avg.amount.toFixed(2)})`;
            }

            if (data.amount > 1000 && data.amount % 1000 === 0) {
                isSuspicious = true;
                anomalyReason = anomalyReason ? `${anomalyReason} + Potential round number estimate` : 'Potential round number estimate (suspicious behavior)';
            }
        }

        // If a non-approver (Driver) edits an expense, it must go back to PENDING
        const newStatus = canApprove ? existing.status : "PENDING";

        const expense = await prisma.transportExpense.update({
            where: { id: expenseId, schoolId: user.schoolId as string },
            data: {
                vehicleId: data.vehicleId,
                category: data.category,
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                receiptUrl: data.receiptUrl,
                status: newStatus,
                isSuspicious,
                anomalyReason
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true, data: expense };
    } catch (error: any) {
        console.error("Error updating expense:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetch transport expenses with filtering
 */
export async function getTransportExpensesAction(schoolSlug: string, filters?: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const expenses = await prisma.transportExpense.findMany({
            where: {
                school: { slug: schoolSlug },
                ...(filters?.vehicleId && { vehicleId: filters.vehicleId }),
                ...(filters?.category && { category: filters.category }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.isSuspicious !== undefined && { isSuspicious: filters.isSuspicious })
            },
            include: {
                vehicle: {
                    select: { registrationNumber: true, model: true }
                },
                createdBy: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        return { success: true, data: expenses };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Mark an anomaly as resolved/verified
 */
export async function resolveExpenseAnomalyAction(schoolSlug: string, expenseId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;

        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        if (!canApprove) return { success: false, error: "Unauthorized to resolve anomalies" };

        await prisma.transportExpense.update({
            where: { id: expenseId, schoolId: user.schoolId as string },
            data: { isSuspicious: false, anomalyReason: null }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete an expense record
 */
export async function deleteTransportExpenseAction(schoolSlug: string, expenseId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;

        const existing = await prisma.transportExpense.findUnique({
            where: { id: expenseId, schoolId: user.schoolId as string }
        });
        if (!existing) return { success: false, error: "Expense not found" };

        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canDelete = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("delete"));

        const isOwner = existing.createdById === user.id;

        if (!canDelete && !isOwner) {
            return { success: false, error: "Unauthorized to delete this expense" };
        }

        await prisma.transportExpense.delete({
            where: { id: expenseId, schoolId: user.schoolId as string }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Approve a pending expense
 */
export async function approveTransportExpenseAction(schoolSlug: string, expenseId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const user = auth.user;
        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        if (!canApprove) return { success: false, error: "Unauthorized to approve expenses" };

        await prisma.transportExpense.update({
            where: { id: expenseId, schoolId: user.schoolId as string },
            data: {
                status: "APPROVED",
                approvedById: user.id
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Reject a pending expense
 */
export async function rejectTransportExpenseAction(schoolSlug: string, expenseId: string, reason: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const user = auth.user;
        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        if (!canApprove) return { success: false, error: "Unauthorized to reject expenses" };

        await prisma.transportExpense.update({
            where: { id: expenseId, schoolId: user.schoolId as string },
            data: {
                status: "REJECTED",
                rejectionReason: reason,
                approvedById: user.id
            }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
