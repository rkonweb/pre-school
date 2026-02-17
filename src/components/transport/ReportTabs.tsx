'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp } from "lucide-react";

export default function ReportTabs({ slug }: { slug: string }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Daily Logs", href: `/s/${slug}/transport/reports/daily`, icon: Clock },
        { name: "Monthly Analytics", href: `/s/${slug}/transport/reports/monthly`, icon: TrendingUp },
    ];

    return (
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            isActive
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700 hover:bg-white/50"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", isActive ? "text-brand" : "text-zinc-400")} />
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
