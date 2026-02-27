'use client';

import { useState, use } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, RefreshCw, CheckCircle2 } from "lucide-react";
import { generateAccountInsights } from "@/app/actions/account-ai-actions";

export default function InsightsPage({ params }: { params: Promise<{ slug: string }> }) {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const { slug } = use(params);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateAccountInsights(slug);
            if (result.error) {
                setError(result.error);
            } else {
                setInsights(result);
            }
        } catch (err) {
            setError("An unexpected error occurred while fetching insights.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                        AI Financial Insights
                        <div className="px-3 py-1 bg-brand/10 text-brand text-xs uppercase tracking-widest rounded-full font-black flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Beta
                        </div>
                    </h1>
                    <p className="mt-1 text-sm font-medium text-zinc-500">
                        Gemini analyzes your recent transactions to catch anomalies and suggest improvements.
                    </p>
                </div>

                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="group relative flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 font-black text-white px-6 py-3.5 transition-all hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/10" />
                    </div>
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin text-zinc-300" />
                            <span>Analyzing Records...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-brand" />
                            <span>Generate Audit Report</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 text-rose-800 p-5 rounded-2xl border border-rose-100/50 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">Audit Failed</h4>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {insights && !loading && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Executive Summary Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-sm uppercase tracking-widest font-black text-zinc-800">
                                Executive Summary
                            </h3>
                        </div>
                        <p className="text-zinc-700 text-base font-medium leading-relaxed max-w-4xl pl-2">
                            {insights.summary}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Anomalies Flagged Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 relative overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-sm uppercase tracking-widest font-black text-zinc-800">
                                    Flagged Anomalies
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0 relative">
                                {insights.anomalies && insights.anomalies.length > 0 ? (
                                    <ul className="space-y-4">
                                        {insights.anomalies.map((anomaly: any, idx: number) => (
                                            <li key={idx} className="flex flex-col p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 transition-all hover:bg-amber-50 hover:border-amber-200">
                                                <span className="text-amber-900 font-bold text-sm leading-relaxed mb-2">{anomaly.issue}</span>
                                                {anomaly.transactionNo && (
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-600/70 py-1.5 px-3 bg-amber-100/50 rounded-lg w-fit">
                                                        Ref: {anomaly.transactionNo}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center px-4">
                                        <div className="w-14 h-14 rounded-3xl bg-emerald-50 flex items-center justify-center mb-4 shadow-inner">
                                            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                        </div>
                                        <h4 className="font-bold text-zinc-900 mb-1">Clean Record</h4>
                                        <p className="text-sm font-medium text-zinc-500">No suspicious activities or anomalies detected in the recent transactions.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Recommendations Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-xl shadow-zinc-200/50 relative overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                </div>
                                <h3 className="text-sm uppercase tracking-widest font-black text-zinc-800">
                                    AI Recommendations
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0">
                                {insights.recommendations && insights.recommendations.length > 0 ? (
                                    <ul className="space-y-4">
                                        {insights.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-4 p-5 bg-zinc-50/80 rounded-2xl border border-zinc-100 transition-all hover:bg-zinc-50 hover:border-zinc-200">
                                                <span className="shrink-0 w-7 h-7 rounded-xl bg-purple-100/50 text-purple-600 flex items-center justify-center text-[11px] font-black shadow-sm">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-zinc-700 font-medium text-sm leading-relaxed pt-0.5">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center px-4">
                                        <p className="text-sm font-medium text-zinc-500">No specific actionable recommendations at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {!insights && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-gradient-to-tr from-zinc-100 to-brand/10 border border-zinc-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-zinc-200/50 transform rotate-3 hover:rotate-6 transition-all duration-500">
                        <Sparkles className="w-10 h-10 text-brand" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Ready to audit?</h3>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
                        Click the button above to run an AI audit of your recent transactions. We'll catch odd patterns, missing details, and categorize structural advice.
                    </p>
                </div>
            )}
        </div>
    );
}
