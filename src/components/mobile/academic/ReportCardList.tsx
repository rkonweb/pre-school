"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Eye, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportCard {
    id: string;
    term: string;
    academicYear: string;
    createdAt: string | Date;
    published: boolean;
}

interface ReportCardListProps {
    reports: ReportCard[];
}

export const ReportCardList = ({ reports }: ReportCardListProps) => {
    if (!reports.length) return (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No report cards have been issued yet.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 px-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Official Term Reports
            </h3>

            <div className="grid gap-4">
                {reports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">
                                    {report.term} Report
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {report.academicYear}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[11px] font-medium text-slate-400">
                                        Issued {format(new Date(report.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
