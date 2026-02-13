"use client";

import { TrendingUp, Users, ArrowUpRight } from "lucide-react";

export function ConversionForecast({ forecast }: { forecast?: any }) {
    return (
        <div className="bg-zinc-900 rounded-[32px] p-6 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-12 opacity-5">
                <TrendingUp className="h-64 w-64" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-brand" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">AI Forecast</h3>
                </div>

                <div className="mb-8">
                    <p className="text-4xl font-black mb-1">8 Admissions</p>
                    <p className="text-sm font-medium text-zinc-400">Predicted for this week (High Confidence)</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">Conversion Rate</p>
                                <p className="text-[10px] text-zinc-500">vs last week</p>
                            </div>
                        </div>
                        <span className="text-green-400 font-black">{forecast?.conversionRate || "+0%"}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">Pipeline Health</p>
                                <p className="text-[10px] text-zinc-500">Active engagement</p>
                            </div>
                        </div>
                        <span className="text-brand font-black">{forecast?.pipelineHealth || "Stable"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
