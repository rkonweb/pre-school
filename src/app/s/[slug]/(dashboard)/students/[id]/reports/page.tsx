"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Printer,
    TrendingUp,
    ChevronDown,
    X,
    AlertCircle,
    Loader2
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { cn } from "@/lib/utils";
import { getStudentSmartAnalyticsAction } from "@/app/actions/analytics-actions";
import { getStudentAction } from "@/app/actions/student-actions";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const PrintableReport = dynamic(() => import("@/components/reports/PrintableReport"), { ssr: false });

export default function ReportsTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [expandedExamId, setExpandedExamId] = useState<string | null>(null);

    const reportRef = useRef<HTMLDivElement>(null);
    const testReportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `${student?.firstName}_Report`,
        onAfterPrint: () => setExpandedExamId(null),
    });

    const handlePrintTest = useReactToPrint({
        contentRef: testReportRef,
        documentTitle: `${student?.firstName}_Test_Report`,
        onAfterPrint: () => setExpandedExamId(null),
    });

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setIsLoading(true);
        const [studentRes, analyticsRes] = await Promise.all([
            getStudentAction(slug, id),
            getStudentSmartAnalyticsAction(slug, id)
        ]);

        if (studentRes.success) setStudent(studentRes.student);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);

        setIsLoading(false);
    }

    if (isLoading || !student) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-zinc-900">Progress Reports</h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Holistic academic and developmental assessment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <StandardActionButton
                        onClick={() => handlePrint()}
                        variant="outline"
                        icon={Printer}
                        label="Print Annual Report"
                    />
                </div>
            </div>

            {/* Analytical Reports Section */}
            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-zinc-900">Automated Analytics</h4>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Real-time Exam Sync</p>
                    </div>
                </div>

                {analytics?.academics.examHistory.length > 0 ? (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analytics.academics.examHistory.slice().reverse().map((exam: any, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                    className={cn(
                                        "p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                                        expandedExamId === exam.id
                                            ? "bg-brand text-[var(--secondary-color)] border-brand shadow-xl shadow-brand/20 scale-[1.02]"
                                            : "bg-zinc-50 border-zinc-100 hover:border-brand/30 hover:shadow-lg hover:shadow-zinc-200/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            expandedExamId === exam.id ? "text-white/60" : "text-zinc-400"
                                        )}>{exam.date}</span>
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px] border shadow-sm",
                                            expandedExamId === exam.id ? "bg-white/10 border-white/20 text-white" : "bg-white border-zinc-100 text-brand"
                                        )}>
                                            {exam.percentage.toFixed(0)}%
                                        </div>
                                    </div>
                                    <h5 className="font-bold mb-4">{exam.name}</h5>
                                    <div className={cn(
                                        "w-full h-2 rounded-full overflow-hidden border",
                                        expandedExamId === exam.id ? "bg-white/20 border-white/10" : "bg-white border-zinc-100"
                                    )}>
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                expandedExamId === exam.id ? "bg-white" : "bg-brand"
                                            )}
                                            style={{ width: `${exam.percentage}%` }}
                                        />
                                    </div>
                                    <div className={cn(
                                        "absolute right-4 bottom-4 transition-transform duration-300",
                                        expandedExamId === exam.id ? "rotate-180" : ""
                                    )}>
                                        <ChevronDown className="h-4 w-4 opacity-40" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Expanded Exam Detail */}
                        {expandedExamId && analytics.academics.examHistory.find((e: any) => e.id === expandedExamId) && (
                            <div className="mt-8 p-8 rounded-[32px] bg-zinc-50 border border-zinc-100 animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-xl font-black text-zinc-900">
                                            {analytics.academics.examHistory.find((e: any) => e.id === expandedExamId)?.name} Detail
                                        </h4>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Subject-wise performance breakdown</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StandardActionButton
                                            onClick={() => handlePrintTest()}
                                            variant="outline"
                                            icon={Printer}
                                            label="Print Test Report"
                                            className="h-10 px-4 rounded-xl text-[10px]"
                                        />
                                        <StandardActionButton
                                            onClick={() => setExpandedExamId(null)}
                                            variant="ghost"
                                            icon={X}
                                            iconOnly
                                            tooltip="Close"
                                            className="h-10 w-10 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {analytics.academics.examHistory.find((e: any) => e.id === expandedExamId)?.subjects.map((sub: any, sIdx: number) => (
                                        <div key={sIdx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-bold text-zinc-900">{sub.name}</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[10px] font-black",
                                                    sub.grade.includes('A') ? "bg-emerald-50 text-emerald-600" :
                                                        sub.grade.includes('B') ? "bg-blue-50 text-blue-600" :
                                                            sub.grade.includes('C') ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {sub.grade}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Marks</p>
                                                    <p className="text-lg font-black text-zinc-900">{sub.marks}<span className="text-xs text-zinc-300 font-bold ml-1">/ {sub.maxMarks}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-400 font-bold">No exam results synced yet.</p>
                    </div>
                )}
            </div>

            {/* Hidden Printable Report */}
            <div className="hidden">
                {student && analytics && (
                    <div ref={reportRef}>
                        <PrintableReport
                            student={student}
                            school={student.school}
                            analytics={analytics}
                        />
                    </div>
                )}
                {student && analytics && expandedExamId && (
                    <div ref={testReportRef}>
                        <PrintableReport
                            student={student}
                            school={student.school}
                            analytics={analytics}
                            selectedExamId={expandedExamId}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
