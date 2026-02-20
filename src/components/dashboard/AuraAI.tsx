'use client';
import { useState, useEffect } from "react";
import {
    Sparkles,
    X,
    ChevronRight,
    Zap,
    Bus,
    TrendingUp,
    Clock,
    BrainCircuit,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { askAuraAction } from "@/app/actions/ai-dashboard-actions";
import { toast } from "sonner";

interface AIInsight {
    id: string;
    type: "transport" | "staff" | "academic" | "attendance" | "system";
    severity: "low" | "medium" | "high";
    message: string;
}

export function AuraAI({ insights, slug, staffId }: { insights: AIInsight[], slug: string, staffId?: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // AI Interaction State
    const [query, setQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);

    const currentInsight = insights[currentIndex] || { id: "empty", message: "Aura is online & ready.", type: "system", severity: "low" };

    useEffect(() => {
        if (!isExpanded && insights.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % insights.length);
            }, 8000);
            return () => clearInterval(timer);
        }
    }, [isExpanded, insights.length]);

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setIsAnalyzing(true);
        setAiResponse(null);

        try {
            const res = await askAuraAction(query, slug, staffId);
            if (res.success) {
                setAiResponse(res.data);
            } else {
                toast.error(res.error || "Failed to analyze");
            }
        } catch (e) {
            toast.error("Something went wrong");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isVisible) return null;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high": return "from-rose-500 to-orange-500";
            case "medium": return "from-amber-500 to-orange-400";
            default: return "from-brand to-brand/80";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "transport": return <Bus className="h-5 w-4" />;
            case "academic": return <TrendingUp className="h-5 w-4" />;
            case "staff": return <Clock className="h-5 w-4" />;
            case "system": return <Sparkles className="h-5 w-4" />;
            default: return <BrainCircuit className="h-5 w-4" />;
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        className="w-[400px] md:w-[450px] pointer-events-auto"
                    >
                        <div className="relative overflow-hidden rounded-[32px] bg-white/80 border border-white shadow-[0_32px_64px_-16px_rgba(37,99,235,0.12)] backdrop-blur-3xl">
                            {/* Inner Background Glows */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 blur-[80px] -z-10" />

                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/40">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand to-brand/80 flex items-center justify-center shadow-lg shadow-brand/20">
                                        <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            Aura Assistant
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">Active Node Cluster</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar space-y-6">
                                {/* Current Live Insights */}
                                {insights.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Critical Vectors</h4>
                                        {insights.map((insight) => (
                                            <motion.div
                                                key={insight.id}
                                                whileHover={{ x: 5 }}
                                                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand/40 transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg flex-shrink-0",
                                                        getSeverityColor(insight.severity)
                                                    )}>
                                                        <span className="text-white">{getIcon(insight.type)}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{insight.type}</span>
                                                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 leading-relaxed italic">
                                                            "{insight.message}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Chat / Analysis Zone */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Intel Inquiry</h4>
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-brand/50 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity blur-sm" />
                                        <div className="relative p-1 rounded-2xl bg-white border border-slate-100">
                                            {aiResponse && (
                                                <div className="p-5 bg-slate-50 rounded-xl mb-1 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 holographic-seal">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Zap className="h-3 w-3 text-brand" />
                                                        <span className="text-[10px] font-black text-brand uppercase tracking-widest">Aura Synthesis</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                                                        {aiResponse}
                                                    </p>
                                                    <button
                                                        onClick={() => setAiResponse(null)}
                                                        className="mt-4 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase underline decoration-slate-200 underline-offset-4"
                                                    >
                                                        Clear Buffer
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 p-1">
                                                <input
                                                    type="text"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                                    placeholder="Query the node..."
                                                    className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-300 focus:ring-0"
                                                    disabled={isAnalyzing}
                                                />
                                                <button
                                                    onClick={handleAnalyze}
                                                    disabled={isAnalyzing || !query.trim()}
                                                    className="h-12 w-12 flex items-center justify-center bg-brand text-[var(--secondary-color)] rounded-xl shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Floating Orb */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="pointer-events-auto relative group active:scale-90 transition-transform"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Outer Glows */}
                <div className={cn(
                    "absolute -inset-4 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse",
                    getSeverityColor(currentInsight.severity).replace('from-', 'bg-').split(' ')[0]
                )} />
                <div className="absolute -inset-8 rounded-full bg-brand/10 blur-3xl" />

                {/* The Orb Interior */}
                <div className={cn(
                    "h-20 w-20 rounded-full bg-gradient-to-tr p-[2px] shadow-2xl relative z-10 overflow-hidden",
                    getSeverityColor(currentInsight.severity)
                )}>
                    <div className="h-full w-full rounded-full bg-white flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                        {/* Dynamic Reflection SVG */}
                        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
                            <motion.circle
                                cx="50" cy="20" r="40"
                                fill="white"
                                animate={{ opacity: [0.1, 0.3, 0.1], y: [0, 5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </svg>

                        <Sparkles className="h-8 w-8 text-brand relative z-10 animate-pulse" />

                        {/* Insight Badges */}
                        {insights.length > 0 && !isExpanded && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-6 w-6 bg-brand rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white"
                            >
                                {insights.length}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Pulsing Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white opacity-20 blur-sm pointer-events-none" />

                {/* Current Tooltip Label */}
                {!isExpanded && (
                    <div className="absolute right-24 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-2 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-xl border border-slate-100 px-4 py-2 rounded-2xl shadow-2xl">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                {insights.length > 0 ? `${insights.length} Active Insights` : "Aura Offline Querying"}
                            </span>
                        </div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
