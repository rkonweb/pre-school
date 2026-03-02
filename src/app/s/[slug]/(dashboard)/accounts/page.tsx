import { getFinancialSummary, getTransactionsEnhanced, getFinancialYears } from "@/app/actions/account-actions";
import { getFinancialChartData, getCategoryExpenses } from "@/app/actions/chart-actions";
import { prisma } from "@/lib/prisma";
import { getCurrencySymbol } from "@/lib/utils";
import DashboardClient from "./DashboardClient";

export default async function AccountsDashboard(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const school = await prisma.school.findUnique({ where: { slug }, select: { id: true, currency: true } })
    if (!school) return <div>School not found</div>;

    const schoolId = school.id;
    const years = await getFinancialYears(schoolId);
    const activeYear = years.find(y => y.isActive) || years[0];

    const summary = await getFinancialSummary(schoolId, activeYear?.id);
    const recentTxns = await getTransactionsEnhanced(slug, activeYear?.id);

    const currencySymbol = getCurrencySymbol(school.currency || 'INR');

    const chartDataReq = await getFinancialChartData(slug, activeYear?.id);
    const categoryDataReq = await getCategoryExpenses(slug, activeYear?.id);

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <DashboardClient
                schoolSlug={slug}
                summary={summary || { totalIncome: 0, totalExpense: 0, netBalance: 0, count: 0 }}
                recentTxns={recentTxns}
                currencySymbol={currencySymbol}
                activeYearName={activeYear?.name || 'Current Year'}
                chartData={chartDataReq.success ? chartDataReq.data : []}
                categoryData={categoryDataReq.success ? categoryDataReq.data : []}
            />
        </div>
    );
}
