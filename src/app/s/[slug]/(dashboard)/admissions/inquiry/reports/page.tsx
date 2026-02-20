"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    Download,
    Filter,
    ChevronLeft,
    Loader2,
    Calendar,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getAdmissionsReportAction } from "@/app/actions/admissions-report-actions";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RePie,
    Pie,
    AreaChart,
    Area
} from "recharts";

export default function InquiryReportsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("source");
    const [timeframe, setTimeframe] = useState("month");

    useEffect(() => {
        loadReport();
    }, [slug, timeframe]);

    async function loadReport() {
        setIsLoading(true);
        const res = await getAdmissionsReportAction(slug, timeframe);
        if (res.success) {
            setReportData(res.data);
        }
        setIsLoading(false);
    }

    const TABS = [
        { id: "source", label: "Source ROI", icon: Target },
        { id: "funnel", label: "Funnel Drop-off", icon: TrendingUp },
        { id: "staff", label: "Staff Performance", icon: Users },
        { id: "tours", label: "Tour Conversion", icon: BarChart3 },
    ];

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                            Admissions Intelligence
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        Real-time marketing & sales optimization
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="h-10 px-4 bg-zinc-100 border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">This Month</option>
                        <option value="90days">Last 90 Days</option>
                    </select>
                    <button className="h-10 px-4 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-brand transition-all">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Report Content */}
            {isLoading ? (
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crunching admissions data...</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Visualization Container */}
                    <div className="lg:col-span-2 rounded-[40px] border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black uppercase tracking-tight">
                                {activeTab === 'source' ? 'Lead Source ROI' : activeTab === 'funnel' ? 'Conversion Pipeline' : activeTab === 'staff' ? 'Team Performance' : 'Tour Analytics'}
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Visuals</span>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            {activeTab === 'source' && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData?.sources}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                        <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#a1a1aa' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#a1a1aa' }} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-zinc-800">
                                                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">{data.source}</p>
                                                            <p className="text-xl font-black text-white">{data.count} Leads</p>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2">{data.admitted} Enrollments ({data.rate.toFixed(1)}%)</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                            {reportData?.sources?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                            {activeTab === 'funnel' && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportData?.funnel}>
                                        <defs>
                                            <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                        <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#a1a1aa' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#a1a1aa' }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorFunnel)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                            {activeTab === 'staff' && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={reportData?.staff}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#a1a1aa' }} width={100} />
                                        <Tooltip />
                                        <Bar dataKey="interactions" fill="#8b5cf6" radius={[0, 10, 10, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                            {activeTab === 'tours' && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="relative h-64 w-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePie>
                                                <Pie
                                                    data={[
                                                        { name: 'Completed', value: reportData?.tours?.completed || 0 },
                                                        { name: 'Pending', value: (reportData?.tours?.total || 0) - (reportData?.tours?.completed || 0) }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#f4f4f5" />
                                                </Pie>
                                            </RePie>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-3xl font-black text-zinc-900">{reportData?.tours?.rate.toFixed(0)}%</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Show Rate</p>
                                        </div>
                                    </div>
                                    <p className="mt-8 text-sm font-bold text-zinc-500 max-w-sm text-center">
                                        {reportData?.tours?.completed} tours taken out of {reportData?.tours?.total} scheduled in this period.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 mt-10">
                            <div className="p-6 rounded-[32px] bg-zinc-50 border border-zinc-100">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Top Performer</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-zinc-900">{reportData?.sources[0]?.source || "N/A"}</p>
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-widest mt-1">
                                            {reportData?.sources[0]?.rate.toFixed(1)}% conversion
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-[32px] bg-zinc-50 border border-zinc-100">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Total Engagement</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-zinc-900">
                                            {reportData?.staff.reduce((acc: any, curr: any) => acc + curr.interactions, 0)}
                                        </p>
                                        <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-1">Total Touchpoints</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Insights Panel */}
                    <div className="flex flex-col gap-8">
                        <div className="rounded-[40px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40">
                            <h3 className="text-sm font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-brand" /> Market Trends
                            </h3>
                            <div className="flex flex-col gap-6">
                                {reportData?.sources.slice(0, 4).map((source: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100/50">
                                            <span className="text-xs font-bold text-zinc-600">{source.source}</span>
                                            <span className="text-xs font-black text-zinc-900">{source.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand"
                                                style={{ width: `${(source.count / (reportData.sources[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[40px] bg-zinc-900 p-8 text-white shadow-xl shadow-zinc-900/20">
                            <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-brand flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> AI Strategy
                            </h3>
                            <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">
                                {reportData?.sources[0]?.rate < 5 ? (
                                    `"Leads from ${reportData?.sources[0]?.source} have high volume but low conversion. We recommend prioritizing ${reportData?.sources[1]?.source || 'other sources'} for immediate follow-ups."`
                                ) : (
                                    `"${reportData?.sources[0]?.source} is performing exceptionally well with a ${reportData?.sources[0]?.rate.toFixed(1)}% conversion rate. Increase engagement frequency for this channel."`
                                )}
                            </p>
                            <button className="w-full mt-6 py-3 bg-brand text-[var(--secondary-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all">
                                Tune AI weights
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
