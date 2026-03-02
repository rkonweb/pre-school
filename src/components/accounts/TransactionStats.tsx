'use client';

import { ArrowUpRight, ArrowDownRight, Scale, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionStatsProps {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    pendingAmount: number;
    pendingCount: number;
    thisMonthNet: number;
    currency: string;
}

function fmt(n: number, currency: string) {
    return `${currency}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TransactionStats({
    totalIncome, totalExpense, netBalance, pendingAmount, pendingCount, thisMonthNet, currency
}: TransactionStatsProps) {
    const cards = [
        {
            label: "Total Income",
            value: fmt(totalIncome, currency),
            prefix: "+",
            icon: ArrowUpRight,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
            iconBg: "bg-emerald-100 text-emerald-600",
        },
        {
            label: "Total Expenses",
            value: fmt(totalExpense, currency),
            prefix: "-",
            icon: ArrowDownRight,
            color: "text-red-500",
            bg: "bg-red-50 border-red-100",
            iconBg: "bg-red-100 text-red-500",
        },
        {
            label: "Net Balance",
            value: fmt(netBalance, currency),
            prefix: netBalance >= 0 ? "+" : "-",
            icon: Scale,
            color: netBalance >= 0 ? "text-blue-600" : "text-orange-600",
            bg: netBalance >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100",
            iconBg: netBalance >= 0 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600",
        },
        {
            label: `Pending (${pendingCount})`,
            value: fmt(pendingAmount, currency),
            prefix: "",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100",
            iconBg: "bg-amber-100 text-amber-600",
        },
        {
            label: "This Month",
            value: fmt(thisMonthNet, currency),
            prefix: thisMonthNet >= 0 ? "+" : "-",
            icon: TrendingUp,
            color: thisMonthNet >= 0 ? "text-violet-600" : "text-rose-600",
            bg: thisMonthNet >= 0 ? "bg-violet-50 border-violet-100" : "bg-rose-50 border-rose-100",
            iconBg: thisMonthNet >= 0 ? "bg-violet-100 text-violet-600" : "bg-rose-100 text-rose-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={cn(
                        "rounded-2xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow",
                        card.bg
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{card.label}</span>
                        <div className={cn("p-1.5 rounded-xl", card.iconBg)}>
                            <card.icon className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <p className={cn("text-xl font-black tabular-nums leading-none", card.color)}>
                        {card.prefix}{card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
