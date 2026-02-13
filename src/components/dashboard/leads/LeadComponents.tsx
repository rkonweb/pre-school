import { cn } from "@/lib/utils";

export const LEAD_STATUSES = [
    { id: "NEW", label: "New Lead", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { id: "CONTACTED", label: "Contacted", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
    { id: "INTERESTED", label: "Interested", color: "text-purple-700 bg-purple-50 border-purple-200" },
    { id: "TOUR_SCHEDULED", label: "Tour Scheduled", color: "text-orange-700 bg-orange-50 border-orange-200" },
    { id: "TOUR_COMPLETED", label: "Tour Completed", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { id: "FOLLOWUP_PENDING", label: "Follow-up", color: "text-pink-700 bg-pink-50 border-pink-200" },
    { id: "ADMISSION_CONFIRMED", label: "Confirmed", color: "text-green-700 bg-green-50 border-green-200" },
    { id: "PAYMENT_COMPLETED", label: "Paid", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { id: "ENROLLED", label: "Enrolled", color: "text-brand bg-brand/5 border-brand/20" },
    { id: "CLOSED_LOST", label: "Lost", color: "text-zinc-500 bg-zinc-50 border-zinc-200" },
];

export function LeadStatusBadge({ status, className }: { status: string, className?: string }) {
    const config = LEAD_STATUSES.find(s => s.id === status) || LEAD_STATUSES[0];
    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none border shadow-sm transition-colors",
            config.color,
            className
        )}>
            {config.label}
        </span>
    );
}

export function LeadScoreChip({ score, className }: { score: number, className?: string }) {
    let band = { label: "COLD", color: "text-zinc-500", bg: "bg-zinc-100", bar: "bg-zinc-300" };
    if (score >= 80) band = { label: "HOT", color: "text-red-600", bg: "bg-red-50", bar: "bg-red-500" };
    else if (score >= 60) band = { label: "WARM", color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-500" };
    else if (score >= 40) band = { label: "COOL", color: "text-blue-600", bg: "bg-blue-50", bar: "bg-blue-500" };

    return (
        <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md border border-zinc-100 shadow-sm bg-white", className)}>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 animate-pulse", band.bar)} />
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-0.5">Score</span>
                <span className={cn("text-xs font-black leading-none", band.color)}>{score}</span>
            </div>
        </div>
    );
}
