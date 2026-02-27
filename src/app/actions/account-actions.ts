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
    return await prisma.accountFinancialYear.findMany({
        where: { schoolId },
        orderBy: { startDate: 'desc' }
    });
}

export async function createFinancialYear(schoolId: string, name: string, startDate: Date, endDate: Date) {
    const result = await prisma.accountFinancialYear.create({
        data: {
            name,
            startDate,
            endDate,
            schoolId,
            isActive: true, // Auto-set active initially
        }
    });
    revalidatePath(`/s/[slug]/accounts`);
    return result;
}

// --- CATEGORIES ---

export async function getAccountCategories(schoolId: string) {
    return await prisma.accountCategory.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });
}

export async function createAccountCategory(schoolId: string, data: AccountCategoryInput) {
    const result = await prisma.accountCategory.create({
        data: {
            ...data,
            schoolId,
            isSystem: false,
        }
    });
    revalidatePath(`/s/[slug]/accounts/settings`);
    return result;
}

// --- VENDORS ---

export async function getAccountVendors(schoolId: string) {
    return await prisma.accountVendor.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });
}

export async function createAccountVendor(schoolId: string, data: AccountVendorInput) {
    const result = await prisma.accountVendor.create({
        data: {
            ...data,
            schoolId,
        }
    });
    revalidatePath(`/s/[slug]/accounts/vendors`);
    return result;
}

// --- TRANSACTIONS ---

export async function getTransactions(schoolId: string) {
    return await prisma.accountTransaction.findMany({
        where: { schoolId },
        include: {
            category: true,
            vendor: true,
            financialYear: true,
        },
        orderBy: { date: 'desc' }
    });
}

export async function createTransaction(schoolId: string, createdById: string, data: AccountTransactionInput) {
    // Generate a unique transaction number (simple approach)
    const count = await prisma.accountTransaction.count({ where: { schoolId, financialYearId: data.financialYearId } });
    const transactionNo = `TXN-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const result = await prisma.accountTransaction.create({
        data: {
            ...data,
            transactionNo,
            schoolId,
            createdById,
        }
    });
    revalidatePath(`/s/[slug]/accounts`);
    revalidatePath(`/s/[slug]/accounts/transactions`);
    return result;
}

// --- FINANCIAL SUMMARY ---

export async function getFinancialSummary(schoolId: string, financialYearId?: string) {
    // If financialYearId is missing, try to find the active one
    let activeYearId = financialYearId;
    if (!activeYearId) {
        const activeYear = await prisma.accountFinancialYear.findFirst({
            where: { schoolId, isActive: true }
        });
        if (!activeYear) return null;
        activeYearId = activeYear.id;
    }

    const transactions = await prisma.accountTransaction.findMany({
        where: {
            schoolId,
            financialYearId: activeYearId,
            status: TransactionStatus.COMPLETED
        },
        select: {
            type: true,
            amount: true,
            date: true,
        }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((txn) => {
        if (txn.type === TransactionType.CREDIT) {
            totalIncome += txn.amount;
        } else if (txn.type === TransactionType.DEBIT) {
            totalExpense += txn.amount;
        }
    });

    const netBalance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netBalance, count: transactions.length };
}
