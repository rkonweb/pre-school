'use client';

import { useState } from "react";
import { FileText, Printer, X, Loader2, Sparkles } from "lucide-react";
import { generateDailyReportAction } from "@/app/actions/report-actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DailyReportGeneratorProps {
    slug: string;
}

export function DailyReportGenerator({ slug }: DailyReportGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setIsOpen(true); // Open modal immediately to show loading state

        try {
            const res = await generateDailyReportAction(slug);
            if (res.success) {
                setReportData(res.data);
            } else {
                toast.error(res.error || "Failed to generate report");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-brand transition-all shadow-sm hover:shadow-md hover:border-brand/20 group"
            >
                <FileText className="h-4 w-4 text-slate-400 group-hover:text-brand transition-colors" />
                <span>Daily Report</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-brand" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Daily Intelligence Report</h3>
                                        <p className="text-xs text-slate-500 font-medium">AI-Generated Executive Summary</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors print:hidden"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar print:p-0 print:overflow-visible">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-brand animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="h-4 w-4 text-brand animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 animate-pulse">Analyzing daily operations...</p>
                                    </div>
                                ) : reportData ? (
                                    <div className="space-y-8 print:space-y-4">
                                        {/* Print Header (Only visible when printing) */}
                                        <div className="hidden print:block mb-8 border-b pb-4">
                                            <h1 className="text-2xl font-bold text-slate-900">Daily School Report</h1>
                                            <p className="text-sm text-slate-500">Date: {reportData.stats.date}</p>
                                        </div>

                                        {/* Key Metrics Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <StatCard label="Attendance" value={`${reportData.stats.students.percentage}%`} sub={`(${reportData.stats.students.present}/${reportData.stats.students.total})`} />
                                            <StatCard label="Absent Students" value={reportData.stats.students.absent} sub="Today" />
                                            <StatCard label="Staff Present" value={`${reportData.stats.staff.present}`} sub={`of ${reportData.stats.staff.total}`} />

                                            <StatCard label="Fees Collected" value={`₹${reportData.stats.finance.collected.toLocaleString()}`} />
                                            <StatCard label="Pending Fees" value={`₹${reportData.stats.finance.pending.toLocaleString()}`} sub="Total Outstanding" />
                                            <StatCard label="New Inquiries" value={reportData.stats.admissions.new} />
                                        </div>

                                        {/* AI Narrative */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-transparent print:border-none print:p-0">
                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles className="h-3 w-3 text-brand" />
                                                Executive Summary
                                            </h4>
                                            <div className="prose prose-sm prose-slate max-w-none">
                                                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                                                    {reportData.narrative}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer / Signature Area for Print */}
                                        <div className="hidden print:flex justify-between items-end mt-12 pt-12 border-t border-slate-200">
                                            <div className="text-xs text-slate-400">Generated by Aura AI • {new Date().toLocaleString()}</div>
                                            <div className="flex flex-col gap-8">
                                                <div className="w-48 border-b border-slate-300" />
                                                <span className="text-xs font-bold text-slate-900 uppercase">Administrator Signature</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 py-12">No data available.</div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            {!isLoading && reportData && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 print:hidden">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 bg-brand text-white rounded-xl font-medium shadow-lg shadow-brand/20 hover:bg-brand/90 flex items-center gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print Report
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; }
                    body * {
                        visibility: hidden;
                    }
                    .fixed.inset-0.z-\\[200\\] * {
                        visibility: visible;
                    }
                    .fixed.inset-0.z-\\[200\\] {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: white;
                        display: block;
                        padding: 0;
                    } 
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:bg-transparent { background: transparent !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:overflow-visible { overflow: visible !important; }
                }
            `}</style>
        </>
    );
}

function StatCard({ label, value, sub }: { label: string, value: string | number, sub?: string }) {
    return (
        <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm print:border-slate-200">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</h5>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            {sub && <div className="text-xs font-medium text-slate-500 mt-0.5">{sub}</div>}
        </div>
    );
}
