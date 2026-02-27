"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLoaderProps {
    message?: string;
    className?: string;
    iconClassName?: string;
}

export function DashboardLoader({
    message = "Loading content...",
    className,
    iconClassName
}: DashboardLoaderProps) {
    return (
        <div className={cn(
            "flex h-64 w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 dark:border-zinc-800 dark:bg-zinc-900/10",
            className
        )}>
            <div className="relative">
                <Loader2 className={cn("h-10 w-10 animate-spin text-brand/80", iconClassName)} />
                <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-brand/10 opacity-20" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {message}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 animate-pulse">
                    Please wait a moment
                </p>
            </div>
        </div>
    );
}
