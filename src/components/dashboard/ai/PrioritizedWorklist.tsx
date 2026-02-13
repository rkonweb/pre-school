"use client";

import { useAI } from "@/context/AIContext";
import { LeadScoreChip, NextBestActionCard, RiskAlertBadge } from "./AIComponents";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

export function PrioritizedWorklist({ leads }: { leads?: any[] }) {
    const { getScoreBand, getNBA, getRisks } = useAI();

    const worklist = leads || [];

    return (
        <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">AI Prioritized Worklist</h3>
                    <p className="text-xs text-zinc-500 font-bold">Focus on these leads to maximize conversion</p>
                </div>
                <Button variant="outline" className="rounded-xl h-10 text-xs font-black uppercase tracking-widest">
                    View All
                </Button>
            </div>

            <div className="divide-y divide-zinc-100">
                {worklist.map((lead) => {
                    const nba = getNBA(lead.id);
                    const risks = getRisks(lead.id);

                    return (
                        <div key={lead.id} className="p-4 hover:bg-zinc-50 transition-colors grid grid-cols-12 gap-4 items-center">
                            {/* Lead Info */}
                            <div className="col-span-3">
                                <h4 className="font-bold text-zinc-900 text-sm">{lead.name}</h4>
                                <p className="text-xs text-zinc-500">Child: {lead.child}</p>
                            </div>

                            {/* Score & Risk */}
                            <div className="col-span-3 flex flex-col gap-2 items-start">
                                <LeadScoreChip score={lead.score} size="sm" />
                                {risks.map((r: any, i: number) => <RiskAlertBadge key={i} risk={r} />)}
                            </div>

                            {/* NBA */}
                            <div className="col-span-4">
                                <NextBestActionCard nba={nba} />
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-brand hover:bg-brand/10">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-green-600 hover:bg-green-100">
                                    <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
