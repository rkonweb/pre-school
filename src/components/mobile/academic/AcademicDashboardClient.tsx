"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, GraduationCap, Info, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { PerformanceInsights } from "@/components/mobile/academic/PerformanceInsights";
import { SubjectPerformanceChart } from "@/components/mobile/academic/SubjectPerformanceChart";
import { ReportCardList } from "@/components/mobile/academic/ReportCardList";
import { getStudentAcademicDataAction } from "@/app/actions/parent-actions";

interface AcademicDashboardClientProps {
    slug: string;
    studentId: string;
    studentName: string;
}

export const AcademicDashboardClient = ({
    slug,
    studentId,
    studentName
}: AcademicDashboardClientProps) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const res = await getStudentAcademicDataAction(slug, studentId);
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        };
        loadData();
    }, [slug, studentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Analyzing results...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Glossy Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link href={`/${slug}/parent/mobile/dashboard`} className="p-2 -ml-2 rounded-full active:bg-slate-100 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-800" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">Academic Progress</h1>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{studentName}</p>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-8">
                {/* Insights Section */}
                <section>
                    <PerformanceInsights
                        overallPercentage={data?.performance?.overallPercentage || 0}
                        trend={data?.performance?.trend || "STABLE"}
                        totalExams={data?.performance?.totalExams || 0}
                    />
                </section>

                {/* Subjuct Chart */}
                <section>
                    <SubjectPerformanceChart subjects={data?.performance?.subjectPerformance || []} />
                </section>

                {/* Report Cards Section */}
                <section>
                    <ReportCardList reports={data?.reports || []} />
                </section>

                {/* Info Card */}
                <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-indigo-900/70 font-medium">
                        Performance analytics are calculated based on all recorded exam results for the current academic session. Trends compare the most recent exam overall against the previous assessment.
                    </p>
                </section>
            </div>
        </div>
    );
};
