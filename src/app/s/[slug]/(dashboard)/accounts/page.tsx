import Link from 'next/link';
import {
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Scale, ArrowRight,
    MoreHorizontal, CreditCard, Users, Settings, Briefcase
} from 'lucide-react';
import { getFinancialSummary, getTransactions, getFinancialYears } from "@/app/actions/account-actions";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/lib/types/accounts";
import { cn, getCurrencySymbol } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

export default async function AccountsDashboard(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    // We need the school ID somehow. Assuming we fetch it base on slug, or pass it if auth provides it.
    // For now, assuming you have a utility to get schoolId from slug or user session.
    // Since we don't have it explicitly here in this snippet, let's fetch it via Prisma or assume it's passed.
    // MOCKING for structural sake:
    const schoolId = "mock-school-id-replace-me"; // Replace with actual auth/slug-fetching logic later 

    const years = await getFinancialYears(schoolId);
    const activeYear = years.find(y => y.isActive) || years[0];

    const summary = await getFinancialSummary(schoolId, activeYear?.id);
    const recentTxns = await getTransactions(schoolId);

    const school = await prisma.school.findUnique({ where: { slug }, select: { currency: true } })
    const currencySymbol = getCurrencySymbol(school?.currency || 'INR');

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Overview</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Key metrics for {activeYear?.name || 'the current year'}.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-11 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl flex items-center justify-center shadow-sm transition-all outline-none"
                                title="More options"
                            >
                                <MoreHorizontal className="h-5 w-5 text-zinc-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52">
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/staff/payroll`} className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-zinc-400" />
                                    Staff Payroll
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/accounts/vendors`} className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-zinc-400" />
                                    Manage Vendors
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/accounts/settings`} className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-zinc-400" />
                                    Financial Settings
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Income Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 flex flex-col justify-between group hover:border-green-200 transition-colors">
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">YTD</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-500 mb-2">Total Income</p>
                        <h3 className="text-4xl font-black text-zinc-900 tabular-nums">
                            {currencySymbol}{summary?.totalIncome?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 flex flex-col justify-between group hover:border-red-200 transition-colors">
                    <div className="flex items-center justify-between mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">YTD</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-500 mb-2">Total Expenses</p>
                        <h3 className="text-4xl font-black text-zinc-900 tabular-nums">
                            {currencySymbol}{summary?.totalExpense?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>

                {/* Net Balance Card */}
                <div className="bg-zinc-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-zinc-900/50 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Background gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 border-0" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Current</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-white/60 mb-2">Net Balance</p>
                        <h3 className="text-4xl font-black text-white tabular-nums">
                            {currencySymbol}{summary?.netBalance?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-zinc-900">Recent Transactions</h2>
                    <Link
                        href={`/s/${slug}/accounts/transactions`}
                        className="text-sm font-bold text-brand hover:text-brand/80 flex items-center gap-1 group"
                    >
                        View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Main Content Card for Table */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto min-h-0">
                        <div className="min-w-[800px] p-0 m-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Details</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Date / ID</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Category</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {recentTxns.slice(0, 5).map((txn) => {
                                        const isCredit = txn.type === TransactionType.CREDIT;
                                        return (
                                            <tr key={txn.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm",
                                                            isCredit ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-500 border border-red-100"
                                                        )}>
                                                            {isCredit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-zinc-900 group-hover:text-brand transition-colors line-clamp-1">{txn.title}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <p className="text-sm font-bold text-zinc-900">{new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest mt-1.5">{txn.transactionNo}</p>
                                                </td>
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <span className="px-3 py-1.5 rounded-[0.5rem] bg-zinc-100 text-zinc-600 text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                        {txn.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <p className={cn(
                                                        "text-lg font-black tabular-nums",
                                                        isCredit ? "text-green-600" : "text-zinc-900"
                                                    )}>
                                                        {isCredit ? '+' : '-'}{currencySymbol}{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {recentTxns.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-16 text-center text-sm font-bold text-zinc-500 bg-zinc-50/30">
                                                No recent transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
