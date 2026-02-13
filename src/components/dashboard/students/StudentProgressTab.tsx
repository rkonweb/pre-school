"use client";

import { useEffect, useState } from "react";
import { getStudentSmartAnalyticsAction, SmartAnalytics } from "@/app/actions/analytics-actions";
import { getCookie } from "@/lib/cookies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    AreaChart, Area
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus, BookOpen, Activity, Heart, Trophy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProgressTabProps {
    schoolSlug: string;
    studentId: string;
}

export function StudentProgressTab({ schoolSlug, studentId }: StudentProgressTabProps) {
    const [data, setData] = useState<SmartAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();
    }, [studentId, schoolSlug]);

    const loadAnalytics = async () => {
        setLoading(true);
        const academicYearId = getCookie(`academic_year_${schoolSlug}`) || undefined;
        const res = await getStudentSmartAnalyticsAction(schoolSlug, studentId, academicYearId);
        if (res.success && res.data) {
            setData(res.data);
        } else {
            setError(res.error || "Failed to load analytics");
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-zinc-400">
                <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
                <p>Could not load progress data</p>
            </div>
        );
    }

    // Format Data for Radar Chart
    const radarData = [
        { subject: 'Academics', A: data.academics.overallPercentage, fullMark: 100 },
        { subject: 'Attendance', A: data.attendance.percentage, fullMark: 100 },
        { subject: 'Activities', A: Math.min(data.activities.length * 20, 100), fullMark: 100 },
        { subject: 'Health', A: data.health ? 85 : 50, fullMark: 100 }, // Placeholder scoring for health presence
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Insights Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.insights.map((insight, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "p-6 rounded-[24px] border animate-in fade-in slide-in-from-bottom-4 duration-700",
                            insight.sentiment === 'POSITIVE' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                                insight.sentiment === 'NEGATIVE' ? "bg-red-50 border-red-100 text-red-800" :
                                    "bg-blue-50 border-blue-100 text-blue-800"
                        )}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {insight.type === 'TREND' && <TrendingUp className="h-5 w-5" />}
                            {insight.type === 'STRENGTH' && <Trophy className="h-5 w-5" />}
                            {insight.type === 'WEAKNESS' && <AlertCircle className="h-5 w-5" />}
                            {insight.type === 'ATTENDANCE' && <Activity className="h-5 w-5" />}
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{insight.type}</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{insight.message}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Overview Chart */}
                <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">Academic Trajectory</h3>
                            <p className="text-zinc-500 text-sm mt-1">Performance trend over recent exams</p>
                        </div>
                        <div className={cn(
                            "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2",
                            data.academics.trend === 'IMPROVING' ? "bg-emerald-100 text-emerald-700" :
                                data.academics.trend === 'DECLINING' ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
                        )}>
                            {data.academics.trend === 'IMPROVING' ? <TrendingUp className="h-4 w-4" /> :
                                data.academics.trend === 'DECLINING' ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                            {data.academics.trend}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.academics.examHistory}>
                                <defs>
                                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
                                />
                                <Area type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Holistic Radar */}
                <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col">
                    <h3 className="text-xl font-black text-zinc-900 mb-2">Holistic Balance</h3>
                    <p className="text-zinc-500 text-sm mb-6">Across key development areas</p>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Subject Performance */}
                <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900">Subject Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                        {data.academics.subjectPerformance.map((sub) => (
                            <div key={sub.subject} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                <span className="font-bold text-zinc-700">{sub.subject}</span>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-xs font-black text-zinc-400 uppercase tracking-wider">Average</div>
                                        <div className="font-bold text-zinc-900">{sub.average.toFixed(1)}%</div>
                                    </div>
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                                        sub.grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                                            sub.grade.startsWith('B') ? "bg-blue-100 text-blue-700" :
                                                sub.grade.startsWith('F') ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        {sub.grade}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance & Health */}
                <div className="space-y-8">
                    {/* Attendance Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900">Attendance Stats</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900">
                                <div className="text-2xl font-black">{data.attendance.present}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Present</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-50 text-red-900">
                                <div className="text-2xl font-black">{data.attendance.absent}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Absent</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-50 text-zinc-900">
                                <div className="text-2xl font-black">{data.attendance.percentage}%</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Health Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                                <Heart className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900">Latest Vitals</h3>
                        </div>
                        {data.health ? (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Height</div>
                                    <div className="text-2xl font-black text-zinc-900">{data.health.height} <span className="text-sm text-zinc-400 font-bold">cm</span></div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Weight</div>
                                    <div className="text-2xl font-black text-zinc-900">{data.health.weight} <span className="text-sm text-zinc-400 font-bold">kg</span></div>
                                </div>
                                <div className="col-span-2 mt-2 p-3 rounded-xl bg-zinc-50 text-xs font-medium text-zinc-600">
                                    <span className="font-bold text-zinc-900">Note:</span> {data.health.generalHealth || "No remarks"}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-zinc-400 font-medium text-sm">No health records available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
