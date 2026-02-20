"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Trophy, Loader2, FileText, Download
} from "lucide-react";
import { getStudentDetailsAction, getStudentReportsAction } from "@/app/actions/parent-actions";
import { useParentData } from "@/context/parent-context";
import { StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";

export default function ReportsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const parentId = params.parentId as string;
    const slug = params.slug as string;
    const phone = searchParams.get("phone") || "";

    const { school, isLoading: isContextLoading } = useParentData();
    const brandColor = school?.brandColor || "#6366f1";

    const [fullStudent, setFullStudent] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (studentId && slug) {
            loadData();
        } else {
            setIsLoading(false);
        }
    }, [studentId, slug, phone]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [detailsRes, reportsRes] = await Promise.all([
                getStudentDetailsAction(slug, studentId, phone),
                getStudentReportsAction(studentId, phone)
            ]);

            if (detailsRes.success) {
                setFullStudent(detailsRes.student);
            }
            if (reportsRes.success) {
                setReports(reportsRes.reports || []);
            }
        } catch (error) {
            console.error("Failed to load reports data", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isContextLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-24">
            <StickyHeader
                title="Reports"
                subtitle={`${fullStudent?.firstName || studentId}'s Results`}
                showBell={true}
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />

            <main className="flex-1 px-5 py-6 space-y-6 relative z-0">
                <ReportsView reports={reports} brandColor={brandColor} />
            </main>
        </div>
    );
}

function ReportsView({ reports, brandColor }: { reports: any[], brandColor: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                    <Trophy className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Academic Performance</h3>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Official Report Cards & Result Sheets</p>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-zinc-100 shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                        <FileText className="h-12 w-12" />
                    </div>
                    <h4 className="text-slate-900 font-black text-lg mb-2 uppercase tracking-tight">No Reports Available</h4>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Results will be automatically uploaded here once published.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reports.map((report: any) => (
                        <div key={report.id} className="bg-white rounded-[3rem] p-2 border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all group relative overflow-hidden">
                            <div className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block transition-colors" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                                            {report.term}
                                        </span>
                                        <h4 className="text-2xl font-black text-zinc-900 leading-tight">Report Card</h4>
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                                            Issued: {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-all group-hover:rotate-6">
                                        <Trophy className="h-8 w-8 text-slate-200 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                </div>

                                {/* Marks Preview */}
                                {(() => {
                                    try {
                                        const marks = typeof report.marks === 'string' ? JSON.parse(report.marks) : report.marks;
                                        const subjects = Object.entries(marks).slice(0, 3);
                                        return (
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                {subjects.map(([sub, score]: any) => (
                                                    <div key={sub} className="bg-slate-50/50 rounded-[1.5rem] p-4 text-center border border-white group-hover:border-purple-100 transition-colors">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1 tracking-tighter">{sub}</p>
                                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{score.obtained || score}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (e) { return null; }
                                })()}
                            </div>

                            <button
                                className="w-full py-5 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                                style={{ backgroundColor: brandColor, boxShadow: `0 15px 30px ${brandColor}30` }}
                            >
                                <Download className="h-4 w-4" />
                                Download Full PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
