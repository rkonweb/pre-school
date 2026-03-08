'use server';

import { prisma } from '@/lib/prisma';
import {
    AccountCategoryInput,
    AccountVendorInput,
    AccountTransactionInput,
    TransactionType,
    TransactionStatus
} from '@/lib/types/accounts';
import { revalidatePath } from 'next/cache';
import { validateUserSchoolAction } from './session-actions';

// --- SCHOOL LOOKUP ---

export async function getSchoolIdBySlug(slug: string): Promise<string | null> {
    const school = await (prisma as any).school.findUnique({
        where: { slug },
        select: { id: true }
    });
    return school?.id ?? null;
}

// --- FINANCIAL YEARS ---

export async function getFinancialYears(schoolId: string) {
    const result = await prisma.accountFinancialYear.findMany({
        where: { schoolId },
        orderBy: { startDate: 'desc' }
    });
    return JSON.parse(JSON.stringify(result));
}

export async function createFinancialYear(schoolId: string, name: string, startDate: Date, endDate: Date) {
    const result = await prisma.accountFinancialYear.create({
        data: { name, startDate, endDate, schoolId, isActive: true }
    });
    revalidatePath(`/s/[slug]/accounts`);
    return JSON.parse(JSON.stringify(result));
}

// --- CATEGORIES ---

export async function getAccountCategories(schoolId: string) {
    const result = await prisma.accountCategory.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });
    return JSON.parse(JSON.stringify(result));
}

export async function createAccountCategory(schoolId: string, data: AccountCategoryInput) {
    const result = await prisma.accountCategory.create({
        data: { ...data, schoolId, isSystem: false }
    });
    revalidatePath(`/s/[slug]/accounts/settings`);
    return JSON.parse(JSON.stringify(result));
}

// --- VENDORS ---

export async function getAccountVendors(schoolId: string) {
    const result = await prisma.accountVendor.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });
    return JSON.parse(JSON.stringify(result));
}

export async function createAccountVendor(schoolId: string, data: AccountVendorInput) {
    const result = await prisma.accountVendor.create({
        data: { ...data, schoolId }
    });
    revalidatePath(`/s/[slug]/accounts/vendors`);
    return JSON.parse(JSON.stringify(result));
}

export async function getAccountVendorById(vendorId: string) {
    const result = await prisma.accountVendor.findUnique({
        where: { id: vendorId },
        include: {
            transactions: {
                orderBy: { date: 'desc' },
                take: 20,
            }
        }
    });
    return JSON.parse(JSON.stringify(result));
}

export async function updateAccountVendor(vendorId: string, data: Partial<AccountVendorInput>) {
    const result = await prisma.accountVendor.update({
        where: { id: vendorId },
        data,
    });
    revalidatePath(`/s/[slug]/accounts/vendors`);
    return JSON.parse(JSON.stringify(result));
}

export async function deleteAccountVendor(vendorId: string, slug: string) {
    await prisma.accountVendor.delete({ where: { id: vendorId } });
    revalidatePath(`/s/${slug}/accounts/vendors`);
    return { success: true };
}

// --- TRANSACTIONS ---

export async function getTransactions(schoolId: string) {
    const result = await prisma.accountTransaction.findMany({
        where: { schoolId },
        include: { category: true, vendor: true, financialYear: true },
        orderBy: { date: 'desc' }
    });
    return JSON.parse(JSON.stringify(result));
}

/**
 * Enhanced transaction fetch with source tagging, optional financial year filter,
 * and full related data.
 */
export async function getTransactionsEnhanced(slug: string, financialYearId?: string) {
    const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
    if (!school) return [];

    const txns = await prisma.accountTransaction.findMany({
        where: {
            schoolId: school.id,
            ...(financialYearId ? { financialYearId } : {})
        },
        include: { category: true, vendor: true, financialYear: true },
        orderBy: { date: 'desc' }
    });

    // Tag each transaction with a derived source
    return JSON.parse(JSON.stringify(txns.map(txn => ({
        ...txn,
        source: deriveSource(txn),
    }))));
}

function deriveSource(txn: any): 'TRANSPORT' | 'FEE' | 'PAYROLL' | 'MANUAL' {
    if (txn.sourceTransportExpenseId || txn.transactionNo?.startsWith('TRX-TRP-')) return 'TRANSPORT';
    if (txn.transactionNo?.startsWith('TXN-FEE-') || txn.category?.name?.toLowerCase().includes('fee')) return 'FEE';
    if (txn.transactionNo?.startsWith('TXN-PAY-') || txn.category?.name?.toLowerCase().includes('payroll') || txn.category?.name?.toLowerCase().includes('salary')) return 'PAYROLL';
    return 'MANUAL';
}

/**
 * Transaction statistics for the current (or specified) financial year.
 */
export async function getTransactionStats(slug: string, financialYearId?: string) {
    const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
    if (!school) return null;

    let activeYearId = financialYearId;
    if (!activeYearId) {
        const activeYear = await prisma.accountFinancialYear.findFirst({
            where: { schoolId: school.id, isActive: true }
        });
        activeYearId = activeYear?.id;
    }

    const allTxns = await prisma.accountTransaction.findMany({
        where: {
            schoolId: school.id,
            ...(activeYearId ? { financialYearId: activeYearId } : {})
        },
        select: { type: true, amount: true, date: true, status: true, sourceTransportExpenseId: true, transactionNo: true, category: { select: { name: true } } }
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalIncome = 0, totalExpense = 0, pendingAmount = 0, pendingCount = 0, thisMonthNet = 0;
    const categoryTotals: Record<string, number> = {};
    const sourceTotals: Record<string, number> = { TRANSPORT: 0, FEE: 0, PAYROLL: 0, MANUAL: 0 };

    for (const txn of allTxns) {
        const amount = txn.amount;
        const isCredit = txn.type === TransactionType.CREDIT;
        const completed = txn.status === TransactionStatus.COMPLETED;

        if (txn.status === TransactionStatus.PENDING) {
            pendingAmount += amount;
            pendingCount++;
        }

        if (completed) {
            if (isCredit) totalIncome += amount;
            else totalExpense += amount;
        }

        const txnDate = new Date(txn.date);
        if (txnDate >= thisMonthStart) {
            thisMonthNet += isCredit ? amount : -amount;
        }

        if (txn.category?.name) {
            categoryTotals[txn.category.name] = (categoryTotals[txn.category.name] || 0) + amount;
        }

        const src = deriveSource(txn);
        sourceTotals[src] = (sourceTotals[src] || 0) + amount;
    }

    const result = {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        pendingAmount,
        pendingCount,
        thisMonthNet,
        categoryTotals,
        sourceTotals,
        count: allTxns.length,
    };
    return JSON.parse(JSON.stringify(result));
}

/**
 * Delete a transaction (admin only).
 */
export async function deleteTransactionAction(slug: string, txnId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        if (!isAdmin) return { success: false, error: 'Only admins can delete transactions' };

        await prisma.accountTransaction.delete({ where: { id: txnId, schoolId: user.schoolId as string } });
        revalidatePath(`/s/${slug}/accounts`);
        revalidatePath(`/s/${slug}/accounts/transactions`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Record a new manual transaction.
 */
export async function createTransactionAction(slug: string, data: AccountTransactionInput) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };
        const user = auth.user;
        const schoolId = user.schoolId as string;

        const count = await prisma.accountTransaction.count({ where: { schoolId, financialYearId: data.financialYearId } });
        const transactionNo = `TXN-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        const result = await prisma.accountTransaction.create({
            data: {
                description: data.title || data.description || '',
                transactionNo,
                type: data.type,
                amount: data.amount,
                date: data.date,
                status: data.status || TransactionStatus.COMPLETED,
                reference: data.referenceNo,
                notes: data.description,
                schoolId,
                financialYearId: data.financialYearId,
                categoryId: data.categoryId || undefined,
                vendorId: data.vendorId || undefined,
                createdById: user.id,
            }
        });

        revalidatePath(`/s/${slug}/accounts`);
        revalidatePath(`/s/${slug}/accounts/transactions`);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// --- FINANCIAL SUMMARY (kept for dashboard) ---

export async function getFinancialSummary(schoolId: string, financialYearId?: string) {
    let activeYearId = financialYearId;
    if (!activeYearId) {
        const activeYear = await prisma.accountFinancialYear.findFirst({ where: { schoolId, isActive: true } });
        if (!activeYear) return null;
        activeYearId = activeYear.id;
    }

    const transactions = await prisma.accountTransaction.findMany({
        where: { schoolId, financialYearId: activeYearId, status: TransactionStatus.COMPLETED },
        select: { type: true, amount: true, date: true }
    });

    let totalIncome = 0, totalExpense = 0;
    for (const txn of transactions) {
        if (txn.type === TransactionType.CREDIT) totalIncome += txn.amount;
        else if (txn.type === TransactionType.DEBIT) totalExpense += txn.amount;
    }

    return JSON.parse(JSON.stringify({ totalIncome, totalExpense, netBalance: totalIncome - totalExpense, count: transactions.length }));
}
