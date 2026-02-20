"use client";

import { Users, TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
    stats: {
        today: number;
        week: number;
        month: number;
        total: number;
        conversionRate: string;
        overdueCount: number;
    } | null;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const today = stats?.today || 0;
    const week = stats?.week || 0;
    const conversion = parseInt(stats?.conversionRate || "0");
    const overdue = stats?.overdueCount || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Main Stat: Total Enquiries (Large) */}
            <div className="md:col-span-2 rounded-[32px] bg-zinc-900 text-white p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/30 transition-all duration-700" />

                <div className="relative z-10 flex justify-between items-start">
                    <div className="p-3 bg-white/10 rounded-2xl w-fit backdrop-blur-md">
                        <Users className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-zinc-400 bg-white/5 pl-2 pr-3 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">+{week}</span>
                        <span>this week</span>
                    </div>
                </div>

                <div className="relative z-10 mt-8">
                    <h3 className="text-5xl font-black tracking-tighter mb-1">{stats?.total || 0}</h3>
                    <p className="text-zinc-400 font-medium text-sm uppercase tracking-widest">Total Enquiries</p>
                </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-[32px] bg-white border border-zinc-200 p-6 flex flex-col justify-between shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-100 text-green-700 rounded-2xl w-fit">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-zinc-400 block">Conversion</span>
                    </div>
                </div>

                <div className="relative">
                    <h3 className="text-4xl font-black text-zinc-900 tracking-tighter">{conversion}%</h3>
                    <p className="text-xs text-zinc-500 font-bold mt-1">Enrollment Rate</p>

                    {/* Mini Progress Bar */}
                    <div className="mt-4 h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${conversion}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Overdue / Action Required */}
            <div className={cn(
                "rounded-[32px] border p-6 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all",
                overdue > 0
                    ? "bg-red-50 border-red-100 shadow-red-100/50"
                    : "bg-white border-zinc-200 shadow-zinc-200/40"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "p-3 rounded-2xl w-fit transition-colors",
                        overdue > 0 ? "bg-red-200 text-red-700" : "bg-zinc-100 text-zinc-500"
                    )}>
                        <AlertCircle className="h-5 w-5" />
                    </div>
                </div>

                <div>
                    <h3 className={cn(
                        "text-4xl font-black tracking-tighter",
                        overdue > 0 ? "text-red-600" : "text-zinc-900"
                    )}>
                        {overdue}
                    </h3>
                    <p className={cn(
                        "text-xs font-bold mt-1 uppercase tracking-wide",
                        overdue > 0 ? "text-red-400" : "text-zinc-500"
                    )}>
                        Pending Follow-ups
                    </p>
                </div>
            </div>

            {/* Today's Activity */}
            <div className="rounded-[32px] bg-brand text-[var(--secondary-color)] p-6 flex flex-col justify-between shadow-xl shadow-brand/20 relative overflow-hidden md:col-span-2 lg:col-span-4 xl:col-span-1">
                <div className="flex justify-between items-start">
                    <p className="text-xs font-black uppercase tracking-widest text-[var(--secondary-color)] opacity-60">Today</p>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-black tracking-tighter">{today}</h3>
                    <p className="text-xs font-bold text-[var(--secondary-color)] opacity-80 mt-1">New Leads Today</p>
                </div>
            </div>
        </div>
    );
}
