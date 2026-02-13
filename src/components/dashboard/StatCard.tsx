"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    trend?: {
        value: number | string;
        isPositive: boolean;
    };
    icon: LucideIcon;
    color?: "blue" | "green" | "purple" | "orange" | "red" | "zinc" | "brand";
}

const colorStyles = {
    blue: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand border-brand/20 dark:border-brand/30",
    brand: "bg-brand-soft text-brand dark:bg-brand/20 dark:text-brand border-brand/10 dark:border-brand/30",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-900/30",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-900/30",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-900/30",
    zinc: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900/20 dark:text-zinc-400 border-zinc-100 dark:border-zinc-900/30",
};

export function StatCard({ title, value, subValue, trend, icon: Icon, color = "blue" }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", colorStyles[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                        trend.isPositive ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {typeof trend.value === 'number' ? `${trend.value}%` : trend.value}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</h3>
                {subValue && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{subValue}</p>}
            </div>
        </div>
    );
}
