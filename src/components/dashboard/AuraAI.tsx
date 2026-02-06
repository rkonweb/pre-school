"use client";

import React, { useState, useEffect } from "react";
import {
    Sparkles,
    ChevronRight,
    AlertTriangle,
    Bus,
    TrendingUp,
    Clock,
    X,
    Zap,
    BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIInsight {
    id: string;
    type: "transport" | "staff" | "academic" | "attendance";
    severity: "low" | "medium" | "high";
    message: string;
}

export function AuraAI({ insights }: { insights: AIInsight[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const currentInsight = insights[currentIndex] || { id: "empty", message: "Aura is initializing...", type: "system", severity: "low" };

    useEffect(() => {
        if (!isExpanded && insights.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % insights.length);
            }, 8000);
            return () => clearInterval(timer);
        }
    }, [isExpanded, insights.length]);

    if (!isVisible || insights.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case "transport": return <Bus className="h-4 w-4" />;
            case "academic": return <TrendingUp className="h-4 w-4" />;
            case "staff": return <Clock className="h-4 w-4" />;
            default: return <BrainCircuit className="h-4 w-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high": return "text-rose-600 bg-rose-50 border-rose-100";
            case "medium": return "text-amber-600 bg-amber-50 border-amber-100";
            default: return "text-blue-600 bg-blue-50 border-blue-100";
        }
    };

    return (
        <div className="relative z-40 px-4 sm:px-0">
            <div
                className={cn(
                    "bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-2xl shadow-blue-500/5 overflow-hidden transition-all duration-500",
                    isExpanded ? "rounded-[32px] w-full" : "rounded-full w-full max-w-2xl mx-auto"
                )}
            >
                <div className="flex items-center justify-between p-2 pl-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex -space-x-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg relative z-10 border-2 border-white">
                                <Sparkles className="h-5 w-5 text-white animate-pulse" />
                            </div>
                        </div>

                        {!isExpanded && (
                            <AnimatePresence exitBeforeEnter>
                                <motion.div
                                    key={currentInsight.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        getSeverityColor(currentInsight.severity)
                                    )}>
                                        {currentInsight.type}
                                    </span>
                                    <p className="text-sm font-bold text-zinc-600 line-clamp-1 italic">
                                        "{currentInsight.message}"
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {isExpanded && (
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                    Aura Intelligence Hub
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </h3>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Enterprise Insight Cluster</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            {isExpanded ? "Close" : "Open Feed"}
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-zinc-100"
                        >
                            <div className="p-8 grid md:grid-cols-2 gap-6 bg-zinc-50/30">
                                {insights.map((insight) => (
                                    <div
                                        key={insight.id}
                                        className="group p-6 rounded-2xl bg-white border border-zinc-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm border",
                                                getSeverityColor(insight.severity)
                                            )}>
                                                {getIcon(insight.type)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-zinc-400 uppercase tracking-widest text-[9px] font-black">
                                                    {insight.type}
                                                </div>
                                                <p className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors leading-relaxed italic">
                                                    "{insight.message}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-white border-t border-zinc-100 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shadow-inner">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-3 text-sm text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-between">
                                    <span>Ask anything to Aura Intelligence...</span>
                                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                </div>
                                <button className="px-6 py-3 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                                    Analyze
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
