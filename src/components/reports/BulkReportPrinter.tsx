"use client";

import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableReport from "./PrintableReport";
import { getBulkStudentAnalyticsAction } from "@/app/actions/student-analytics-actions";
import { getStudentAction } from "@/app/actions/student-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";
import { Loader2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/cookies";

interface BulkReportPrinterProps {
    studentIds: string[];
    schoolSlug: string;
    reportType: "annual" | "exam";
    selectedExamId?: string;
    academicYearId?: string;
    academicYearName?: string;
    onClose: () => void;
}

export default function BulkReportPrinter({
    studentIds,
    schoolSlug,
    reportType,
    selectedExamId,
    academicYearId: propAcademicYearId,
    academicYearName,
    onClose
}: BulkReportPrinterProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{
        students: any[];
        school: any;
        bulkAnalytics: any;
    } | null>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Bulk_Reports_${new Date().toLocaleDateString()}`,
        onAfterPrint: onClose
    });

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                // Fetch School Settings
                const schoolRes = await getSchoolSettingsAction(schoolSlug);
                if (!schoolRes.success) throw new Error("Failed to load school settings");

                // Fetch Bulk Analytics
                const academicYearId = propAcademicYearId || getCookie(`academic_year_${schoolSlug}`) || undefined;
                const analyticsRes = await getBulkStudentAnalyticsAction(schoolSlug, studentIds, academicYearId);
                if (!analyticsRes.success) throw new Error("Failed to load analytics");

                // Fetch Student Profiles
                const studentPromises = studentIds.map(id => getStudentAction(id));
                const studentResults = await Promise.all(studentPromises);
                const students = studentResults
                    .filter(res => res.success)
                    .map(res => res.student);

                setData({
                    school: schoolRes.data,
                    bulkAnalytics: analyticsRes.data,
                    students
                });
            } catch (error: any) {
                toast.error(error.message);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };

        loadAllData();
    }, [studentIds, schoolSlug, onClose]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
                    <Loader2 className="h-12 w-12 text-brand animate-spin mx-auto" />
                    <h2 className="text-xl font-bold text-zinc-900">Preparing Reports</h2>
                    <p className="text-zinc-500 text-sm">Fetching and processing data for {studentIds.length} students. Please wait...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col overflow-hidden">
            {/* Header / Controls */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 text-white border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-800">
                        <X className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="font-bold">Print Preview ({studentIds.length} Reports)</h2>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{reportType === 'annual' ? 'Annual Summary' : 'Individual Assessment'}</p>
                    </div>
                </div>
                <Button
                    onClick={() => handlePrint()}
                    className="bg-brand hover:brightness-110 text-white rounded-xl font-bold px-6 shadow-lg shadow-brand/20"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Send to Printer
                </Button>
            </div>

            {/* Print Layout */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-zinc-800">
                <div
                    ref={componentRef}
                    className="bg-white shadow-2xl bulk-print-container"
                >
                    <style jsx global>{`
                        @media screen {
                            .bulk-print-container > div {
                                margin-bottom: 2rem;
                                box-shadow: 0 0 40px rgba(0,0,0,0.1);
                            }
                        }
                        @media print {
                            .bulk-print-container > div {
                                margin-bottom: 0;
                                page-break-after: always;
                            }
                            .bulk-print-container > div:last-child {
                                page-break-after: auto;
                            }
                        }
                    `}</style>
                    {data.students.map((student, idx) => (
                        <PrintableReport
                            key={student.id}
                            student={student}
                            school={data.school}
                            analytics={data.bulkAnalytics[student.id]}
                            selectedExamId={reportType === 'exam' ? (selectedExamId === 'all' ? undefined : selectedExamId) : undefined}
                            academicYearName={academicYearName}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
