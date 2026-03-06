'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, History, Gauge } from "lucide-react";

export default function ReportTabs({ slug }: { slug: string }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Live Telemetry Logs", href: `/s/${slug}/transport/reports/daily`, icon: Gauge },
        { name: "Global Performance Index", href: `/s/${slug}/transport/reports/monthly`, icon: History },
    ];

    return (
        <div className="flex items-center gap-2 bg-zinc-100/80 p-2 rounded-[24px] w-fit border border-zinc-200">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            isActive
                                ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20"
                                : "text-zinc-500 hover:text-zinc-900 hover:bg-white"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", isActive ? "text-brand" : "text-zinc-300")} />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
