"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    LayoutGrid,
    List as ListIcon,
    Plus,
    Loader2,
    Calendar,
    Filter,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { getLeadStatsAction, getRecentActivityAction } from "@/app/actions/lead-actions";
import { StatsGrid } from "@/components/dashboard/leads/StatsGrid";
import { FunnelChart } from "@/components/dashboard/leads/FunnelChart";
import { RecentActivityFeed } from "@/components/dashboard/leads/RecentActivityFeed";

export default function InquiryDashboard() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const [statsRes, activityRes] = await Promise.all([
            getLeadStatsAction(slug),
            getRecentActivityAction(slug)
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (activityRes.success) setActivities(activityRes.activities || []);
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
            </div>
        );
    }

    // Process data for Funnel Chart
    const funnelStages = [
        { id: "NEW", label: "New Leads", fill: "#8884d8" },
        { id: "INTERESTED", label: "Interested", fill: "#82ca9d" },
        { id: "TOUR_COMPLETED", label: "Tours Done", fill: "#ffc658" },
        { id: "ADMISSION_CONFIRMED", label: "Confirmed", fill: "#ff8042" },
        { id: "ENROLLED", label: "Enrolled", fill: "#00C49F" },
    ];

    const funnelData = funnelStages.map(stage => {
        const count = stats?.byStatus?.find((s: any) => s.status === stage.id)?._count?._all || 0;
        return {
            ...stage,
            value: count
        };
    }).filter(d => d.value > 0);
    // Recharts Funnel looks better if we filter out zeros or keep them depend on preference. 
    // Keeping zeros might look weird if the funnel collapses. Let's keep them if it's strictly ordered, 
    // but for now let's just show stages with data or all stages? 
    // Actually, showing all stages usually makes a better funnel visual even if 0.
    const fullFunnelData = funnelStages.map(stage => ({
        ...stage,
        value: stats?.byStatus?.find((s: any) => s.status === stage.id)?._count?._all || 0
    }));


    return (
        <div className="flex flex-col gap-8 pb-32 animate-in fade-in duration-500">
            {/* Hero Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">
                        <Calendar className="h-3 w-3" />
                        <span>Academic Year 2026-27</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                        Admissions Overview
                    </h1>
                    <p className="text-zinc-500 font-medium mt-2 max-w-md">
                        Track your enquiry funnel, monitor staff performance, and manage daily follow-ups from one central hub.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                        <Link href={`/s/${slug}/admissions/inquiry`} className="bg-white shadow-sm px-4 py-2 rounded-xl text-brand text-xs font-black uppercase flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Overview
                        </Link>
                        <Link href={`/s/${slug}/admissions/inquiry/list`} className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-600 text-xs font-black uppercase flex items-center gap-2 transition-colors">
                            <ListIcon className="h-4 w-4" />
                            List View
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={stats} />

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Funnel Section */}
                    <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Conversion Funnel</h3>
                                <p className="text-xs text-zinc-400 font-medium mt-1">Lead progression from enquiry to enrollment</p>
                            </div>
                            <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-brand transition-colors">
                                <Filter className="h-3 w-3" />
                                <span>Filter</span>
                            </button>
                        </div>

                        <FunnelChart data={fullFunnelData} />
                    </div>

                    {/* Quick Actions Bar (Visual only for now, can be expanded) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href={`/s/${slug}/admissions/new`}
                            className="h-24 rounded-2xl bg-brand text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all"
                        >
                            <Plus className="h-6 w-6" />
                            <span className="text-xs font-black uppercase tracking-wider">New Enquiry</span>
                        </Link>
                        <Link
                            href={`/s/${slug}/admissions/inquiry/list?status=overdue`}
                            className="h-24 rounded-2xl bg-white border border-zinc-200 text-zinc-600 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
                        >
                            <Loader2 className="h-6 w-6" />
                            <span className="text-xs font-black uppercase tracking-wider">Pending Tasks</span>
                        </Link>
                        {/* More placeholders for future actions */}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-8">
                    {/* Live Feed */}
                    <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 h-fit max-h-[800px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                Live Feed
                            </h3>
                            <Link href="#" className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600">View All</Link>
                        </div>
                        <div className="overflow-y-auto pr-2 -mr-2">
                            <RecentActivityFeed activities={activities} />
                        </div>
                    </div>

                    {/* Top Performers Mini-Widget */}
                    <div className="rounded-[32px] bg-zinc-900 text-white p-8 shadow-xl shadow-zinc-900/20">
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand mb-6">Top Performers</h3>
                        {stats?.staffPerformance?.map((staff: any, i: number) => (
                            <div key={i} className="flex items-center justify-between mb-4 last:mb-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-bold">{staff.name}</span>
                                </div>
                                <span className="text-xs font-black text-white/50">{staff.count} Leads</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
