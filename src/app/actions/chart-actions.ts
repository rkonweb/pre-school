'use server';

import { prisma } from '@/lib/prisma';
import { TransactionType, TransactionStatus } from '@/lib/types/accounts';

export async function getFinancialChartData(schoolSlug: string, financialYearId?: string) {
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug }, select: { id: true } });
    if (!school) return { success: false, data: [] };

    let activeYearId = financialYearId;
    if (!activeYearId) {
        const activeYear = await prisma.accountFinancialYear.findFirst({
            where: { schoolId: school.id, isActive: true }
        });
        activeYearId = activeYear?.id;
    }

    const txns = await prisma.accountTransaction.findMany({
        where: {
            schoolId: school.id,
            status: TransactionStatus.COMPLETED,
            ...(activeYearId ? { financialYearId: activeYearId } : {})
        },
        select: { amount: true, type: true, date: true }
    });

    // Initialize months (Apr-Mar or Jan-Dec, typically Indian orgs use Apr-Mar, but let's just group by actual month-year string for simplicity or robust 12-month array)
    const monthMap = new Map<string, { month: string, income: number, expense: number, dateVal: number }>();

    for (const txn of txns) {
        const d = new Date(txn.date);
        const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('en-GB', { month: 'short' });

        if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, { month: monthName, income: 0, expense: 0, dateVal: d.getTime() });
        }

        const entry = monthMap.get(monthKey)!;
        if (txn.type === TransactionType.CREDIT) {
            entry.income += txn.amount;
        } else {
            entry.expense += txn.amount;
        }
    }

    // Sort chronologically and format
    const sorted = Array.from(monthMap.values()).sort((a, b) => a.dateVal - b.dateVal);

    // Take exactly last 12 active months if too long
    const finalData = sorted.map(m => ({ month: m.month, income: m.income, expense: m.expense }));

    return { success: true, data: JSON.parse(JSON.stringify(finalData)) };
}

export async function getCategoryExpenses(schoolSlug: string, financialYearId?: string) {
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug }, select: { id: true } });
    if (!school) return { success: false, data: [] };

    let activeYearId = financialYearId;
    if (!activeYearId) {
        const activeYear = await prisma.accountFinancialYear.findFirst({
            where: { schoolId: school.id, isActive: true }
        });
        activeYearId = activeYear?.id;
    }

    const txns = await prisma.accountTransaction.findMany({
        where: {
            schoolId: school.id,
            status: TransactionStatus.COMPLETED,
            type: TransactionType.DEBIT,
            ...(activeYearId ? { financialYearId: activeYearId } : {})
        },
        include: { category: { select: { name: true } } }
    });

    const categoryMap = new Map<string, number>();

    for (const txn of txns) {
        const cat = txn.category?.name || 'Uncategorized';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + txn.amount);
    }

    const finalData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // sort descending by value

    return { success: true, data: JSON.parse(JSON.stringify(finalData)) };
}
