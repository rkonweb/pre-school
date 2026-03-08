"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Users,
    GraduationCap,
    CreditCard,
    Activity,
    ArrowUpRight,
    GripVertical,
    Settings2,
    X,
    LayoutGrid,
    Check,
    Bus,
    Clock,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    Search
} from "lucide-react";

import { AssistantBriefing } from "./AssistantBriefing";
import { ModuleHealthGrid } from "./ModuleHealthGrid";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { DailyReportGenerator } from "@/components/dashboard/DailyReportGenerator";
import {
    getDashboardStatsAction,
    getAnalyticsDataAction
} from "@/app/actions/dashboard-actions";
import { Loader2 } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import {
    EnrollmentTrend,
    RevenueFlow,
    AcademicHeatmap,
    AttendancePulse
} from "./AnalyticsCharts";


// --- Types ---
interface DashboardWidget {
    id: string;
    title: string;
    type: "stats" | "list" | "chart" | "events";
    enabled: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
    { id: "stats-grid", title: "Summary Stats", type: "stats", enabled: true },
    { id: "module-health", title: "Module Health", type: "chart", enabled: true },
    { id: "enrollment-trend", title: "Enrollment Growth", type: "chart", enabled: true },
    { id: "revenue-flow", title: "Revenue Flow", type: "chart", enabled: true },
    { id: "academic-heatmap", title: "Academic Performance", type: "chart", enabled: true },
    { id: "attendance-pulse", title: "Attendance Consistency", type: "chart", enabled: true },
    { id: "transport-ops", title: "Transport Ops", type: "events", enabled: true },
    { id: "recent-activity", title: "Recent Activity", type: "list", enabled: true },
    { id: "upcoming-events", title: "Upcoming Events", type: "events", enabled: true },
];

// --- Sortable Item Component ---
function SortableWidget({
    widget,
    children,
}: {
    widget: DashboardWidget;
    children: React.ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: widget.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!widget.enabled) return null;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "erp-widget-card relative transition-all",
                isDragging ? "opacity-30 z-50" : "opacity-100 z-auto"
            )}
            style={{ transform: CSS.Transform.toString(transform) }}
        >
            <style>{`.erp-widget-card .erp-drag-handle{opacity:0;transition:opacity 0.2s}.erp-widget-card:hover .erp-drag-handle{opacity:1}`}</style>
            <div
                className="erp-drag-handle absolute top-3.5 right-3.5 z-10 flex items-center justify-center p-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-grab opacity-0 transition-opacity duration-200"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-[15px] h-[15px]" />
            </div>
            {children}
        </div>
    );
}

export function DashboardClient() {
    const params = useParams();
    const slug = params.slug as string;
    const staffId = params.id as string | undefined; // Capture staff ID from URL if present

    const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [statsData, setStatsData] = useState<any>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        // Load settings from localStorage
        const configKey = staffId ? `dashboard_config_${slug}_${staffId}` : `dashboard_config_${slug}`;
        const saved = localStorage.getItem(configKey);
        if (saved) {
            try {
                setWidgets(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse dashboard config", e);
            }
        }

        async function loadData() {
            // Pass staffId and academicYearId to stats action
            const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
            const res = await getDashboardStatsAction(slug, staffId, academicYearId);
            if (res.success) {
                setStatsData(res);
            }

            // Analytics data only for school-wide view
            if (!staffId) {
                const analyticsRes = await getAnalyticsDataAction(slug);
                if (analyticsRes.success) {
                    setAnalyticsData(analyticsRes);
                }
            }

            setIsLoading(false);
        }
        loadData();
    }, [slug, staffId]);

    const saveConfig = (newWidgets: DashboardWidget[]) => {
        setWidgets(newWidgets);
        const configKey = staffId ? `dashboard_config_${slug}_${staffId}` : `dashboard_config_${slug}`;
        localStorage.setItem(configKey, JSON.stringify(newWidgets));
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = widgets.findIndex((w) => w.id === active.id);
            const newIndex = widgets.findIndex((w) => w.id === over.id);
            const newOrder = arrayMove(widgets, oldIndex, newIndex);
            saveConfig(newOrder);
        }
    };

    const toggleWidget = (id: string) => {
        const newWidgets = widgets.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        );
        saveConfig(newWidgets);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div 
                    className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_6px_20px_rgba(var(--brand-color-rgb,245,158,11),0.35)] bg-brand-gradient"
                >
                    <LayoutGrid className="h-5 w-5 text-white" />
                </div>
                <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-100 border-t-brand" style={{ borderTopColor: 'var(--brand-color)' }} />
                <span className="font-sans text-[13px] font-semibold text-gray-400">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F0EFF8] via-[#FAFAFA] to-[#FFF8F0] pb-[40px]">
            {/* Ambient Background Graphics */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[110px]" />
                {/* Subtle dot grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="erp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1.2" fill="#1E1B4B" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#erp-grid)" />
                </svg>
            </div>

            <div className="relative z-10 flex w-full flex-col gap-7 px-10 py-8">


                {!staffId && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <AssistantBriefing
                            stats={statsData?.stats}
                            slug={slug}
                        />
                    </motion.div>
                )}

                {/* Header Area */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="animate-[fadeUp_0.45s_ease_0.1s_both]">
                        <h1 className="mb-1.5 font-sora text-[30px] font-extrabold leading-[1.15] tracking-tight text-[#1E1B4B]">
                            {staffId ? "Personnel Console" : (
                                <>
                                    School{" "}
                                    <span className="bg-brand-gradient bg-clip-text text-transparent">
                                        Intelligence
                                    </span>
                                </>
                            )}
                        </h1>
                        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            Live · {slug}{staffId && " · Staff View"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <DailyReportGenerator slug={slug} />
                        <button
                            onClick={() => setIsConfiguring(!isConfiguring)}
                            title={isConfiguring ? "Lock Dashboard Layout" : "Customize Dashboard Layout"}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold tracking-[0.06em] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                isConfiguring
                                    ? "bg-brand-gradient text-[var(--secondary-color)] shadow-[0_4px_16px_rgba(var(--brand-color-rgb,245,158,11),0.35)]"
                                    : "border-[1.5px] border-gray-200 bg-white text-gray-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-gray-300"
                            )}
                        >
                            {isConfiguring ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                            {isConfiguring ? "Lock Layout" : "Customise"}
                        </button>
                    </div>
                </div>

                {/* Config Overlay / Modal */}
                <AnimatePresence>
                    {isConfiguring && (
                        <div className="animate-[fadeUp_0.3s_ease_both] rounded-[24px] border-[1.5px] border-gray-100 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-amber-50">
                                        <LayoutGrid className="h-[15px] w-[15px] text-amber-600" />
                                    </div>
                                    <span className="font-sora text-[15px] font-extrabold text-[#1E1B4B]">Widget Configuration</span>
                                </div>
                                <button
                                    onClick={() => setIsConfiguring(false)}
                                    title="Close Configuration"
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 focus:outline-none"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
                                {widgets.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => toggleWidget(w.id)}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between gap-2 rounded-xl border-[1.5px] px-[14px] py-[10px] text-[12.5px] font-semibold transition-all duration-200",
                                            w.enabled
                                                ? "border-amber-500 bg-amber-50 text-amber-600"
                                                : "border-gray-200 bg-gray-50 text-gray-500"
                                        )}
                                    >
                                        {w.title}
                                        <div
                                            className={cn(
                                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                                                w.enabled ? "border-brand bg-brand" : "border-gray-300 bg-transparent"
                                            )}
                                        >
                                            {w.enabled && <Check className="h-[9px] w-[9px] text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Draggable Dashboard Content */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={widgets.map(w => w.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid gap-6">
                            {widgets.map((widget, i) => (
                                <SortableWidget key={widget.id} widget={widget}>
                                    <div style={{ animation: `fadeUp 0.5s ease ${i * 0.07}s both` }}>
                                        {renderWidgetContent(widget.id, statsData, analyticsData)}
                                    </div>
                                </SortableWidget>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

// --- Widget Component Mapping ---
function renderWidgetContent(id: string, data: any, analytics: any) {
    const stats = data?.stats || {
        totalStudents: 0,
        activeStaff: 0,
        attendanceToday: "0%",
        revenue: "0",
        routesCount: 0,
        delayedRoutes: 0,
        collectionPercent: 0,
        totalFees: 0,
        totalCollected: 0
    };

    switch (id) {
        case "stats-grid":
            return (
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { title: "Total Students", value: stats.totalStudents.toString(), sub: "Live enrollment", icon: GraduationCap, color: "#3B82F6", bg: "bg-blue-100" },
                        { title: "Attendance Today", value: stats.attendanceToday, sub: "Updated just now", icon: Activity, color: "#10B981", bg: "bg-emerald-100" },
                        { title: "Revenue Today", value: stats.revenue, sub: "Payment collections", icon: CreditCard, color: "#8B5CF6", bg: "bg-violet-100" },
                        { title: "Staff Active", value: stats.activeStaff.toString(), sub: "Currently on duty", icon: Users, color: "#F97316", bg: "bg-orange-100" },
                    ].map((s, i) => (
                        <div
                            key={i}
                            className="rounded-[20px] border border-gray-100 bg-white p-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
                            style={{ animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}
                        >
                            <div className="mb-3.5 flex items-center justify-between">
                                <div className={cn("flex h-[42px] w-[42px] items-center justify-center rounded-xl", s.bg)}>
                                    <s.icon size={18} color={s.color} strokeWidth={2.2} />
                                </div>
                                <span className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-gray-400">{s.sub}</span>
                            </div>
                            <div className="mb-1 font-sora text-[26px] font-extrabold text-[#1E1B4B]">{s.value}</div>
                            <div className="text-[13px] font-semibold text-gray-600">{s.title}</div>
                        </div>
                    ))}
                </div>
            );

        case "module-health":
            return <ModuleHealthGrid stats={stats} />;

        case "enrollment-trend":
            return <EnrollmentTrend
                data={analytics?.enrollmentTrend || []}
                title="Enrollment Pulse"
                description="Student population growth (6m)"
            />;

        case "revenue-flow":
            return <RevenueFlow
                data={analytics?.revenueTrend || []}
                title="Financial Intake"
                description="Monthly revenue streams (6m)"
            />;

        case "academic-heatmap":
            return <AcademicHeatmap
                data={analytics?.academicHeatmap || []}
                title="Academic Achievement"
                description="Avg performance cluster per class"
            />;

        case "attendance-pulse":
            return <AttendancePulse
                data={analytics?.attendancePulse || []}
                title="Attendance Consistency"
                description="Weekly engagement metrics (4w)"
            />;

        case "transport-ops":
            return (
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[20px] border border-gray-100 bg-white p-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100">
                                    <Bus className="h-[17px] w-[17px] text-emerald-500" />
                                </div>
                                <span className="font-sora text-[15px] font-extrabold text-[#1E1B4B]">Transport Status</span>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-[3px] text-[10.5px] font-bold text-emerald-600">Live</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-5 py-[18px]">
                                <div>
                                    <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-gray-400">Active Fleet</div>
                                    <div className="font-sora text-[22px] font-extrabold text-[#1E1B4B]">{stats.routesCount || 0} Routes</div>
                                </div>
                                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-gray-100 bg-white">
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-brand-gradient" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-[18px]">
                                <div>
                                    <div className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-red-400">Service Delay</div>
                                    <div className="font-sora text-[22px] font-extrabold text-red-500">{stats.delayedRoutes || 0} Vehicle(s)</div>
                                </div>
                                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-red-200 bg-white">
                                    <Clock className="h-[17px] w-[17px] text-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-[20px] border border-gray-100 bg-white p-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                        <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full bg-amber-500/5 blur-[60px]" />
                        <div className="relative z-[1]">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <div className="font-sora text-[15px] font-extrabold text-[#1E1B4B]">Live Telemetry</div>
                                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-gray-400">Real-time GPS clusters</div>
                                </div>
                                <button title="View Details" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-100 bg-gray-50 text-gray-400">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {data?.delayedVehicles?.length > 0 ? (
                                    data.delayedVehicles.map((v: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-2 w-2 rounded-full bg-brand-gradient" />
                                                <span className="font-mono text-[12.5px] font-bold text-gray-700">{v.TransportVehicle.registrationNumber}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-400">Delayed · {v.delayMinutes}m</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-7 text-center text-[12.5px] font-bold text-gray-400">All vehicles on schedule ✓</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case "academic-performance":
            return (
                <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-black">Academic Achievement Cluster</h3>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-5 py-2 rounded-xl bg-brand text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand/20 active:scale-95">Detailed Exams</button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-6">
                        {(data?.academicPerformance?.length > 0 ? data.academicPerformance : [
                            { title: "No Exams Recorded", avg: "0%", trend: "stable" }
                        ]).map((perf: any, i: number) => (
                            <div key={i} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 group hover:bg-white hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{perf.title}</span>
                                    {perf.trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <Activity className="h-4 w-4 text-amber-500" />}
                                </div>
                                <p className="text-4xl font-black text-zinc-900 group-hover:text-violet-600 transition-colors uppercase tracking-tighter">{perf.avg}</p>
                                <p className="text-[10px] text-zinc-500 font-bold mt-2 font-mono italic">Avg Cohort Performance</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "recent-activity":
            return (
                <div className="rounded-[20px] border border-gray-100 bg-white p-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                    <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-[18px]">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50">
                                <Activity className="h-[17px] w-[17px] text-amber-600" />
                            </div>
                            <span className="font-sora text-[15px] font-extrabold text-[#1E1B4B]">Audit Stream</span>
                        </div>
                        <button className="cursor-pointer rounded-lg border border-amber-100 bg-amber-50 px-3.5 py-1.5 text-[12px] font-bold text-amber-600">Live Logs</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        {(data?.recentActivity || []).map((activity: any) => (
                            <div key={activity.id} className="flex items-start gap-3.5">
                                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-gradient shadow-[0_0_0_4px_rgba(var(--brand-color-rgb),0.12)]" />
                                <div className="flex-1">
                                    <div className="text-[13.5px] font-bold text-gray-800">{activity.name}</div>
                                    <div className="mt-1 text-[11.5px] uppercase tracking-[0.6px] text-gray-400">{activity.type} · {activity.time}</div>
                                </div>
                                <ArrowUpRight className="h-[15px] w-[15px] text-gray-300" />
                            </div>
                        ))}
                        {(!data?.recentActivity || data.recentActivity.length === 0) && (
                            <div className="py-6 text-center text-[13px] font-semibold text-gray-400">No recent activity</div>
                        )}
                    </div>
                </div>
            );

        case "upcoming-events":
            return (
                <div className="rounded-[20px] border border-gray-100 bg-white p-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                    <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-[18px]">
                        <span className="font-sora text-[15px] font-extrabold text-[#1E1B4B]">Upcoming Events</span>
                        <button className="cursor-pointer border-none bg-transparent text-[12.5px] font-bold text-amber-600">Add Event +</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {data?.upcomingEvents?.length > 0 ? (
                            data.upcomingEvents.map((event: any, i: number) => (
                                <div key={i} className="erp-event-card cursor-pointer rounded-2xl border-[1.5px] border-amber-100 bg-amber-50 px-5 py-[18px] transition-all duration-200">
                                    <style>{`.erp-event-card:hover{transform:scale(1.02)}`}</style>
                                    <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[1px] text-amber-600 opacity-70">{event.date.split(' ')[0]}</div>
                                    <div className="mb-2.5 font-sora text-[28px] font-extrabold text-[#1E1B4B]">{event.date.split(' ')[1]}</div>
                                    <div className="text-[13px] font-bold leading-[1.4] text-gray-700">{event.title}</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-8 text-center text-[13px] font-semibold text-gray-400">No upcoming events scheduled</div>
                        )}
                    </div>
                </div>
            );

        case "revenue-collection":
            return (
                <div style={{ borderRadius: 24, border: "1px solid #F3F4F6", background: "white", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <h3 className="text-xl font-black">Revenue Analytics</h3>
                        <div className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand/20">Yearly Performance</div>
                    </div>
                    <div className="mt-8 flex flex-col md:flex-row gap-12 items-center">
                        <div className="relative h-40 w-40 flex items-center justify-center">
                            <svg className="h-full w-full transform -rotate-90">
                                <circle
                                    cx="80" cy="80" r="70"
                                    className="stroke-zinc-100 fill-none"
                                    strokeWidth="15"
                                />
                                <circle
                                    cx="80" cy="80" r="70"
                                    className="stroke-brand fill-none transition-all duration-1000"
                                    strokeWidth="15"
                                    strokeDasharray="440"
                                    strokeDashoffset="66"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">{stats.collectionPercent}%</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Collected</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                            {[
                                { label: "Fees Received", amount: stats.totalCollected.toLocaleString(), progress: stats.collectionPercent, color: "bg-brand" },
                                { label: "Pending Dues", amount: (stats.totalFees - stats.totalCollected).toLocaleString(), progress: 100 - stats.collectionPercent, color: "bg-orange-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-zinc-500">{item.label}</span>
                                        <span className="text-zinc-900">{item.amount}</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
