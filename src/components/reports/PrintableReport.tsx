import React from "react";
import { format } from "date-fns";
import { SmartAnalytics } from "@/app/actions/analytics-actions";

interface PrintableReportProps {
    student: any;
    school: any;
    analytics: SmartAnalytics;
    term?: string;
    selectedExamId?: string;
    academicYearName?: string;
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({ student, school, analytics, term, selectedExamId, academicYearName }, ref) => {
    const isSingleExam = !!selectedExamId;
    const historyToRender = isSingleExam
        ? analytics.academics.examHistory.filter((e: any) => e.id === selectedExamId)
        : analytics.academics.examHistory;

    const academicYear = academicYearName || (() => {
        const startMonth = school.academicYearStartMonth || 4;
        const today = new Date();
        const m = today.getMonth() + 1;
        const y = today.getFullYear();
        return m >= startMonth ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    })();

    return (
        <div ref={ref} className={`bg-white p-8 max-w-[210mm] mx-auto ${isSingleExam ? 'min-h-0 pb-20' : 'min-h-[297mm]'} text-slate-900 printable-report`} style={{ fontFamily: 'Times New Roman, serif' }}>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                    }
                    svg {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .printable-report {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                    {(school.printableLogo || school.logo) && (
                        <img
                            src={school.printableLogo || school.logo}
                            alt={school.name}
                            className="h-24 w-24 object-contain"
                        />
                    )}
                </div>
                <h2 className="text-lg font-bold uppercase bg-slate-900 text-white inline-block px-6 py-0.5 mt-1">
                    {isSingleExam ? "Assessment Report" : "Student Annual Progress Report"}
                </h2>
                <div className="mt-1 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    <span>Academic Year: {academicYear}</span>
                    {term && <span className="border-l border-slate-300 pl-6">{term}</span>}
                </div>
            </div>

            {/* Student Profile */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-4 text-[12px]">
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

            {!isSingleExam && (
                <>
                    {/* Visual Analytics Section */}
                    <div className="mb-4 page-break-inside-avoid">
                        <h3 className="text-xs font-bold uppercase border-b border-slate-900 mb-3 pb-0.5">Academic Performance Visualization</h3>
                        <div className="space-y-4">
                            {/* Detailed Subject Performance Chart */}
                            <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 relative overflow-hidden">
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-2 text-center tracking-tighter">Subject Performance & Consistency</p>
                                <svg width="100%" height="200" viewBox="0 0 800 200" className="overflow-visible">
                                    <defs>
                                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#0f172a" />
                                            <stop offset="100%" stopColor="#334155" />
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="2" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>

                                    {/* Color Zones Background */}
                                    <rect x="150" y="10" width="600" height="210" fill="#fff" rx="8" />
                                    <rect x="630" y="10" width="120" height="210" fill="#f0fdf4" opacity="0.6" /> {/* A Zone */}
                                    <rect x="510" y="10" width="120" height="210" fill="#eff6ff" opacity="0.4" /> {/* B Zone */}

                                    {/* Vertical Grid Lines */}
                                    {[0, 25, 50, 75, 100].map((v, i) => (
                                        <g key={i}>
                                            <line x1={150 + (v * 6)} y1="10" x2={150 + (v * 6)} y2="220" stroke="#f1f5f9" strokeWidth="1.5" />
                                            <text x={150 + (v * 6)} y="235" fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">{v}%</text>
                                        </g>
                                    ))}

                                    {analytics.academics.subjectPerformance.map((sub, i) => {
                                        const y = i * 32 + 25;
                                        const avgWidth = (sub.average / 100) * 600;
                                        const minPos = (sub.min / 100) * 600;
                                        const maxPos = (sub.max / 100) * 600;

                                        return (
                                            <g key={i}>
                                                <text x="10" y={y + 10} fontSize="12" fontWeight="800" fill="#1e293b">{sub.subject}</text>

                                                {/* Background track */}
                                                <rect x="150" y={y} width="600" height="14" fill="#f8fafc" rx="7" />

                                                {/* Range Line (Low to High) */}
                                                <line x1={150 + minPos} y1={y + 7} x2={150 + maxPos} y2={y + 7} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

                                                {/* Average Bar with Gradient */}
                                                <rect x="150" y={y + 2} width={avgWidth} height="10" fill="url(#barGradient)" rx="5" />

                                                {/* Min/Max Markers with larger circles */}
                                                <circle cx={150 + minPos} cy={y + 7} r="4" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                                                <circle cx={150 + maxPos} cy={y + 7} r="4" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />

                                                <text x={765} y={y + 11} fontSize="11" fontWeight="900" textAnchor="start" fill="#0f172a">{sub.average.toFixed(0)}%</text>
                                            </g>
                                        );
                                    })}

                                    {/* Legend */}
                                    <g transform="translate(10, 222)">
                                        <circle cx="0" cy="0" r="3" fill="#ef4444" /><text x="8" y="4" fontSize="9" fontWeight="600" fill="#64748b">Low Score</text>
                                        <circle cx="80" cy="0" r="3" fill="#22c55e" /><text x="88" y="4" fontSize="9" fontWeight="600" fill="#64748b">High Score</text>
                                        <rect x="160" y="-2" width="15" height="4" fill="#0f172a" rx="2" /><text x="180" y="4" fontSize="9" fontWeight="600" fill="#64748b">Yearly Average</text>
                                    </g>
                                </svg>
                            </div>

                            {/* Academic Trend & Performance Benchmarks */}
                            <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50 relative overflow-hidden">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 text-center tracking-tighter">Yearly Academic Progression</p>
                                <svg width="100%" height="240" viewBox="0 0 800 240" className="overflow-visible">
                                    <defs>
                                        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.1" />
                                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Performance Bands Background */}
                                    <rect x="50" y="20" width="700" height="50" fill="#f0fdf4" rx="4" /> {/* Excellent */}
                                    <rect x="50" y="70" width="700" height="40" fill="#eff6ff" rx="4" /> {/* Good */}
                                    <rect x="50" y="110" width="700" height="40" fill="#fffbea" rx="4" /> {/* Average */}
                                    <rect x="50" y="150" width="700" height="40" fill="#fef2f2" rx="4" /> {/* Needs Attention */}

                                    {/* Y-Axis Labels */}
                                    {[100, 75, 50, 25].map((val, i) => (
                                        <text key={i} x="40" y={190 - (val * 1.6) + 3} fontSize="9" fontWeight="bold" textAnchor="end" fill="#94a3b8">{val}%</text>
                                    ))}

                                    {/* Performance Area Fill (Gentle Shadow under line) */}
                                    <path
                                        d={`M ${analytics.academics.examHistory.map((e: any, i: number) => {
                                            const x = 50 + (i * (700 / (Math.max(1, analytics.academics.examHistory.length - 1))));
                                            const y = 190 - (e.percentage * 1.6);
                                            return `${x},${y}`;
                                        }).join(' L ')} L ${50 + ((analytics.academics.examHistory.length - 1) * (700 / (Math.max(1, analytics.academics.examHistory.length - 1))))},190 L 50,190 Z`}
                                        fill="url(#trendGradient)"
                                    />

                                    {/* Trend Path Line */}
                                    <path
                                        d={`M ${analytics.academics.examHistory.map((e: any, i: number) => {
                                            const x = 50 + (i * (700 / (Math.max(1, analytics.academics.examHistory.length - 1))));
                                            const y = 190 - (e.percentage * 1.6);
                                            return `${x},${y}`;
                                        }).join(' L ')}`}
                                        fill="none"
                                        stroke="#0f172a"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#glow)"
                                    />

                                    {/* Data Nodes & Date Annotations */}
                                    {analytics.academics.examHistory.map((e: any, i: number) => {
                                        const x = 50 + (i * (700 / (Math.max(1, analytics.academics.examHistory.length - 1))));
                                        const y = 190 - (e.percentage * 1.6);
                                        return (
                                            <g key={i}>
                                                <circle cx={x} cy={y} r="6" fill="#fff" stroke="#0f172a" strokeWidth="3" />
                                                <text x={x} y={y - 15} fontSize="11" fontWeight="950" textAnchor="middle" fill="#0f172a">{e.percentage.toFixed(1)}%</text>

                                                <text x={x} y="210" fontSize="10" fontWeight="900" textAnchor="middle" fill="#1e293b">{e.name}</text>
                                                <text x={x} y="222" fontSize="8" fontWeight="600" textAnchor="middle" fill="#94a3b8">{e.date}</text>
                                            </g>
                                        );
                                    })}

                                    {/* Annotations */}
                                    <text x="755" y="45" fontSize="8" fontWeight="bold" fill="#166534" textAnchor="start">Top Tier</text>
                                    <text x="755" y="170" fontSize="8" fontWeight="bold" fill="#991b1b" textAnchor="start">Critical</text>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Subject Analysis */}
                    <div className="mb-4 page-break-inside-avoid">
                        <h3 className="text-xs font-bold uppercase border-b border-slate-900 mb-3 pb-0.5">Subject-wise Analytics & Observations</h3>
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="border border-slate-900 p-2 text-left">Subject</th>
                                    <th className="border border-slate-900 p-2 text-center">Avg %</th>
                                    <th className="border border-slate-900 p-2 text-center">Highest</th>
                                    <th className="border border-slate-900 p-2 text-center">Lowest</th>
                                    <th className="border border-slate-900 p-2 text-left">Academic Strength/Weakness Analysis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.academics.subjectPerformance.map((sub, idx) => (
                                    <tr key={idx} className="border-b border-slate-200">
                                        <td className="border-x border-slate-200 p-2 font-bold">{sub.subject}</td>
                                        <td className="border-x border-slate-200 p-2 text-center font-bold bg-slate-50">{sub.average.toFixed(1)}%</td>
                                        <td className="border-x border-slate-200 p-2 text-center text-green-700 font-bold">{sub.max}</td>
                                        <td className="border-x border-slate-200 p-2 text-center text-red-700 font-bold">{sub.min}</td>
                                        <td className="border-x border-slate-200 p-2 italic text-slate-600 leading-relaxed">
                                            {sub.average >= 90 ? `Outstanding mastery in ${sub.subject}. Consistently achieves high scores.` :
                                                sub.average >= 75 ? `Demonstrates strong understanding of ${sub.subject} concepts with steady performance.` :
                                                    sub.average >= 50 ? `Satisfactory performance in ${sub.subject}. Targeted practice could further improve results.` :
                                                        `Needs focused intervention and remedial support in ${sub.subject} to bridge learning gaps.`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Detailed Exam Breakdown */}
            <div className="mb-4">
                <h3 className="text-xs font-bold uppercase border-b border-slate-900 mb-3 pb-0.5">
                    {isSingleExam ? "Assessment Breakdown" : "Assessment-wise Performance Breakdown"}
                </h3>
                <div className={`${isSingleExam ? 'space-y-0' : 'space-y-3'}`}>
                    {historyToRender.slice().reverse().map((exam: any, idx: number) => (
                        <div key={idx} className={`border border-slate-200 rounded-lg overflow-hidden page-break-inside-avoid shadow-sm ${isSingleExam ? 'border-none shadow-none' : ''}`}>
                            {!isSingleExam && (
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-sm tracking-wide capitalize">{exam.name}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase">{exam.date} | Score: {exam.percentage.toFixed(1)}%</span>
                                </div>
                            )}
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className={`bg-white text-left ${isSingleExam ? 'border-b-2 border-slate-900' : ''}`}>
                                        <th className="border-r border-slate-200 p-2 w-1/2">Subject</th>
                                        <th className="border-r border-slate-200 p-2 text-center">Marks Obtained</th>
                                        <th className="border-r border-slate-200 p-2 text-center">Max Marks</th>
                                        <th className="p-2 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className={`${isSingleExam ? '' : 'border-t border-slate-200'}`}>
                                    {exam.subjects?.map((sub: any, sIdx: number) => (
                                        <tr key={sIdx} className="border-b border-slate-100 last:border-b-0">
                                            <td className="border-r border-slate-200 p-2 font-medium">{sub.name}</td>
                                            <td className="border-r border-slate-200 p-2 text-center font-bold">{sub.marks}</td>
                                            <td className="border-r border-slate-200 p-2 text-center text-slate-400">{sub.maxMarks}</td>
                                            <td className="p-2 text-center font-bold">{sub.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>

            {!isSingleExam && (
                <>
                    {/* Attendance & Co-Scholastic Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-4">
                        {/* Attendance */}
                        <div className="page-break-inside-avoid">
                            <h3 className="text-xs font-bold uppercase border-b border-slate-900 mb-2 pb-0.5">Attendance Record</h3>
                            <div className="bg-slate-50 p-3 border border-slate-200 text-[11px]">
                                <div className="flex justify-between items-center mb-1">
                                    <span>Total Working Days:</span>
                                    <span className="font-bold">{analytics.attendance.totalDays}</span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span>Days Present:</span>
                                    <span className="font-bold text-green-700">{analytics.attendance.present}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-1 mt-1">
                                    <span className="font-bold">Attendance Percentage:</span>
                                    <span className="font-bold">{analytics.attendance.percentage.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="page-break-inside-avoid">
                            <h3 className="text-xs font-bold uppercase border-b border-slate-900 mb-2 pb-0.5">Teacher's Observations</h3>
                            <ul className="list-disc pl-5 text-[11px] space-y-0.5">
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
                </>
            )}

            {/* Signatures */}
            <div className="mt-auto pt-8">
                <div className="flex justify-between items-end">
                    <div className="text-center">
                        <div className="w-32 border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold uppercase">Class Teacher</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold uppercase">Parent / Guardian</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold uppercase">Principal</p>
                    </div>
                </div>
                <p className="text-center text-[9px] text-slate-400 mt-6 font-bold uppercase tracking-widest">
                    Academic Year {academicYear} | Generated on {format(new Date(), "PPpp")} | {school.name}
                </p>
            </div>
        </div>
    );
});

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
