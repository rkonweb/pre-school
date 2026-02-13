"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AI_KPI_Tiles } from "@/components/dashboard/ai/AI_KPI_Tiles";
import { PrioritizedWorklist } from "@/components/dashboard/ai/PrioritizedWorklist";
import { ConversionForecast } from "@/components/dashboard/ai/ConversionForecast";
import { AIProvider } from "@/context/AIContext";
import { Sparkles, Loader2 } from "lucide-react";
import { getAIDashboardDataAction } from "@/app/actions/admission-actions";

export default function AIDashboardPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const res = await getAIDashboardDataAction(slug);
        if (res.success) {
            setData(res.data);
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center gap-4 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-xs font-black uppercase tracking-widest animate-pulse">Initializing AI Models...</p>
            </div>
        );
    }

    return (
        <AIProvider>
            <div className="flex flex-col gap-8 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-brand" />
                            AI Command Center
                        </h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            Real-time insights & prioritized actions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">AI Online</span>
                    </div>
                </div>

                {/* KPI Tiles */}
                <AI_KPI_Tiles data={data?.kpis} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Worklist (Left 2/3) */}
                    <div className="lg:col-span-2">
                        <PrioritizedWorklist leads={data?.worklist} />
                    </div>

                    {/* Forecast & Insights (Right 1/3) */}
                    <div className="flex flex-col gap-8">
                        <ConversionForecast forecast={data?.forecast} />

                        {/* Drop-off Risk Mini-list */}
                        <div className="bg-white rounded-[32px] border border-zinc-200 p-6 shadow-sm">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-4">At Risk (High Probability)</h3>
                            <div className="space-y-4">
                                {(data?.worklist?.filter((l: any) => l.score < 50).slice(0, 3) || []).map((lead: any) => (
                                    <div key={lead.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-black">
                                                {lead.score}%
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">{lead.name}</p>
                                                <p className="text-[10px] text-zinc-500">Low Engagement</p>
                                            </div>
                                        </div>
                                        <button className="text-[10px] font-black uppercase text-brand hover:underline">Review</button>
                                    </div>
                                ))}
                                {(!data?.worklist?.some((l: any) => l.score < 50)) && (
                                    <p className="text-[10px] text-zinc-400 font-bold italic">No high-risk leads detected.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AIProvider>
    );
}
