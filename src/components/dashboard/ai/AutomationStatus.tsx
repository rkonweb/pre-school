import { useState } from "react";
import { useParams } from "next/navigation";
import { useAI } from "@/context/AIContext";
import { Zap, Clock, PauseCircle, PlayCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toggleLeadAutomationAction } from "@/app/actions/admission-actions";
import { toast } from "sonner";

export function AutomationStatus({ lead }: { lead: any }) {
    const params = useParams();
    const slug = params.slug as string;
    const [isUpdating, setIsUpdating] = useState(false);

    const isPaused = lead.automationPaused;
    const status = isPaused ? "paused" : "active";

    const handleToggle = async () => {
        setIsUpdating(true);
        const nextState = isPaused; // if currently paused, nextState is active (true)
        const res = await toggleLeadAutomationAction(slug, lead.id, nextState);
        if (res.success) {
            toast.success(`Autopilot ${nextState ? "Resumed" : "Paused"}`);
        } else {
            toast.error("Failed to update Autopilot status");
        }
        setIsUpdating(false);
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-8 opacity-5">
                <Zap className="h-32 w-32 rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg",
                            status === "active" ? "bg-brand text-[var(--secondary-color)]" : "bg-zinc-800 text-zinc-400"
                        )}>
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wide">Autopilot</h3>
                            <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                                {status === "active" ? "Running" : "Paused"}
                            </p>
                        </div>
                    </div>
                    {status === "active" ? (
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    ) : (
                        <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                    )}
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                        <Clock className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-zinc-100">AI Engagement Logic</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                                {status === "active"
                                    ? "Monitoring behavior for next best action"
                                    : "Manual follow-up required"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleToggle}
                        disabled={isUpdating}
                        variant={status === "active" ? "outline" : "default"}
                        className={cn(
                            "h-8 flex-1 text-[10px] font-black uppercase tracking-widest gap-2",
                            status === "active"
                                ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                : "bg-brand hover:bg-brand/90 text-[var(--secondary-color)]"
                        )}
                    >
                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (
                            status === "active" ? <PauseCircle className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />
                        )}
                        {status === "active" ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="outline" className="h-8 w-8 px-0 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                        <AlertTriangle className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
