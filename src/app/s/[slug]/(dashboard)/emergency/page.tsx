"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
    ShieldAlert, Plus, AlertTriangle, CheckCircle, Clock,
    Trash2, BellOff, Bell, Zap, ChevronDown, ChevronUp,
    Users, Radio, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    getAdminEmergencyAlertsAction,
    createAdminEmergencyAlertAction,
    deactivateEmergencyAlertAction,
    deleteEmergencyAlertAction,
} from "@/app/actions/parent-phase2-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { SectionHeader } from "@/components/ui/erp-ui";

const ALERT_TYPES = [
    { value: "CLOSURE", label: "School Closure", icon: "🏫", color: "red" },
    { value: "WEATHER", label: "Weather Warning", icon: "⛈️", color: "blue" },
    { value: "BUS_BREAKDOWN", label: "Bus Breakdown", icon: "🚌", color: "orange" },
    { value: "SAFETY", label: "Safety Alert", icon: "🔒", color: "purple" },
    { value: "HEALTH", label: "Health Notice", icon: "🏥", color: "green" },
    { value: "GENERAL", label: "General Emergency", icon: "🚨", color: "red" },
];

const PRIORITY_LEVELS = [
    {
        value: "LOW", label: "Low", description: "Informational only",
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400",
        dot: "bg-blue-500", ring: "ring-blue-500"
    },
    {
        value: "MEDIUM", label: "Medium", description: "Requires attention",
        color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400",
        dot: "bg-amber-500", ring: "ring-amber-500"
    },
    {
        value: "HIGH", label: "High", description: "Urgent action needed",
        color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400",
        dot: "bg-orange-500", ring: "ring-orange-500"
    },
    {
        value: "CRITICAL", label: "Critical", description: "Immediate response required",
        color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400",
        dot: "bg-red-500 animate-pulse", ring: "ring-red-500"
    },
];

function getPriorityMeta(priority: string) {
    return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[2];
}

function getAlertTypeMeta(type: string) {
    return ALERT_TYPES.find(t => t.value === type) || ALERT_TYPES[5];
}

export default function EmergencyAlertsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [alerts, setAlerts] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterPriority, setFilterPriority] = useState<string>("ALL");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const [form, setForm] = useState({
        title: "",
        message: "",
        type: "GENERAL",
        priority: "HIGH",
        classIds: ["all"] as string[],
        expiresAt: "",
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [alertsRes, classesRes] = await Promise.all([
                getAdminEmergencyAlertsAction(slug),
                getClassroomsAction(slug),
            ]);
            if (alertsRes.success) setAlerts(alertsRes.data || []);
            if (classesRes.success) setClassrooms(classesRes.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleClassToggle = (classId: string) => {
        setForm(prev => {
            if (classId === "all") return { ...prev, classIds: ["all"] };
            let newIds = prev.classIds.filter(id => id !== "all");
            if (newIds.includes(classId)) {
                newIds = newIds.filter(id => id !== classId);
            } else {
                newIds.push(classId);
            }
            if (newIds.length === 0) newIds = ["all"];
            return { ...prev, classIds: newIds };
        });
    };

    async function handleSend() {
        if (!form.title || !form.message) {
            toast.error("Title and message are required");
            return;
        }
        setIsSending(true);
        try {
            const res = await createAdminEmergencyAlertAction(slug, {
                title: form.title,
                message: form.message,
                type: form.type,
                priority: form.priority,
                targetClassIds: form.classIds,
                expiresAt: form.expiresAt || undefined,
            });

            if (res.success) {
                toast.success("🚨 Emergency alert broadcast to all parents!");
                setShowForm(false);
                setForm({ title: "", message: "", type: "GENERAL", priority: "HIGH", classIds: ["all"], expiresAt: "" });
                loadData();
            } else {
                toast.error(res.error || "Failed to send alert");
            }
        } catch {
            toast.error("Unexpected error");
        } finally {
            setIsSending(false);
        }
    }

    async function handleDeactivate(alertId: string) {
        setDeactivatingId(alertId);
        try {
            const res = await deactivateEmergencyAlertAction(alertId, slug);
            if (res.success) {
                toast.success("Alert deactivated");
                setAlerts(p => p.map(a => a.id === alertId ? { ...a, isActive: false } : a));
            } else {
                toast.error(res.error || "Failed to deactivate");
            }
        } catch { toast.error("Failed to deactivate"); }
        finally { setDeactivatingId(null); }
    }

    async function handleDelete(alertId: string) {
        setConfirmDeleteId(alertId);
    }

    async function confirmDelete() {
        if (!confirmDeleteId) return;
        const alertId = confirmDeleteId;
        setConfirmDeleteId(null);
        setDeletingId(alertId);
        try {
            const res = await deleteEmergencyAlertAction(alertId, slug);
            if (res.success) {
                toast.success("Alert deleted");
                setAlerts(p => p.filter(a => a.id !== alertId));
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch { toast.error("Failed to delete"); }
        finally { setDeletingId(null); }
    }

    const filteredAlerts = alerts.filter(a => {
        if (filterPriority !== "ALL" && a.priority !== filterPriority) return false;
        if (filterStatus === "ACTIVE" && !a.isActive) return false;
        if (filterStatus === "INACTIVE" && a.isActive) return false;
        return true;
    });

    const activeAlerts = alerts.filter(a => a.isActive);
    const criticalAlerts = activeAlerts.filter(a => a.priority === "CRITICAL");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Emergency Alerts"
                subtitle="Broadcast urgent alerts to parents instantly — class-wise or school-wide."
                icon={ShieldAlert}
                action={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F3F4F6", borderRadius: 12, padding: "8px 14px" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: activeAlerts.length > 0 ? "#EF4444" : "#22C55E", animation: activeAlerts.length > 0 ? "pulse 1s infinite" : "none" }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>
                                {activeAlerts.length > 0 ? `${activeAlerts.length} Live` : "All Clear"}
                            </span>
                        </div>
                        <button onClick={() => setShowForm(!showForm)}
                            style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 12, background: "linear-gradient(135deg,#DC2626,#E11D48)", color: "white", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, boxShadow: "0 4px 16px rgba(220,38,38,0.3)" }}>
                            <Plus style={{ width: 16, height: 16 }} /> New Alert
                        </button>
                    </div>
                }
            />

            {/* Critical Alert Banner */}
            {criticalAlerts.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 rounded-[2rem] p-6 text-white shadow-2xl shadow-red-500/20">
                    <div className="absolute inset-0 bg-red-900/20 animate-pulse rounded-[2rem]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-3 w-3 rounded-full bg-white animate-ping" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-90">
                                ⚡ {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? "s" : ""} Active
                            </span>
                        </div>
                        {criticalAlerts.map(a => (
                            <div key={a.id} className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-black text-xl">{a.title}</h3>
                                    <p className="text-white/80 text-sm mt-1">{a.message}</p>
                                    <p className="text-white/60 text-xs mt-2">Sent: {new Date(a.sentAt).toLocaleString("en-IN")}</p>
                                </div>
                                <button
                                    onClick={() => handleDeactivate(a.id)}
                                    disabled={deactivatingId === a.id}
                                    className="shrink-0 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all"
                                >
                                    {deactivatingId === a.id ? "..." : "Deactivate"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Non-critical active alerts */}
            {activeAlerts.filter(a => a.priority !== "CRITICAL").length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Radio className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                            Active Alerts
                        </span>
                    </div>
                    {activeAlerts.filter(a => a.priority !== "CRITICAL").map(a => {
                        const pm = getPriorityMeta(a.priority);
                        const tm = getAlertTypeMeta(a.type);
                        return (
                            <div key={a.id} className="flex items-start justify-between gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-0.5">{tm.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border", pm.color)}>{pm.label}</span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase">{tm.label}</span>
                                        </div>
                                        <h3 className="font-black text-zinc-900 dark:text-zinc-50">{a.title}</h3>
                                        <p className="text-sm text-zinc-500 mt-0.5">{a.message}</p>
                                        <p className="text-xs text-zinc-400 mt-1">{new Date(a.sentAt).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeactivate(a.id)}
                                    disabled={deactivatingId === a.id}
                                    className="shrink-0 text-amber-600 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-all"
                                >
                                    {deactivatingId === a.id ? "..." : "Deactivate"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Alert Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-red-200/50 dark:border-red-900/30 shadow-2xl p-8 animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            Compose <span className="text-red-500">Alert</span>
                        </h2>
                        <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <X className="h-5 w-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Alert Type */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Alert Type *</label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {ALERT_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setForm(f => ({ ...f, type: t.value }))}
                                    className={cn(
                                        "p-3 rounded-2xl border-2 text-xs font-black text-left transition-all",
                                        form.type === t.value
                                            ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600"
                                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                                    )}
                                >
                                    <span className="block text-xl mb-1">{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Priority Level *</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {PRIORITY_LEVELS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 text-left transition-all",
                                        form.priority === p.value
                                            ? `ring-2 ${p.ring} ${p.color} border-transparent`
                                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", p.dot)} />
                                        <span className="text-xs font-black uppercase tracking-widest">{p.label}</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium">{p.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Classes */}
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" /> Target Classes *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleClassToggle("all")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    form.classIds.includes("all")
                                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:border-red-500/30"
                                        : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-red-300"
                                )}
                            >
                                All Classes
                            </button>
                            {classrooms.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => handleClassToggle(cls.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                        form.classIds.includes(cls.id)
                                            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:border-red-500/30"
                                            : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-red-300"
                                    )}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title & Message */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Alert Title *</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="E.g., School Closed Today"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Expires At (optional)</label>
                            <input
                                type="datetime-local"
                                title="Alert Expiry"
                                value={form.expiresAt}
                                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Message Body *</label>
                        <textarea
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            placeholder="Dear Parents, due to..."
                            rows={4}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all resize-none"
                        />
                    </div>

                    {/* Warning */}
                    <div className={cn("rounded-2xl p-4 mb-6 border", form.priority === "CRITICAL"
                        ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                        : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                    )}>
                        <p className={cn("text-xs font-bold", form.priority === "CRITICAL" ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400")}>
                            ⚠️ This will immediately send a <strong>{form.priority}</strong> push notification to{" "}
                            {form.classIds.includes("all")
                                ? "ALL parents in the school"
                                : `parents of ${form.classIds.length} selected class(es)`}.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-red-500/20"
                        >
                            <Zap className="h-4 w-4" />
                            {isSending ? "Broadcasting..." : "⚡ Broadcast Alert"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 py-4 rounded-2xl font-black uppercase text-xs transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Filter:</span>
                <div className="flex gap-2">
                    {["ALL", "ACTIVE", "INACTIVE"].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                filterStatus === s
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent hover:border-zinc-300"
                            )}
                        >
                            {s === "ALL" ? "All" : s === "ACTIVE" ? "🔴 Active" : "✅ Closed"}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {["ALL", ...PRIORITY_LEVELS.map(p => p.value)].map(p => (
                        <button
                            key={p}
                            onClick={() => setFilterPriority(p)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                filterPriority === p
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent hover:border-zinc-300"
                            )}
                        >
                            {p === "ALL" ? "All Priority" : p}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-xs text-zinc-400 font-semibold">{filteredAlerts.length} alerts</span>
            </div>

            {/* Alert History */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alert History</h3>
                {isLoading ? (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                            ✅
                        </div>
                        <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100">All Clear</h3>
                        <p className="text-zinc-500 font-medium mt-2 max-w-sm">No emergency alerts match your current filters.</p>
                    </div>
                ) : (
                    filteredAlerts.map(a => {
                        const pm = getPriorityMeta(a.priority);
                        const tm = getAlertTypeMeta(a.type);
                        const isExpanded = expandedId === a.id;

                        return (
                            <div
                                key={a.id}
                                className={cn(
                                    "bg-white dark:bg-zinc-900/80 backdrop-blur-md rounded-[2rem] border shadow-sm transition-all",
                                    a.isActive
                                        ? "border-zinc-200/50 dark:border-zinc-700/50"
                                        : "border-zinc-100 dark:border-zinc-800 opacity-60"
                                )}
                            >
                                <div className="p-5 flex items-center gap-4">
                                    <div className="shrink-0 text-2xl">{tm.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border", pm.color)}>
                                                <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", pm.dot)} />{pm.label}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                                                {tm.label}
                                            </span>
                                            {a.isActive
                                                ? <span className="text-[9px] font-black text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-lg uppercase">🔴 Live</span>
                                                : <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg uppercase flex items-center gap-1">
                                                    <CheckCircle className="h-2.5 w-2.5" /> Closed
                                                </span>
                                            }
                                        </div>
                                        <p className="font-black text-zinc-900 dark:text-zinc-50 truncate">{a.title}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            {new Date(a.sentAt).toLocaleString("en-IN")}
                                            {a.expiresAt && ` · Expires ${new Date(a.expiresAt).toLocaleString("en-IN")}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : a.id)}
                                            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
                                            title="View message"
                                        >
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        {a.isActive && (
                                            <button
                                                onClick={() => handleDeactivate(a.id)}
                                                disabled={deactivatingId === a.id}
                                                className="p-2 rounded-xl text-amber-600 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                                                title="Deactivate alert"
                                            >
                                                {deactivatingId === a.id ? <div className="h-4 w-4 animate-spin border-2 border-amber-500 border-t-transparent rounded-full" /> : <BellOff className="h-4 w-4" />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            disabled={deletingId === a.id}
                                            className="p-2 rounded-xl text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                            title="Delete alert"
                                        >
                                            {deletingId === a.id ? <div className="h-4 w-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full" /> : <Trash2 className="h-4 w-4" />}
                                        </button>

                                    </div>
                                </div>

                                {/* Expanded Message */}
                                {isExpanded && (
                                    <div className="px-5 pb-5">
                                        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{a.message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setConfirmDeleteId(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-red-200/50 dark:border-red-900/30 p-8 w-full max-w-sm animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full mx-auto mb-5">
                            <Trash2 className="h-7 w-7 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-center text-zinc-900 dark:text-zinc-50 mb-2">Delete Alert?</h3>
                        <p className="text-sm text-zinc-500 text-center mb-6">
                            This alert will be <strong className="text-red-500">permanently deleted</strong> and cannot be recovered.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-black uppercase tracking-widest text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={!!deletingId}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deletingId ? <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <Trash2 className="h-4 w-4" />}
                                {deletingId ? "Deleting..." : "Delete Forever"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
