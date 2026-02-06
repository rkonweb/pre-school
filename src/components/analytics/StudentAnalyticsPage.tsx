"use client";

import { useEffect, useState } from "react";
import { getStudentAnalyticsAction, StudentAnalytics } from "@/app/actions/student-analytics-actions";
import { AIInsightsSection } from "@/components/analytics/AIInsightsSection";
import { AcademicCharts } from "@/components/analytics/AcademicCharts";
import { SubjectRadarChart } from "@/components/analytics/SubjectRadarChart";
import { AttendanceWidget } from "@/components/analytics/AttendanceWidget";
import { HealthSummary } from "@/components/analytics/HealthSummary";
import { ActivitiesTimeline } from "@/components/analytics/ActivitiesTimeline";
import { Loader2, Printer, Download } from "lucide-react";
import { toast } from "sonner";

interface StudentAnalyticsPageProps {
    studentId: string;
}

export function StudentAnalyticsPage({ studentId }: StudentAnalyticsPageProps) {
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [studentId]);

    const loadAnalytics = async () => {
        setLoading(true);
        const res = await getStudentAnalyticsAction(studentId);
        if (res.success && res.data) {
            setAnalytics(res.data);
        } else {
            toast.error(res.error || "Failed to load analytics");
        }
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Failed to load student analytics</p>
                    <button
                        onClick={loadAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Print-only Header */}
            <div className="print-header">
                <h1 className="text-2xl font-bold">Student Progress Report</h1>
                <p className="text-sm text-gray-600">Academic Year 2024-2025</p>
                <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {analytics.student.avatar && (
                                <img
                                    src={analytics.student.avatar}
                                    alt={analytics.student.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {analytics.student.name}
                                </h1>
                                <p className="text-gray-600">
                                    {analytics.student.grade}
                                    {analytics.student.admissionNumber && (
                                        <span className="ml-2 text-gray-400">
                                            • {analytics.student.admissionNumber}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* AI Insights */}
                    <div className="page-break-avoid">
                        <AIInsightsSection insights={analytics.insights} />
                    </div>

                    {/* Academic Performance */}
                    <div className="page-break-avoid">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Academic Performance</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <AcademicCharts
                                    subjects={analytics.academic.subjects}
                                    overallPercentage={analytics.academic.overallPercentage}
                                    overallGrade={analytics.academic.overallGrade}
                                    trend={analytics.academic.trend}
                                />
                            </div>
                            <div>
                                <SubjectRadarChart subjects={analytics.academic.subjects} />
                                <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Consistency Score</h4>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {analytics.academic.consistencyScore.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Higher score indicates more consistent performance across subjects
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance & Health */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance & Health</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AttendanceWidget data={analytics.attendance} />
                            <HealthSummary data={analytics.health} />
                        </div>
                    </div>

                    {/* Co-curricular Activities */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Co-curricular Activities</h2>
                        <ActivitiesTimeline data={analytics.activities} />
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    /* Hide non-print elements */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Page setup */
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    
                    /* Reset backgrounds */
                    body {
                        background: white !important;
                    }
                    
                    .bg-gray-50 {
                        background: white !important;
                    }
                    
                    /* Ensure colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Page breaks */
                    .page-break-before {
                        page-break-before: always;
                    }
                    
                    .page-break-after {
                        page-break-after: always;
                    }
                    
                    .page-break-avoid {
                        page-break-inside: avoid;
                    }
                    
                    /* Optimize spacing for print */
                    .max-w-7xl {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    
                    /* Make charts print-friendly */
                    svg {
                        max-height: 250px !important;
                    }
                    
                    /* Compact spacing */
                    .space-y-8 > * + * {
                        margin-top: 1.5rem !important;
                    }
                    
                    /* Table optimization */
                    table {
                        font-size: 10pt !important;
                    }
                    
                    /* Header for print */
                    .print-header {
                        display: block !important;
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #000;
                    }
                    
                    /* Add page numbers */
                    @page {
                        @bottom-right {
                            content: "Page " counter(page) " of " counter(pages);
                        }
                    }
                }
                
                /* Print header (hidden on screen) */
                .print-header {
                    display: none;
                }
                
                @media print {
                    .print-header {
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
}
