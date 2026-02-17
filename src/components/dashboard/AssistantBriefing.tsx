"use client";

import React from "react";
import { Sparkles, Calendar, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AssistantBriefingProps {
    stats: any;
    slug: string;
}

export function AssistantBriefing({ stats, slug }: AssistantBriefingProps) {
    const now = new Date();
    const hour = now.getHours();

    let greeting = "Good Morning";
    if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
    else if (hour >= 17) greeting = "Good Evening";

    const health = stats?.health || { staleInquiries: 0, incompleteStudents: 0, lowStockItems: 0 };
    const criticalIssues = (stats?.delayedRoutes || 0) + (health.staleInquiries > 0 ? 1 : 0);

    const MotionDiv = motion.div as any;
    const MotionH2 = motion.h2 as any;
    const MotionP = motion.p as any;

    if (!stats) return null;

    return (
        <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[48px] bg-white/70 p-12 text-slate-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-white backdrop-blur-3xl"
        >
            {/* Dynamic Lava Gradient Background - Light Pastel Variants */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),_var(--tw-gradient-from)_0%,_transparent_50%)] from-brand/20 animate-lava" />
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_var(--x2,_30%)_var(--y2,_70%),_var(--tw-gradient-from)_0%,_transparent_50%)] from-sky-400/20 animate-lava-slow" />
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_var(--x3,_80%)_var(--y3,_20%),_var(--tw-gradient-from)_0%,_transparent_50%)] from-fuchsia-400/20 animate-lava-medium" />
            </div>

            <style jsx>{`
                @keyframes lava {
                    0%, 100% { --x: 50%; --y: 50%; }
                    25% { --x: 80%; --y: 20%; }
                    50% { --x: 20%; --y: 80%; }
                    75% { --x: 40%; --y: 40%; }
                }
                @keyframes lava-slow {
                    0%, 100% { --x2: 30%; --y2: 70%; }
                    33% { --x2: 70%; --y2: 30%; }
                    66% { --x2: 10%; --y2: 10%; }
                }
                @keyframes lava-medium {
                    0%, 100% { --x3: 80%; --y3: 20%; }
                    50% { --x3: 20%; --y3: 80%; }
                }
                .animate-lava { animation: lava 20s ease-in-out infinite; }
                .animate-lava-slow { animation: lava-slow 35s ease-in-out infinite; }
                .animate-lava-medium { animation: lava-medium 25s ease-in-out infinite; }
            `}</style>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="space-y-8 max-w-3xl">
                    <MotionDiv
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-3 rounded-2xl bg-white/40 px-6 py-2.5 backdrop-blur-2xl border border-white shadow-sm"
                    >
                        <div className="relative h-2 w-2">
                            <div className="absolute inset-0 rounded-full bg-brand animate-ping" />
                            <div className="relative h-full w-full rounded-full bg-brand" />
                        </div>
                        <Sparkles className="h-4 w-4 text-brand" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Cognitive Hub Prime</span>
                    </MotionDiv>

                    <div className="space-y-4">
                        <MotionH2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-6xl font-black tracking-tighter leading-[0.85] lg:text-8xl text-slate-900"
                        >
                            {greeting}, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 drop-shadow-sm">System Admin</span>
                        </MotionH2>
                        <MotionP
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl text-slate-500 font-semibold leading-tight tracking-tight max-w-xl"
                        >
                            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                            {criticalIssues > 0
                                ? <span className="text-slate-900 block mt-2 underline decoration-brand/40 underline-offset-8"> Aura has detected {criticalIssues} high-priority status shifts.</span>
                                : <span className="text-slate-400 block mt-2"> Global operations verified as optimal.</span>}
                        </MotionP>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {health.staleInquiries > 0 && (
                            <MotionDiv
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-4 rounded-[24px] bg-amber-500/10 border border-amber-200 px-6 py-4 text-amber-700 backdrop-blur-3xl shadow-xl shadow-amber-500/5 transition-colors hover:bg-amber-500/20"
                            >
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse ring-4 ring-amber-500/20" />
                                <span className="text-xs font-black uppercase tracking-[0.1em]">{health.staleInquiries} Admissions Bottlenecks</span>
                            </MotionDiv>
                        )}
                        {stats?.delayedRoutes > 0 && (
                            <MotionDiv
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-4 rounded-[24px] bg-rose-500/10 border border-rose-200 px-6 py-4 text-rose-700 backdrop-blur-3xl shadow-xl shadow-rose-500/5 transition-colors hover:bg-rose-500/20"
                            >
                                <AlertCircle className="h-5 w-5 animate-bounce" />
                                <span className="text-xs font-black uppercase tracking-[0.1em]">{stats?.delayedRoutes} Passive Delays</span>
                            </MotionDiv>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-8 shrink-0">
                    {/* Abstract AI Avatar - Light Theme Optimized */}
                    <div className="relative h-48 w-48 lg:h-56 lg:w-56">
                        <div className="absolute inset-0 rounded-full bg-brand/10 blur-3xl animate-pulse" />
                        <svg viewBox="0 0 200 200" className="relative z-10 w-full h-full drop-shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                            <MotionDiv
                                d="M 100 20 Q 180 20 180 100 Q 180 180 100 180 Q 20 180 20 100 Q 20 20 100 20"
                                fill="none"
                                stroke="url(#aura-light-gradient)"
                                strokeWidth="3"
                                animate={{
                                    d: [
                                        "M 100 20 Q 180 20 180 100 Q 180 180 100 180 Q 20 180 20 100 Q 20 20 100 20",
                                        "M 100 30 Q 170 10 190 100 Q 170 190 100 170 Q 30 190 10 100 Q 30 10 100 30",
                                        "M 100 20 Q 180 20 180 100 Q 180 180 100 180 Q 20 180 20 100 Q 20 20 100 20"
                                    ]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                as="path"
                            />
                            <defs>
                                <linearGradient id="aura-light-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4F46E5" />
                                    <stop offset="50%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                            </defs>
                            <MotionDiv
                                cx="100" cy="100" r="40"
                                fill="#2563EB"
                                fillOpacity="0.05"
                                animate={{ r: [40, 45, 40] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                as="circle"
                            />
                            <MotionDiv
                                cx="100" cy="100" r="15"
                                fill="#2563EB"
                                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                as="circle"
                            />
                        </svg>

                        <div className="absolute inset-x-0 -bottom-10 flex flex-col items-center">
                            <span className="text-4xl font-black text-slate-900 tracking-widest">{stats?.attendanceToday || "0%"}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </MotionDiv>
    );
}
