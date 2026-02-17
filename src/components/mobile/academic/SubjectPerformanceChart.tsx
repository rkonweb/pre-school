"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubjectPerformanceChartProps {
    subjects: {
        subject: string;
        average: number;
        count: number;
    }[];
}

export const SubjectPerformanceChart = ({ subjects }: SubjectPerformanceChartProps) => {
    if (!subjects.length) return (
        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No assessment data available yet.
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                Subject-wise Performance
            </h3>

            <div className="space-y-5">
                {subjects.map((sub, index) => (
                    <div key={sub.subject} className="group">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                                {sub.subject}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                {sub.average.toFixed(0)}%
                            </span>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${sub.average}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    sub.average >= 80 ? "bg-emerald-500" :
                                        sub.average >= 60 ? "bg-indigo-500" :
                                            sub.average >= 40 ? "bg-amber-500" : "bg-rose-500"
                                )}
                            />
                        </div>
                        <div className="mt-1 flex justify-end">
                            <span className="text-[10px] text-slate-400">
                                {sub.count} {sub.count === 1 ? 'Exam' : 'Exams'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
