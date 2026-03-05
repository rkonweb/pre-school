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
            style={style}
            className={cn(
                "relative group transition-opacity",
                isDragging ? "opacity-30 z-50" : "opacity-100 z-auto"
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400"
            >
                <GripVertical className="h-4 w-4" />
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
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg,#F0EFF8 0%,#FAFAFA 60%,#FFF8F0 100%)" }}>
            {/* Ambient Background Graphics */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: "rgba(245,158,11,0.07)", filter: "blur(120px)" }} />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full" style={{ background: "rgba(139,92,246,0.06)", filter: "blur(110px)" }} />
                {/* Subtle dot grid */}
                <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="erp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1.2" fill="#1E1B4B" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#erp-grid)" />
                </svg>
            </div>

            <div className="w-full p-6 md:p-12 space-y-12 relative z-10">


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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div style={{ animation: "fadeUp 0.45s ease 0.1s both" }}>
                        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "#1E1B4B", letterSpacing: -1, marginBottom: 6, lineHeight: 1.15 }}>
                            {staffId ? "Personnel Console" : (
                                <>
                                    School{" "}
                                    <span style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                        Intelligence
                                    </span>
                                </>
                            )}
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", animation: "erp-pulse 2s ease-in-out infinite" }} />
                            Live · {slug}{staffId && " · Staff View"}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <DailyReportGenerator slug={slug} />
                        <button
                            onClick={() => setIsConfiguring(!isConfiguring)}
                            title={isConfiguring ? "Lock Dashboard Layout" : "Customize Dashboard Layout"}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 16px",
                                borderRadius: 12,
                                fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                                border: isConfiguring ? "none" : "1.5px solid #E5E7EB",
                                background: isConfiguring
                                    ? "linear-gradient(135deg,#F59E0B,#D97706)"
                                    : "white",
                                color: isConfiguring ? "white" : "#4B5563",
                                boxShadow: isConfiguring ? "0 4px 16px rgba(245,158,11,0.35)" : "0 2px 8px rgba(0,0,0,0.06)",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                        >
                            {isConfiguring ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                            {isConfiguring ? "Lock Layout" : "Customise"}
                        </button>
                    </div>
                </div>

                {/* Config Overlay / Modal */}
                <AnimatePresence>
                    {isConfiguring && (
                        <div style={{
                            background: "white",
                            border: "1.5px solid #F3F4F6",
                            borderRadius: 24,
                            padding: 24,
                            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                            animation: "fadeUp 0.3s ease both",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <LayoutGrid style={{ width: 15, height: 15, color: "#D97706" }} />
                                    </div>
                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E1B4B" }}>Widget Configuration</span>
                                </div>
                                <button onClick={() => setIsConfiguring(false)} title="Close Configuration"
                                    style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#9CA3AF" }}>
                                    <X style={{ width: 16, height: 16 }} />
                                </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                                {widgets.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => toggleWidget(w.id)}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: 12,
                                            fontSize: 12.5, fontWeight: 600,
                                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                                            cursor: "pointer",
                                            border: w.enabled ? "1.5px solid #F59E0B" : "1.5px solid #E5E7EB",
                                            background: w.enabled ? "#FFFBEB" : "#F9FAFB",
                                            color: w.enabled ? "#D97706" : "#6B7280",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {w.title}
                                        <div style={{
                                            width: 16, height: 16, borderRadius: "50%",
                                            border: `2px solid ${w.enabled ? "#F59E0B" : "#D1D5DB"}`,
                                            background: w.enabled ? "#F59E0B" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            {w.enabled && <Check style={{ width: 9, height: 9, color: "white" }} />}
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
                        <div style={{ display: "grid", gap: 24 }}>
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents.toString()}
                        subValue="Live enrollment data"
                        icon={GraduationCap}
                        color="brand"
                    />
                    <StatCard
                        title="Attendance Today"
                        value={stats.attendanceToday}
                        subValue="Updated just now"
                        icon={Activity}
                        color="brand"
                    />
                    <StatCard
                        title="Revenue Today"
                        value={stats.revenue}
                        subValue="Payment collections"
                        icon={CreditCard}
                        color="purple"
                    />
                    <StatCard
                        title="Staff Active"
                        value={stats.activeStaff.toString()}
                        subValue="Currently on duty"
                        icon={Users}
                        color="orange"
                    />
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
                <div className="grid md:grid-cols-2 gap-8">
                    <div style={{ borderRadius: 24, border: "1px solid #F3F4F6", background: "white", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3 italic">
                                <Bus className="h-5 w-5 text-emerald-600" />
                                Transport Status
                            </h3>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                Global Pulse
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-50 border border-zinc-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Fleet</p>
                                    <p className="text-2xl font-black text-zinc-900">{stats.routesCount || 0} Routes</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-rose-50 border border-rose-100 group transition-all cursor-pointer hover:shadow-xl hover:shadow-rose-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Service Delay</p>
                                    <p className="text-2xl font-black text-rose-600">{stats.delayedRoutes || 0} Vehicle(s)</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 italic">
                                    <Clock className="h-5 w-5 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hover-lift" style={{ borderRadius: 24, border: "1px solid #F3F4F6", background: "white", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden", position: "relative" }}>
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/5 blur-[80px]" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 italic">Live Telemetry</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Real-time GPS clusters</p>
                                </div>
                                <button title="View Detailed Transport Ops" className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-brand hover:bg-brand/10 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {data?.delayedVehicles?.length > 0 ? (
                                    data.delayedVehicles.map((v: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span className="text-xs font-black text-zinc-600 tracking-wider font-mono">{v.TransportVehicle.registrationNumber}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase italic">Delayed • {v.delayMinutes}m</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-400 text-xs font-bold uppercase tracking-widest italic">
                                        All vehicles on schedule
                                    </div>
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
                            <button className="px-5 py-2 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand/20 active:scale-95">Detailed Exams</button>
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
                <div style={{ borderRadius: 24, border: "1px solid #F3F4F6", background: "white", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-brand" />
                            </div>
                            <h3 className="text-xl font-black">Audit Stream</h3>
                        </div>
                        <button title="View Live Audit Stream" className="text-xs font-black text-brand hover:underline px-4 py-2 bg-brand/10 rounded-xl transition-all">
                            Live Logs
                        </button>
                    </div>
                    <div className="mt-8 space-y-8">
                        {(data?.recentActivity || []).map((activity: any) => (
                            <div key={activity.id} className="flex items-start gap-6 relative group">
                                <div className="mt-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-brand/10 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-md font-bold text-zinc-900 dark:text-zinc-50">{activity.name}</p>
                                    <p className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-wider">{activity.type} • {activity.time}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-5 w-5 text-zinc-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "upcoming-events":
            return (
                <div style={{ borderRadius: 24, border: "1px solid #F3F4F6", background: "white", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <h3 className="text-xl font-black">Calendar Sync</h3>
                        <button className="text-xs font-black text-brand">Add Event +</button>
                    </div>
                    <div className="mt-8 grid sm:grid-cols-3 gap-6">
                        {data?.upcomingEvents?.length > 0 ? (
                            data.upcomingEvents.map((event: any, i: number) => (
                                <div key={i} className={cn("p-6 rounded-3xl border transition-all hover:scale-[1.02] cursor-pointer", event.color)}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-2">{event.date.split(' ')[0]}</span>
                                    <span className="text-3xl font-black block mb-4">{event.date.split(' ')[1]}</span>
                                    <p className="font-bold text-sm leading-tight">{event.title}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 text-zinc-400 text-xs font-bold uppercase tracking-widest italic">
                                No upcoming events scheduled
                            </div>
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
