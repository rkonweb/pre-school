'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

// ─── Shared Helper ─────────────────────────────────────────────────────────────
/**
 * Posts a single TransportExpense as a DEBIT AccountTransaction.
 * Guards against double-posting via sourceTransportExpenseId.
 */
async function postToAccountsTransaction(schoolId: string, expense: any, userId: string) {
    // Guard: skip if already posted
    const already = await prisma.accountTransaction.findFirst({
        where: { sourceTransportExpenseId: expense.id }
    });
    if (already) return { skipped: true };

    const activeYear = await prisma.accountFinancialYear.findFirst({
        where: { schoolId, isActive: true }
    });
    if (!activeYear) return { error: 'No active financial year' };

    await prisma.accountTransaction.create({
        data: {
            transactionNo: `TRX-TRP-${Date.now()}`,
            description: `[Transport] ${expense.category} – ${expense.description ?? 'Fleet Expense'} (Vehicle: ${expense.vehicleId})`,
            amount: expense.amount,
            type: 'DEBIT',
            status: 'COMPLETED',
            date: expense.date,
            reference: expense.id,
            notes: `Auto-posted from Transport Expenses. Expense ID: ${expense.id}`,
            schoolId,
            financialYearId: activeYear.id,
            sourceTransportExpenseId: expense.id,
            createdById: userId,
        }
    });
    return { success: true };
}

// ─── Add Expense ────────────────────────────────────────────────────────────────
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
            const recentAvg = await prisma.transportExpense.aggregate({
                where: { vehicleId: data.vehicleId, category: "FUEL" },
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

        // Auto-sync to Accounts when expense is APPROVED
        if (status === "APPROVED") {
            await postToAccountsTransaction(schoolId, expense, user.id);
        }

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true, data: expense };
    } catch (error: any) {
        console.error("Error adding expense:", error);
        return { success: false, error: error.message };
    }
}

// ─── Update Expense ─────────────────────────────────────────────────────────────
export async function updateTransportExpenseAction(schoolSlug: string, expenseId: string, data: any) {
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

// ─── Get Expenses ───────────────────────────────────────────────────────────────
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

// ─── Resolve Anomaly ────────────────────────────────────────────────────────────
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

// ─── Delete Expense ─────────────────────────────────────────────────────────────
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

// ─── Approve Expense ────────────────────────────────────────────────────────────
export async function approveTransportExpenseAction(schoolSlug: string, expenseId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const user = auth.user;
        const schoolId = user.schoolId as string;

        const userPerms = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const canApprove = user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            userPerms.some((p: any) => p.module === "transport.expenses" && p.actions.includes("approve"));

        if (!canApprove) return { success: false, error: "Unauthorized to approve expenses" };

        const expense = await prisma.transportExpense.update({
            where: { id: expenseId, schoolId },
            data: {
                status: "APPROVED",
                approvedById: user.id
            }
        });

        // Auto-sync to Accounts (always)
        await postToAccountsTransaction(schoolId, expense, user.id);

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── Reject Expense ─────────────────────────────────────────────────────────────
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

// ─── Manual: Post Single Expense to Accounts ───────────────────────────────────
export async function postExpenseToAccountsAction(schoolSlug: string, expenseId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;
        const schoolId = user.schoolId as string;

        const canApprove = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        if (!canApprove) return { success: false, error: "Only admins can post expenses to Accounts" };

        const expense = await prisma.transportExpense.findUnique({
            where: { id: expenseId, schoolId }
        });
        if (!expense) return { success: false, error: "Expense not found" };
        if (expense.status !== "APPROVED") return { success: false, error: "Only approved expenses can be posted to Accounts" };

        const result = await postToAccountsTransaction(schoolId, expense, user.id);

        if ('skipped' in result && result.skipped) {
            return { success: false, error: "This expense has already been posted to Accounts" };
        }
        if ('error' in result && result.error) {
            return { success: false, error: result.error };
        }

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        revalidatePath(`/s/${schoolSlug}/accounts`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── Toggle Auto-Sync Setting ──────────────────────────────────────────────────
export async function updateTransportAccountsSyncAction(schoolSlug: string, enabled: boolean) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;

        const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
        if (!isAdmin) return { success: false, error: "Only admins can change this setting" };

        await prisma.school.update({
            where: { slug: schoolSlug },
            data: { transportSyncToAccounts: enabled }
        });

        revalidatePath(`/s/${schoolSlug}/transport/expenses`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
