"use client";

import { useAI } from "@/context/AIContext";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

export function LeadScoreChip({ score, size = "md" }: { score: number, size?: "sm" | "md" | "lg" }) {
    const { getScoreBand } = useAI();
    const band = getScoreBand(score);

    return (
        <div className={cn(
            "flex items-center gap-1.5 rounded-full font-black uppercase tracking-widest border transition-all shadow-sm",
            band.color,
            size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]",
            size === "lg" && "px-4 py-1.5 text-xs ring-4 ring-opacity-20"
        )}>
            <span>{band.icon}</span>
            <span>{band.label} {score}</span>
        </div>
    );
}

export function RiskAlertBadge({ risk }: { risk: { label: string, severity: string } }) {
    if (!risk) return null;
    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 shadow-sm animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-tight">{risk.label}</span>
        </div>
    );
}

export function NextBestActionCard({ nba, onExecute }: { nba: any, onExecute?: () => void }) {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand/5 to-transparent border border-brand/10 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={onExecute}>
            <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-8 w-8 text-brand" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-brand tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Recommendation
                </span>
                <p className="text-sm font-bold text-zinc-900 leading-tight">{nba.label}</p>
                <p className="text-[10px] text-zinc-500 font-medium line-clamp-1">{nba.reason}</p>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-brand opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                Execute Action <ArrowRight className="h-3 w-3" />
            </div>
        </div>
    );
}
