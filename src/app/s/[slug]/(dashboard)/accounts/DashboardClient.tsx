'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Scale, ArrowRight,
    MoreHorizontal, CreditCard, Users, Settings, Briefcase, Sparkles, AlertTriangle, Check
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { TransactionType } from "@/lib/types/accounts";
import { cn } from "@/lib/utils";
import { SectionHeader, ErpCard, Btn, StatusChip, tableStyles } from "@/components/ui/erp-ui";
import { generateAccountInsights } from '@/app/actions/ai-account-actions';
import { toast } from 'sonner';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function DashboardClient({
    schoolSlug,
    summary,
    recentTxns,
    currencySymbol,
    activeYearName,
    chartData,
    categoryData
}: {
    schoolSlug: string;
    summary: any;
    recentTxns: any[];
    currencySymbol: string;
    activeYearName: string;
    chartData: any[]; // { month, income, expense }
    categoryData: any[]; // { name, value }
}) {
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiInsights, setAiInsights] = useState<{
        insights: string[],
        suspiciousTransactions: { transactionId: string, reason: string }[]
    } | null>(null);

    const handleGenerateInsights = async () => {
        setIsGeneratingAI(true);
        try {
            const res = await generateAccountInsights(schoolSlug);
            if (res.success && res.data) {
                setAiInsights(res.data as any);
                toast.success("AI Analysis Complete!");
            } else {
                toast.error(res.error || "Failed to generate insights.");
            }
        } catch (e) {
            toast.error("An error occurred connecting to AI.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Helper to check if a txn is flagged
    const getFlaggedReason = (txnId: string) => {
        return aiInsights?.suspiciousTransactions.find(t => t.transactionId === txnId)?.reason;
    };

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Financial Overview"
                subtitle={`Key metrics for ${activeYearName}.`}
                icon={TrendingUp}
                action={
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
                                    <Link href={`/s/${schoolSlug}/staff/payroll`} className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-zinc-400" />
                                        Staff Payroll
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${schoolSlug}/accounts/vendors`} className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-zinc-400" />
                                        Manage Vendors
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/s/${schoolSlug}/accounts/settings`} className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-zinc-400" />
                                        Financial Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 xl:px-0">
                {/* Income Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50/20 rounded-[2rem] p-8 border border-emerald-100 shadow-xl shadow-emerald-500/5 flex flex-col justify-between group hover:border-emerald-200 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center backdrop-blur-sm border border-emerald-200/50">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 bg-emerald-100/50 px-2 py-1 rounded-md">YTD</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-emerald-700/60 mb-2">Total Income</p>
                        <h3 className="text-4xl font-black text-emerald-950 tabular-nums">
                            {currencySymbol}{summary?.totalIncome?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="bg-gradient-to-br from-white to-rose-50/20 rounded-[2rem] p-8 border border-rose-100 shadow-xl shadow-rose-500/5 flex flex-col justify-between group hover:border-rose-200 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-rose-500" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100/50 flex items-center justify-center backdrop-blur-sm border border-rose-200/50">
                            <TrendingDown className="w-6 h-6 text-rose-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600/60 bg-rose-100/50 px-2 py-1 rounded-md">YTD</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-rose-700/60 mb-2">Total Expenses</p>
                        <h3 className="text-4xl font-black text-rose-950 tabular-nums">
                            {currencySymbol}{summary?.totalExpense?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>

                {/* Net Balance Card */}
                <div className="bg-zinc-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-zinc-900/50 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 border-0" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded-md">Current</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-white/60 mb-2">Net Balance</p>
                        <h3 className="text-4xl font-black text-white tabular-nums">
                            {currencySymbol}{summary?.netBalance?.toLocaleString('en-IN') || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 xl:px-0">
                {/* Monthly Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-6 md:p-8">
                    <h3 className="text-lg font-black text-zinc-900 mb-6">Revenue vs Expenses (Monthly)</h3>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f4f4f5', opacity: 0.5 }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${currencySymbol}${value.toLocaleString('en-IN')}`, undefined]}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#3f3f46' }} />
                                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                <BarChart className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No monthly data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-6 md:p-8 flex flex-col">
                    <h3 className="text-lg font-black text-zinc-900 mb-6">Top Expenses by Category</h3>
                    <div className="h-[300px] w-full flex-grow flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${currencySymbol}${value.toLocaleString('en-IN')}`, undefined]}
                                    />
                                    <Legend
                                        iconType="circle"
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 600, lineHeight: '14px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-400">
                                <PieChart className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No expense category data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Insights & Anomalies Panel */}
            <div className="px-4 xl:px-0">
                <div className="bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-[2.5rem] p-6 text-brand relative overflow-hidden shadow-lg shadow-brand/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 border-0 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <h3 className="text-2xl font-black flex items-center gap-2">
                                    <Sparkles className="w-6 h-6" /> AI Financial Analyst
                                </h3>
                                <p className="text-sm font-medium text-brand/70 leading-relaxed">
                                    Scan recent transactions to generate business insights and flag unusually large, mistyped, or suspicious off-hour manual entries.
                                </p>
                            </div>
                            <Btn
                                onClick={handleGenerateInsights}
                                disabled={isGeneratingAI}
                                variant="primary"
                                icon={Sparkles}
                                loading={isGeneratingAI}
                            >
                                {isGeneratingAI ? "Scanning Data..." : "Generate Insights"}
                            </Btn>
                        </div>

                        {aiInsights && (
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                                {/* Insights */}
                                <div className="bg-white/60 dark:bg-zinc-950/60 rounded-2xl p-6 backdrop-blur-md border border-brand/10">
                                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" /> Business Insights
                                    </h4>
                                    <ul className="space-y-4">
                                        {aiInsights.insights.map((insight, i) => (
                                            <li key={i} className="flex gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-brand text-[var(--secondary-color)] flex items-center justify-center text-xs">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="leading-snug">{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Anomalies */}
                                <div className="bg-white/60 dark:bg-zinc-950/60 rounded-2xl p-6 backdrop-blur-md border border-brand/10">
                                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-rose-600">
                                        <AlertTriangle className="w-5 h-5" /> Flagged Anomalies
                                    </h4>
                                    {aiInsights.suspiciousTransactions.length > 0 ? (
                                        <ul className="space-y-4">
                                            {aiInsights.suspiciousTransactions.map((anom, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                                        <AlertTriangle className="w-3 h-3" />
                                                    </div>
                                                    <div>
                                                        <span className="leading-snug block">{anom.reason}</span>
                                                        <Link href={`/s/${schoolSlug}/accounts/transactions`} className="text-xs font-bold text-rose-600 mt-1 hover:underline">
                                                            Review Transaction ID: {anom.transactionId.slice(-6)} &rarr;
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-center">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                                                <Check className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-900">All Clear!</p>
                                            <p className="text-xs text-zinc-500 font-medium mt-1">No suspicious activities found in recent data.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="pt-4 px-4 xl:px-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-zinc-900">Recent Transactions</h2>
                    <Link
                        href={`/s/${schoolSlug}/accounts/transactions`}
                        className="text-sm font-bold text-brand hover:text-brand/80 flex items-center gap-1 group"
                    >
                        View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div style={tableStyles.container}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={tableStyles.thead}>
                            <tr>
                                <th style={tableStyles.thNoSort}>Details</th>
                                <th style={tableStyles.thNoSort}>Date / ID</th>
                                <th style={tableStyles.thNoSort}>Category</th>
                                <th style={{ ...tableStyles.thNoSort, textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTxns.slice(0, 10).map((txn, i) => {
                                const isCredit = txn.type === TransactionType.CREDIT;
                                const flagReason = getFlaggedReason(txn.id);

                                return (
                                    <tr
                                        key={txn.id}
                                        className="group"
                                        style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                        onMouseEnter={e => {
                                            (e.currentTarget).style.background = flagReason ? "#FFE4E6" : "#FFFBEB";
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget).style.background = i % 2 === 0 ? (flagReason ? "#FFE4E6" : "white") : (flagReason ? "#FFE4E6" : "#F9FAFB");
                                        }}
                                    >
                                        <td style={tableStyles.td}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                    isCredit ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-zinc-50 text-zinc-500 border border-zinc-200",
                                                    flagReason && "bg-rose-100 border-rose-200 text-rose-600"
                                                )}>
                                                    {flagReason ? <AlertTriangle className="w-5 h-5" /> : (isCredit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className={cn(
                                                            "text-[15px] font-bold transition-colors line-clamp-1",
                                                            flagReason ? "text-rose-900 group-hover:text-rose-700" : "text-zinc-900 group-hover:text-brand"
                                                        )}>{txn.description || txn.title || 'Untitled Transaction'}</p>
                                                        {flagReason && (
                                                            <span className="hidden group-hover:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-200 text-rose-800 animate-in fade-in">
                                                                Flagged
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[13px] text-zinc-500 font-medium mt-0.5">{txn.vendor?.name || 'No Vendor'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <p className="text-sm font-bold text-zinc-900">{new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-[11px] font-semibold font-mono text-zinc-500 mt-1">{txn.transactionNo}</p>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-[0.5rem] text-[11px] font-bold shadow-sm",
                                                flagReason ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-700"
                                            )}>
                                                {txn.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td style={{ ...tableStyles.td, textAlign: 'right' }}>
                                            <p className={cn(
                                                "text-[15px] font-extrabold tabular-nums",
                                                isCredit ? "text-emerald-600" : (flagReason ? "text-rose-600" : "text-zinc-900")
                                            )}>
                                                {isCredit ? '+' : '-'}{currencySymbol}{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            {flagReason && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1 bg-white inline-block px-2 py-0.5 rounded border border-rose-100">Review Required</p>
                                            )}
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
    );
}
