"use client";

import { useState } from "react";
import {
    TrendingUp, AlertCircle, ShoppingCart,
    ArrowUpRight, ArrowDownRight, Activity, CalendarDays,
    Coffee, Utensils, Zap, Database, Search, PlusCircle, CreditCard, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import { useSidebar } from "@/context/SidebarContext";

function MetricCard({ title, value, sub, icon: Icon, trend, colorClass }: any) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorClass.bg}`}>
                    <Icon className={`h-5 w-5 ${colorClass.text}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
                    {sub && <span className="text-xs font-medium text-slate-400 mb-1">{sub}</span>}
                </div>
            </div>
        </div>
    );
}

// ——— Main Component ———
export default function CanteenDashboardClient({ slug, initialData }: { slug: string, initialData: any }) {
    if (!initialData) {
        return (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
                <Database className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Analytics Data</h3>
                <p className="text-sm mt-1">Failed to load canteen AI insights. Please check database connection.</p>
            </div>
        );
    }

    const { kpi, aiInsights } = initialData;
    const { currency } = useSidebar();
    const fmt = (n: number) => `${currency}${n.toLocaleString("en-IN")}`;

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-64px)] overflow-y-auto">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Activity className="h-6 w-6 text-orange-500" />
                        Canteen Intelligence
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm text-balance max-w-2xl">
                        Real-time sales velocity, AI-driven stock predictions, and overarching financial health of the POS and wallets.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={`/s/${slug}/canteen/pos`}
                        className="h-11 px-6 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-200 transition-all border-none"
                    >
                        <CreditCard className="h-4 w-4" />
                        Open POS
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-11 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center shadow-sm transition-all outline-none"
                                title="More options"
                            >
                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52">
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/canteen/menu`} className="flex items-center gap-2">
                                    <Utensils className="h-4 w-4 text-slate-400" />
                                    Manage Menu
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/canteen/packages`} className="flex items-center gap-2">
                                    <PlusCircle className="h-4 w-4 text-slate-400" />
                                    Food Packages
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/s/${slug}/canteen/billing`} className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-slate-400" />
                                    Transactions
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard
                    title="Today's Revenue"
                    value={fmt(kpi.todayRevenue)}
                    sub={`${kpi.todayOrders} orders`}
                    icon={TrendingUp}
                    trend={12}
                    colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }}
                />
                <MetricCard
                    title="Monthly Revenue"
                    value={fmt(kpi.monthRevenue)}
                    sub={`${kpi.monthOrders} orders`}
                    icon={CalendarDays}
                    trend={5}
                    colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                />
                <MetricCard
                    title="Active Subscriptions"
                    value={kpi.activeSubscriptions}
                    sub="Recurring profiles"
                    icon={Coffee}
                    colorClass={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                />
                <MetricCard
                    title={`Low Wallets (< ${currency}100)`}
                    value={kpi.lowBalanceWallets}
                    sub="Require top-up"
                    icon={AlertCircle}
                    colorClass={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                />
            </div>

            {/* ── AI Insights ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Predictions Panel */}
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Zap className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-bold">AI Forecast & Alerts</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">7-Day Revenue Forecast</p>
                                <p className="text-2xl font-black">{fmt(Math.round(aiInsights.forecastNext7Days))}</p>
                                <p className="text-sm mt-2 text-indigo-100/70">Based on trailing moving average</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Highest Demand</p>
                                <p className="text-2xl font-black">{aiInsights.topCategory}</p>
                                <p className="text-sm mt-2 text-indigo-100/70">Category trending up this week</p>
                            </div>
                        </div>

                        {aiInsights.isHolidayApproaching && (
                            <div className="mt-4 bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-3 flex gap-3 text-yellow-100">
                                <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
                                <div className="text-sm">
                                    <p className="font-bold text-yellow-300">Weekend / Holiday Approaching</p>
                                    <p className="opacity-80 mt-0.5">Expect lower volume. Consider adjusting perishable prep quantities.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Velocity Lists */}
                <div className="flex flex-col gap-6">

                    {/* Fast Moving */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <h3 className="font-bold text-slate-800">Fast Moving (7d)</h3>
                        </div>
                        <div className="space-y-3">
                            {aiInsights.fastMoving.length > 0 ? aiInsights.fastMoving.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{item.count}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Sold</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500 italic">Not enough data.</p>
                            )}
                        </div>
                    </div>

                    {/* Slow Moving */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                            <h3 className="font-bold text-slate-800">Slow Moving / Dead Stock</h3>
                        </div>
                        <div className="space-y-3">
                            {aiInsights.slowMoving.length > 0 ? aiInsights.slowMoving.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{item.count}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Sold</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-green-600 italic font-medium flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5" /> All items selling well!</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
