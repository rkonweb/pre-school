"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getStudentAction } from "@/app/actions/student-actions";
import { getStudentSmartAnalyticsAction, SmartAnalytics } from "@/app/actions/analytics-actions";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend
} from "recharts";
import { Printer, TrendingUp, TrendingDown, Award, AlertCircle, Calendar, Activity, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PrintableReport from "@/components/reports/PrintableReport";

export default function StudentProgressReportPage() {
    const params = useParams();
    const slug = params.slug as string;
    const studentId = params.studentId as string;

    const [student, setStudent] = useState<any>(null);
    const [analytics, setAnalytics] = useState<SmartAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Progress_Report_${student?.firstName}_${student?.lastName}`,
        pageStyle: `
        @page { size: A4; margin: 0; }
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
        `
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [studentRes, analyticsRes] = await Promise.all([
                getStudentAction(studentId),
                getStudentSmartAnalyticsAction(slug, studentId)
            ]);

            if (studentRes.success) {
                setStudent(studentRes.student);
            } else {
                toast.error(studentRes.error || "Failed to load student");
            }

            if (analyticsRes.success && analyticsRes.data) {
                setAnalytics(analyticsRes.data);
            } else {
                // If no data, analytics might be empty but success
                // toast.error(analyticsRes.error || "Failed to load analytics");
            }

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while loading data");
        } finally {
            setIsLoading(false);
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case "STRENGTH": return <Award className="h-5 w-5 text-yellow-600" />;
            case "WEAKNESS": return <AlertCircle className="h-5 w-5 text-red-600" />;
            case "TREND": return <TrendingUp className="h-5 w-5 text-blue-600" />;
            case "ATTENDANCE": return <Calendar className="h-5 w-5 text-orange-600" />;
            default: return <Activity className="h-5 w-5 text-slate-600" />;
        }
    };

    if (isLoading) {
        return <div className="space-y-4 p-8">
            <div className="h-32 bg-slate-100 animate-pulse rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-40 bg-slate-100 animate-pulse rounded-xl" />
                <div className="h-40 bg-slate-100 animate-pulse rounded-xl" />
                <div className="h-40 bg-slate-100 animate-pulse rounded-xl" />
            </div>
        </div>;
    }

    if (!student || !analytics) {
        return <div className="text-center py-20">Student not found or data unavailable.</div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {student.avatar ? (
                            <img src={student.avatar} alt={student.firstName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-blue-600">{student.firstName[0]}</span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">Adm: {student.admissionNumber || "N/A"}</span>
                            <span>•</span>
                            <span>Class: {student.classroom?.name || "Unassigned"}</span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => handlePrint()} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Printer className="h-4 w-4" />
                    Print Report Card
                </Button>
            </div>

            {/* Smart Insights Carousel/Grid */}
            {analytics.insights.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.insights.map((insight, idx) => (
                        <Card key={idx} className={`border-l-4 ${insight.sentiment === 'POSITIVE' ? 'border-l-green-500 bg-green-50/50' :
                            insight.sentiment === 'NEGATIVE' ? 'border-l-red-500 bg-red-50/50' : 'border-l-blue-500 bg-slate-50'
                            }`}>
                            <CardContent className="p-4 flex gap-3 items-start">
                                <div className="mt-1">{getInsightIcon(insight.type)}</div>
                                <div>
                                    <p className="font-semibold text-sm uppercase text-muted-foreground mb-1">{insight.type}</p>
                                    <p className="text-sm font-medium leading-relaxed">{insight.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academics">Academic Detail</TabsTrigger>
                    <TabsTrigger value="co-scholastic">Co-Scholastic</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.academics.overallPercentage.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across {analytics.academics.totalExams} exams
                                </p>
                                <Progress value={analytics.academics.overallPercentage} className="h-2 mt-3" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.attendance.percentage.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {analytics.attendance.present} Present / {analytics.attendance.totalDays} Working Days
                                </p>
                                <Progress value={analytics.attendance.percentage} className="h-2 mt-3 bg-red-100" indicatorClassName={analytics.attendance.percentage < 75 ? "bg-red-500" : "bg-green-500"} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Best Subject</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold truncate">{analytics.academics.bestSubject}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Highest average score
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className={`text-2xl font-bold ${analytics.academics.trend === 'IMPROVING' ? 'text-green-600' :
                                        analytics.academics.trend === 'DECLINING' ? 'text-red-500' : 'text-yellow-600'
                                        }`}>
                                        {analytics.academics.trend}
                                    </div>
                                    {analytics.academics.trend === 'IMPROVING' ? <TrendingUp className="h-5 w-5 text-green-600" /> :
                                        analytics.academics.trend === 'DECLINING' ? <TrendingDown className="h-5 w-5 text-red-500" /> : null}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Based on last 3 exams
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 h-[400px]">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Performance Trajectory</CardTitle>
                                <CardDescription>Overall percentage trend over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.academics.examHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Subject Proficiency</CardTitle>
                                <CardDescription>Average performance by subject</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.academics.subjectPerformance} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="subject" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="average" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f1f5f9' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ACADEMICS TAB */}
                <TabsContent value="academics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Exam History</CardTitle>
                            <CardDescription>A complete log of all assessments and grades.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 rounded-l-lg">Exam</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Result</th>
                                            <th className="px-6 py-3 rounded-r-lg">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.academics.examHistory.map((exam: any, i: number) => (
                                            <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{exam.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{exam.date}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{exam.percentage.toFixed(1)}%</span>
                                                        <Progress value={exam.percentage} className="w-24 h-1.5" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {i > 0 && exam.percentage > analytics.academics.examHistory[i - 1].percentage ? (
                                                        <span className="text-green-600 text-xs flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{(exam.percentage - analytics.academics.examHistory[i - 1].percentage).toFixed(1)}%</span>
                                                    ) : i > 0 ? (
                                                        <span className="text-red-500 text-xs flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {(exam.percentage - analytics.academics.examHistory[i - 1].percentage).toFixed(1)}%</span>
                                                    ) : <span className="text-gray-400 text-xs">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CO-SCHOLASTIC TAB */}
                <TabsContent value="co-scholastic" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    Health Record
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics.health ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase">Height</p>
                                                <p className="font-bold text-lg">{analytics.health.height} {analytics.health.heightUnit}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase">Weight</p>
                                                <p className="font-bold text-lg">{analytics.health.weight} {analytics.health.weightUnit}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase">Vision</p>
                                                <p className="font-bold text-lg">{analytics.health.vision || "Normal"}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase">Dental</p>
                                                <p className="font-bold text-lg">{analytics.health.dental || "Good"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1">General Observations:</p>
                                            <p className="text-sm text-slate-600">{analytics.health.observations || "No specific observations recorded."}</p>
                                        </div>
                                        <p className="text-xs text-right text-muted-foreground">Recorded on: {format(new Date(analytics.health.recordedAt), 'PP')}</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No health records available.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Activities & Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analytics.activities.length > 0 ? (
                                    <div className="space-y-6">
                                        {analytics.activities.map((act, i) => (
                                            <div key={i} className="relative pl-6 border-l-2 border-slate-200 last:border-0 pb-4">
                                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-100 border-2 border-blue-500" />
                                                <p className="text-xs text-muted-foreground mb-1">{format(new Date(act.date), "MMMM d, yyyy")}</p>
                                                <h4 className="font-bold text-sm">{act.title}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{act.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No activity records available.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Hidden Printable Report */}
            <div className="hidden">
                {student && analytics && (
                    <PrintableReport
                        ref={reportRef}
                        student={student}
                        school={student.school}
                        analytics={analytics}
                    />
                )}
            </div>
        </div>
    );
}
