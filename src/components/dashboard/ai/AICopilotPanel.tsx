import { useEffect } from "react";
import { useAI } from "@/context/AIContext";
import { LeadScoreChip, RiskAlertBadge, NextBestActionCard } from "./AIComponents";
import { WhatsAppTemplates } from "./WhatsAppTemplates";
import { AutomationStatus } from "./AutomationStatus";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Phone, FileText, ChevronRight, X, Lightbulb, TrendingUp } from "lucide-react";

export function AICopilotPanel({ lead, onClose }: { lead: any, onClose?: () => void }) {
    const { getScoreBand, getNBA, getRisks, leadIntelligence, fetchLeadIntelligence } = useAI();

    useEffect(() => {
        if (lead?.id) {
            fetchLeadIntelligence(lead.id);
        }
    }, [lead?.id]);

    const intel = leadIntelligence[lead.id];
    const score = intel?.propensity || lead.score || 50;
    const band = getScoreBand(score);
    const nba = intel?.nba || getNBA(lead.id);
    const risks = intel?.risks || getRisks(lead.id);
    const sentiment = intel?.sentiment || "NEUTRAL";
    const sentimentScore = intel?.sentimentScore || 50;

    return (
        <div className="flex flex-col h-full bg-white border-l border-zinc-200 shadow-xl w-full max-w-sm lg:max-w-md">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand" />
                    <h2 className="font-black text-zinc-900 uppercase tracking-tight">AI Copilot</h2>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                    <AutomationStatus lead={lead} status={lead.score > 80 ? "active" : "paused"} />

                    {/* 1. Lead Intelligence */}
                    <section>
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Lightbulb className="h-3 w-3" /> Lead Intelligence
                        </h3>
                        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-700">Propensity to Convert</span>
                                <LeadScoreChip score={score} size="lg" />
                            </div>

                            {/* Sentiment Gauge */}
                            <div className="space-y-2 pt-2 border-t border-zinc-100">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Engagement Gradient</span>
                                    <span className={sentiment === "POSITIVE" ? "text-green-500" : sentiment === "NEGATIVE" ? "text-red-500" : "text-zinc-500"}>
                                        {sentiment}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden flex">
                                    <div
                                        className={`h-full transition-all duration-1000 ${sentiment === "POSITIVE" ? "bg-green-500" : sentiment === "NEGATIVE" ? "bg-red-500" : "bg-brand"}`}
                                        style={{ width: `${sentimentScore}%` }}
                                    />
                                </div>
                            </div>

                            {risks.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-zinc-100">
                                    <span className="text-xs font-bold text-red-400">Attention Needed:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {risks.map((r: any, i: number) => (
                                            <RiskAlertBadge key={i} risk={r} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-zinc-500 leading-relaxed">
                                <span className="font-bold text-zinc-900">{lead.parentName}</span> has shown <span className="font-bold text-zinc-900">{sentiment.toLowerCase()}</span> sentiment regarding the <span className="font-bold text-zinc-900">{lead.programInterested || 'Primary'}</span> program.
                                Engagement level is <span className={`font-bold ${band.color.split(' ')[1]}`}>{band.label}</span>.
                            </div>
                        </div>
                    </section>

                    {/* 2. Next Best Action */}
                    <section>
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Recommended Action</h3>
                        <NextBestActionCard nba={nba} onExecute={() => alert(`Executing: ${nba.label}`)} />

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button variant="outline" className="h-9 text-xs font-bold justify-start gap-2">
                                <Phone className="h-3 w-3" /> Call {lead.parentName}
                            </Button>
                            <Button variant="outline" className="h-9 text-xs font-bold justify-start gap-2">
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                            </Button>
                        </div>
                    </section>

                    {/* 3. Communication Assistant */}
                    <section className="h-[400px]">
                        <WhatsAppTemplates
                            onSelect={(t) => console.log('Selected', t)}
                            onSend={(t) => alert(`Sending WhatsApp: ${t.content}`)}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
