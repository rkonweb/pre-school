import { prisma } from "@/lib/prisma";
import { getTransactionsEnhanced, getTransactionStats, getAccountCategories, getAccountVendors, getFinancialYears, getSchoolIdBySlug } from "@/app/actions/account-actions";
import TransactionsClient from "@/components/accounts/TransactionsClient";

export default async function TransactionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ fy?: string }>;
}) {
    const { slug } = await params;
    const sp = await searchParams;
    const selectedFYId = sp?.fy || '';

    const schoolId = await getSchoolIdBySlug(slug);

    const [transactions, stats, categories, vendors, financialYears] = await Promise.all([
        getTransactionsEnhanced(slug, selectedFYId || undefined),
        getTransactionStats(slug, selectedFYId || undefined),
        schoolId ? getAccountCategories(schoolId) : Promise.resolve([]),
        schoolId ? getAccountVendors(schoolId) : Promise.resolve([]),
        schoolId ? getFinancialYears(schoolId) : Promise.resolve([]),
    ]);

    // Determine the active FY to pre-select if none passed
    const activeYear = financialYears.find((y: any) => y.isActive);
    const effectiveFYId = selectedFYId || activeYear?.id || '';

    return (
        <TransactionsClient
            slug={slug}
            transactions={transactions}
            categories={categories as any[]}
            vendors={vendors}
            financialYears={financialYears as any[]}
            stats={stats}
            selectedFYId={effectiveFYId}
        />
    );
}
