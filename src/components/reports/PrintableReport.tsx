import React from "react";
import { format } from "date-fns";
import { SmartAnalytics } from "@/app/actions/analytics-actions";

interface PrintableReportProps {
    student: any;
    school: any;
    analytics: SmartAnalytics;
    term?: string;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({ student, school, analytics, term }, ref) => {
    return (
        <div ref={ref} className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-slate-900" style={{ fontFamily: 'Times New Roman, serif' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    {school.logo && <img src={school.logo} alt={school.name} className="h-20 w-20 object-contain" />}
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide">{school.name}</h1>
                        <p className="text-sm mt-1">{school.address}, {school.city}</p>
                        <p className="text-sm">{school.email} | {school.phone}</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold uppercase bg-slate-900 text-white inline-block px-8 py-1 mt-2">
                    Student Progress Report
                </h2>
                {term && <p className="mt-2 text-sm font-semibold uppercase">{term}</p>}
            </div>

            {/* Student Profile */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div className="space-y-2">
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Student Name:</span>
                        <span>{student.firstName} {student.lastName}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Admission No:</span>
                        <span>{student.admissionNumber || "N/A"}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Grade/Class:</span>
                        <span>{student.classroom?.name || "N/A"}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Parent/Guardian:</span>
                        <span>{student.parentName}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Date of Birth:</span>
                        <span>{student.dateOfBirth ? format(new Date(student.dateOfBirth), "dd MMM yyyy") : "N/A"}</span>
                    </div>
                    <div className="flex border-b border-dashed border-slate-300 pb-1">
                        <span className="font-bold w-32">Report Date:</span>
                        <span>{format(new Date(), "dd MMM yyyy")}</span>
                    </div>
                </div>
            </div>

            {/* Academic Performance */}
            <div className="mb-8">
                <h3 className="font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1">Academic Performance</h3>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-left">
                            <th className="border border-slate-300 p-2">Subject</th>
                            <th className="border border-slate-300 p-2 text-center">Average Score</th>
                            <th className="border border-slate-300 p-2 text-center">Grade</th>
                            <th className="border border-slate-300 p-2 text-center">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.academics.subjectPerformance.map((sub, idx) => (
                            <tr key={idx}>
                                <td className="border border-slate-300 p-2 font-medium">{sub.subject}</td>
                                <td className="border border-slate-300 p-2 text-center">{sub.average.toFixed(1)}%</td>
                                <td className="border border-slate-300 p-2 text-center font-bold">{sub.grade}</td>
                                <td className="border border-slate-300 p-2 italic text-xs text-slate-500">
                                    {sub.average >= 90 ? "Excellent" : sub.average >= 75 ? "Good" : sub.average >= 50 ? "Satisfactory" : "Needs Improvement"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex justify-end gap-x-8 text-sm font-bold">
                    <span>Overall Percentage: {analytics.academics.overallPercentage.toFixed(1)}%</span>
                    <span>Total Exams: {analytics.academics.totalExams}</span>
                </div>
            </div>

            {/* Attendance & Co-Scholastic Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Attendance */}
                <div>
                    <h3 className="font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1">Attendance Record</h3>
                    <div className="bg-slate-50 p-4 border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span>Total Working Days:</span>
                            <span className="font-bold">{analytics.attendance.totalDays}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span>Days Present:</span>
                            <span className="font-bold text-green-700">{analytics.attendance.present}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                            <span className="font-bold">Attendance Percentage:</span>
                            <span className="font-bold">{analytics.attendance.percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Health/Insights */}
                <div>
                    <h3 className="font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1">Teacher's Observations</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        {analytics.insights.map((insight, i) => (
                            <li key={i} className="text-slate-800">
                                {insight.message}
                            </li>
                        ))}
                        {analytics.insights.length === 0 && <li className="italic text-slate-500">No specific observations recorded.</li>}
                    </ul>
                </div>
            </div>

            {/* Activities if any */}
            {analytics.activities.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1">Co-Curricular Achievements</h3>
                    <div className="space-y-2">
                        {analytics.activities.map((act, i) => (
                            <div key={i} className="flex gap-4 text-sm border-b border-slate-100 pb-2">
                                <span className="font-semibold text-slate-700 w-24">{format(new Date(act.date), "MMM d, yyyy")}</span>
                                <div>
                                    <p className="font-bold">{act.title}</p>
                                    <p className="text-slate-600">{act.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Signatures */}
            <div className="mt-auto pt-16">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-400 mb-2"></div>
                        <p className="text-xs font-bold uppercase">Class Teacher</p>
                    </div>
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-400 mb-2"></div>
                        <p className="text-xs font-bold uppercase">Parent / Guardian</p>
                    </div>
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-400 mb-2"></div>
                        <p className="text-xs font-bold uppercase">Principal</p>
                    </div>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-8">
                    Generated on {format(new Date(), "PPpp")} | {school.name}
                </p>
            </div>
        </div>
    );
});

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
