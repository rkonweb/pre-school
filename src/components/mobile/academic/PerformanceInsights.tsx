"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target, Award, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceInsightsProps {
    overallPercentage: number;
    trend: string;
    totalExams: number;
}

export const PerformanceInsights = ({
    overallPercentage,
    trend,
    totalExams
}: PerformanceInsightsProps) => {
    const getTrendConfig = () => {
        switch (trend) {
            case "IMPROVING":
                return { icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50", label: "Improving Performance" };
            case "DECLINING":
                return { icon: <TrendingDown className="w-5 h-5" />, color: "text-rose-600", bg: "bg-rose-50", label: "Needs Attention" };
            default:
                return { icon: <Minus className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50", label: "Stable Stats" };
        }
    };

    const config = getTrendConfig();

    return (
        <div className="space-y-6">
            {/* Main Score Glass Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium mb-1">Overall Performance</p>
                        <h2 className="text-4xl font-bold">{overallPercentage.toFixed(1)}%</h2>
                        <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs">
                            <Target className="w-3 h-3" />
                            <span>Based on {totalExams} exams</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Award className="w-10 h-10 text-yellow-300 drop-shadow-md" />
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn("p-4 rounded-2xl border flex flex-col items-center text-center gap-2", config.bg, config.color.replace('text-', 'border-').replace('600', '100'))}
                >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config.color.replace('text-', 'bg-').replace('600', '100'))}>
                        {config.icon}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider">{config.label}</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center text-center gap-2"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Ready</span>
                </motion.div>
            </div>
        </div>
    );
};
