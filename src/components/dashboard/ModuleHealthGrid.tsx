"use client";

import React from "react";
import {
    Users,
    TrendingUp,
    Bus,
    GraduationCap,
    Activity,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModuleHealthGridProps {
    stats: any;
}

export function ModuleHealthGrid({ stats }: ModuleHealthGridProps) {
    if (!stats) return null;
    const healthData = stats?.health || { staleInquiries: 0, incompleteStudents: 0, lowStockItems: 0 };

    const modules = [
        {
            id: "academics",
            title: "Academics",
            score: 98,
            status: "Optimal",
            trend: "+1.2%",
            issues: [],
            accent: "emerald-500",
            icon: <GraduationCap className="h-6 w-6" />,
            gradient: "from-emerald-500 to-teal-500",
            border: "border-emerald-500/20"
        },
        {
            id: "finance",
            title: "Finance",
            score: stats.collectionPercent || 85,
            status: (stats.collectionPercent || 85) > 80 ? "Healthy" : "Attention",
            trend: "-0.5%",
            issues: (stats.collectionPercent || 85) < 100 ? ["Outstanding dues remain"] : [],
            accent: (stats.collectionPercent || 85) > 80 ? "emerald-500" : "amber-500",
            icon: <TrendingUp className="h-6 w-6" />,
            gradient: (stats.collectionPercent || 85) > 80 ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500",
            border: (stats.collectionPercent || 85) > 80 ? "border-emerald-500/20" : "border-amber-500/20"
        },
        {
            id: "transport",
            title: "Transport",
            score: stats.delayedRoutes > 0 ? 65 : 100,
            status: stats.delayedRoutes > 0 ? "Critical" : "On-Time",
            trend: stats.delayedRoutes > 0 ? "-12.0%" : "Stable",
            issues: stats.delayedRoutes > 0 ? [`${stats.delayedRoutes} Vehicle Delays`] : [],
            accent: stats.delayedRoutes > 0 ? "rose-500" : "emerald-500",
            icon: <Bus className="h-6 w-6" />,
            gradient: stats.delayedRoutes > 0 ? "from-rose-500 to-orange-500" : "from-emerald-500 to-teal-500",
            border: stats.delayedRoutes > 0 ? "border-rose-500/20" : "border-emerald-500/20"
        },
        {
            id: "admissions",
            title: "Admissions",
            score: healthData.staleInquiries > 0 ? 82 : 100,
            status: healthData.staleInquiries > 0 ? "Warning" : "Active",
            trend: "+5.2%",
            issues: healthData.staleInquiries > 0 ? [`${healthData.staleInquiries} Stale Inquiries`] : [],
            accent: healthData.staleInquiries > 0 ? "amber-500" : "emerald-500",
            icon: <Users className="h-6 w-6" />,
            gradient: healthData.staleInquiries > 0 ? "from-amber-500 to-yellow-500" : "from-emerald-500 to-teal-500",
            border: healthData.staleInquiries > 0 ? "border-amber-500/20" : "border-emerald-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((m, idx) => (
                <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
                    className={cn(
                        "relative group p-8 rounded-[40px] border bg-white/60 backdrop-blur-2xl transition-all duration-500 perspective-1000",
                        m.border,
                        "hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border-white shadow-sm"
                    )}
                >
                    {/* Live Indicator */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", `bg-${m.accent}`)} />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Signal Active</span>
                    </div>

                    {/* Progress Ring & Icon */}
                    <div className="relative mb-10 flex flex-col items-center">
                        <div className="relative h-28 w-28">
                            <svg className="h-full w-full rotate-[-90deg]">
                                <circle
                                    cx="56" cy="56" r="50"
                                    fill="transparent"
                                    stroke="#F1F5F9"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="56" cy="56" r="50"
                                    fill="transparent"
                                    stroke="url(#grad)"
                                    strokeWidth="8"
                                    strokeDasharray="314.159"
                                    initial={{ strokeDashoffset: 314.159 }}
                                    animate={{ strokeDashoffset: 314.159 - (314.159 * m.score) / 100 }}
                                    transition={{ duration: 1.5, delay: 0.5 + idx * 0.1 }}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#4F46E5" />
                                        <stop offset="100%" className={cn(`text-${m.accent}`, "fill-current")} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={cn("p-4 rounded-3xl bg-white shadow-lg group-hover:scale-110 transition-transform shadow-slate-200/50", `text-${m.accent}`)}>
                                    {m.icon}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{m.title}</h3>
                            <div className="flex items-center gap-2 justify-center">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", `bg-${m.accent}/10 text-${m.accent}`)}>
                                    {m.status}
                                </span>
                                <span className="text-xs font-bold text-slate-400">{m.trend}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                            <span className="text-2xl font-black text-slate-900">{m.score}%</span>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            {m.issues.length > 0 ? (
                                m.issues.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] font-bold text-rose-500 leading-tight">
                                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 opacity-40" />
                                        <span className="line-clamp-1">{issue}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 opacity-60">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Matrix Optimized</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.02] transition-opacity rounded-[40px]",
                        m.gradient
                    )} />
                </motion.div>
            ))}
        </div>
    );
}
