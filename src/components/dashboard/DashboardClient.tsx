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
import { AuraAI } from "./AuraAI";
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
import { getDashboardStatsAction } from "@/app/actions/dashboard-actions";
import { Loader2 } from "lucide-react";

// --- Types ---
interface DashboardWidget {
    id: string;
    title: string;
    type: "stats" | "list" | "chart" | "events";
    enabled: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
    { id: "stats-grid", title: "Summary Stats", type: "stats", enabled: true },
    { id: "transport-ops", title: "Transport Ops", type: "events", enabled: true },
    { id: "academic-performance", title: "Academic Insights", type: "chart", enabled: true },
    { id: "recent-activity", title: "Recent Activity", type: "list", enabled: true },
    { id: "upcoming-events", title: "Upcoming Events", type: "events", enabled: true },
    { id: "revenue-collection", title: "Revenue Breakdown", type: "list", enabled: true },
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
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.3 : 1,
    };

    if (!widget.enabled) return null;

    return (
        <div ref={setNodeRef} style={style} className="relative group">
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
            // Pass staffId to stats action
            // Note: need to update server action to accept optional staffId
            const res = await getDashboardStatsAction(slug, staffId);
            if (res.success) {
                setStatsData(res);
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* AI Assistant - Aura */}
            <AuraAI insights={statsData?.aiInsights || []} />
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        {staffId ? "Staff Dashboard" : "Admin Intelligence"}
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">
                        Real-time operational overview for {slug} {staffId && "(Personalized)"}
                    </p>
                </div>

                <button
                    onClick={() => setIsConfiguring(!isConfiguring)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-zinc-200/50 active:scale-95",
                        isConfiguring
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white text-zinc-600 border border-zinc-200 hover:border-blue-600 hover:text-blue-600"
                    )}
                >
                    {isConfiguring ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                    {isConfiguring ? "Finish Customizing" : "Customize Dashboard"}
                </button>
            </div>

            {/* Config Overlay / Modal */}
            <AnimatePresence>
                {isConfiguring && (
                    <div
                        className="bg-white border border-zinc-200 text-zinc-900 p-6 rounded-[32px] shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-blue-500" />
                                Toggle Dashboard Widgets
                            </h2>
                            <button onClick={() => setIsConfiguring(false)} className="text-zinc-400 hover:text-zinc-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {widgets.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => toggleWidget(w.id)}
                                    className={cn(
                                        "px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-2 border-2",
                                        w.enabled
                                            ? "bg-blue-50 border-blue-500 text-blue-600"
                                            : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                                    )}
                                >
                                    {w.title}
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                        w.enabled ? "bg-blue-500 border-blue-500" : "border-zinc-700"
                                    )}>
                                        {w.enabled && <Check className="h-3 w-3 text-white" />}
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
                    <div className="grid gap-8">
                        {widgets.map((widget) => (
                            <SortableWidget key={widget.id} widget={widget}>
                                {renderWidgetContent(widget.id, statsData)}
                            </SortableWidget>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

// --- Widget Component Mapping ---
function renderWidgetContent(id: string, data: any) {
    const stats = data?.stats || {
        totalStudents: 0,
        activeStaff: 0,
        attendanceToday: "0%",
        revenue: "$0"
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

        case "transport-ops":
            return (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
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
                                    <p className="text-2xl font-black text-zinc-900">12 Routes</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-white border border-zinc-100 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 rounded-2xl bg-rose-50 border border-rose-100 group transition-all cursor-pointer hover:shadow-xl hover:shadow-rose-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Service Delay</p>
                                    <p className="text-2xl font-black text-rose-600">{stats.delayedRoutes || 1} Vehicle(s)</p>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 italic">
                                    <Clock className="h-5 w-5 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm overflow-hidden relative group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 italic">Live Telemetry</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Real-time GPS clusters</p>
                                </div>
                                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { route: "R-NW-12", status: "Moving", speed: "42 km/h", color: "bg-emerald-500" },
                                    { route: "R-ES-04", status: "Traffic", speed: "12 km/h", color: "bg-amber-500" }
                                ].map((r, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-2 w-2 rounded-full", r.color)} />
                                            <span className="text-xs font-black text-zinc-600 tracking-wider font-mono">{r.route}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase italic">{r.status} • {r.speed}</span>
                                    </div>
                                ))}
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
                            <button className="px-5 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Detailed Exams</button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-6">
                        {(data?.academicPerformance || [
                            { title: "Mid Term", avg: "82%", trend: "up" },
                            { title: "Unit Test-I", avg: "78%", trend: "stable" }
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
                <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black">Audit Stream</h3>
                        </div>
                        <button className="text-xs font-black text-blue-600 hover:underline px-4 py-2 bg-blue-50 rounded-xl transition-all">
                            Live Logs
                        </button>
                    </div>
                    <div className="mt-8 space-y-8">
                        {(data?.recentActivity || []).map((activity: any) => (
                            <div key={activity.id} className="flex items-start gap-6 relative group">
                                <div className="mt-1.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-50 flex-shrink-0" />
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
                <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <h3 className="text-xl font-black">Calendar Sync</h3>
                        <button className="text-xs font-black text-blue-600">Add Event +</button>
                    </div>
                    <div className="mt-8 grid sm:grid-cols-3 gap-6">
                        {[
                            { date: "Jan 26", title: "Faculty Workshop", color: "bg-orange-50 border-orange-100 text-orange-700" },
                            { date: "Jan 28", title: "Sports Day Prep", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                            { date: "Feb 02", title: "Winter Field Trip", color: "bg-blue-50 border-blue-100 text-blue-700" },
                        ].map((event, i) => (
                            <div key={i} className={cn("p-6 rounded-3xl border transition-all hover:scale-[1.02] cursor-pointer", event.color)}>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-2">{event.date.split(' ')[0]}</span>
                                <span className="text-3xl font-black block mb-4">{event.date.split(' ')[1]}</span>
                                <p className="font-bold text-sm leading-tight">{event.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "revenue-collection":
            return (
                <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                        <h3 className="text-xl font-black">Revenue Analytics</h3>
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">Yearly Performance</div>
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
                                    className="stroke-blue-600 fill-none transition-all duration-1000"
                                    strokeWidth="15"
                                    strokeDasharray="440"
                                    strokeDashoffset="66"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black">85%</span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Collected</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-6 w-full">
                            {[
                                { label: "Fees Received", amount: "$10,500", progress: 85, color: "bg-blue-600" },
                                { label: "Pending Dues", amount: "$1,950", progress: 15, color: "bg-orange-500" },
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
