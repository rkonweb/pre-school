"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Zap,
    Settings,
    Clock,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Loader2,
    ChevronLeft,
    Power,
    ArrowUpRight,
    Users,
    Hourglass,
    Check,
    Save,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getAutomationRulesAction,
    saveAutomationRuleAction,
    getAutomationSummaryAction,
    deleteQueuedAutomationAction,
    executeQueuedAutomationAction
} from "@/app/actions/automation-rule-actions";
import { updateAISettingsAction } from "@/app/actions/admission-actions";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function AutomationControlPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [rules, setRules] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [isEditingQuietHours, setIsEditingQuietHours] = useState(false);
    const [tempQuietHours, setTempQuietHours] = useState({ start: "20:00", end: "09:00" });

    useEffect(() => {
        loadData(true);
    }, [slug]);

    async function loadData(fullLoad = false) {
        if (fullLoad) setIsLoading(true);
        else setIsRefreshing(true);

        const res = await getAutomationSummaryAction(slug);
        const rulesRes = await getAutomationRulesAction(slug);

        if (res.success) {
            setStats(res.stats);
            setQueue(res.queue || []);
            setHistory(res.history || []);
            setSettings(res.settings);
            if (res.settings?.quietHours) setTempQuietHours(res.settings.quietHours);
        }
        if (rulesRes.success) {
            setRules(rulesRes.rules || []);
        }
        setIsLoading(false);
        setIsRefreshing(false);
    }

    const handleToggleGlobal = async () => {
        const currentState = settings?.globalAutomationEnabled ?? false;
        const nextState = !currentState;

        // Optimistic UI update
        const previousSettings = settings;
        setSettings((prev: any) => ({ ...(prev || {}), globalAutomationEnabled: nextState }));

        const res = await updateAISettingsAction(slug, { globalAutomationEnabled: nextState });
        if (res.success) {
            toast.success(`Automation ${nextState ? "Enabled" : "Paused"}`);
            loadData();
        } else {
            setSettings(previousSettings);
            toast.error(res.error || "Failed to toggle automation");
        }
    };

    const handleSaveRule = async (band: string, updates: any) => {
        setIsSaving(band);
        const currentRule = rules.find(r => r.scoreBand === band) || { scoreBand: band, frequency: 24, maxMessages: 7, allowedCats: '[]' };
        const data = { ...currentRule, ...updates };
        const res = await saveAutomationRuleAction(slug, data);
        if (res.success) {
            setRules(prev => prev.map(r => r.scoreBand === band ? res.rule : r));
            if (!rules.find(r => r.scoreBand === band)) setRules(prev => [...prev, res.rule]);
            toast.success(`${band} Policy Updated`);
            loadData();
        }
        setIsSaving(null);
    };

    const handleSaveQuietHours = async () => {
        setIsSaving("quietHours");
        const res = await updateAISettingsAction(slug, { quietHours: tempQuietHours });
        if (res.success) {
            setSettings({ ...settings, quietHours: tempQuietHours });
            setIsEditingQuietHours(false);
            toast.success("Quiet Hours Updated");
            loadData();
        } else {
            toast.error("Failed to update quiet hours");
        }
        setIsSaving(null);
    };

    const handleCancelQueue = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this queued message?")) return;
        setIsActionLoading(id);
        const res = await deleteQueuedAutomationAction(slug, id);
        if (res.success) {
            toast.success("Automation message cancelled");
            loadData();
        } else {
            toast.error(res.error || "Failed to cancel");
        }
        setIsActionLoading(null);
    };

    const handleExecuteQueue = async (id: string) => {
        setIsActionLoading(id);
        const res = await executeQueuedAutomationAction(slug, id);
        if (res.success) {
            toast.success("Automation message sent/executed");
            loadData();
        } else {
            toast.error(res.error || "Failed to execute");
        }
        setIsActionLoading(null);
    };

    const BANDS = [
        { id: "HOT", label: "HOT Leads", color: "bg-red-50 border-red-100 text-red-600", score: "80-100" },
        { id: "WARM", label: "WARM Leads", color: "bg-orange-50 border-orange-100 text-orange-600", score: "60-79" },
        { id: "COOL", label: "COOL Leads", color: "bg-blue-50 border-blue-100 text-blue-600", score: "40-59" },
        { id: "COLD", label: "COLD Leads", color: "bg-zinc-50 border-zinc-100 text-zinc-600", score: "0-39" },
    ];

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-brand animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Automation...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/s/${slug}/admissions/dashboard`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                            Automation Center
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        AI-Driven WhatsApp Engagement Engine
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isRefreshing && <Loader2 className="h-4 w-4 text-brand animate-spin" />}
                    <button
                        onClick={handleToggleGlobal}
                        className={cn(
                            "h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl",
                            settings?.globalAutomationEnabled ? "bg-green-600 text-white shadow-green-600/20" : "bg-zinc-200 text-zinc-500 shadow-zinc-200/20"
                        )}
                    >
                        <Power className="h-4 w-4" />
                        Automation: {settings?.globalAutomationEnabled ? 'Active' : 'Paused'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "AI Messages Sent", value: stats?.totalSent || 0, icon: MessageSquare, color: "text-blue-600", sub: "Last 30 days" },
                    { label: "Response Rate", value: `${stats?.responseRate || 0}%`, icon: ArrowUpRight, color: "text-green-600", sub: "Direct parent replies" },
                    { label: "Staff Hours Saved", value: `${stats?.savedHours || 0}h`, icon: Hourglass, color: "text-orange-600", sub: "Manual task avoidance" },
                    { label: "Active Rules", value: stats?.activeRules || 0, icon: Zap, color: "text-brand", sub: "Dynamic score bands" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900">{stat.value}</h3>
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{stat.label}</p>
                        <p className="text-[10px] font-bold text-zinc-500 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quiet Hours Alert */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-3xl flex items-center gap-4 transition-all">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-lg shadow-orange-200/50">
                    <Clock className="h-5 w-5" />
                </div>
                {isEditingQuietHours ? (
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-orange-900 tracking-widest">Start Time</label>
                            <input
                                type="time"
                                value={tempQuietHours.start}
                                onChange={(e) => setTempQuietHours({ ...tempQuietHours, start: e.target.value })}
                                className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-xs font-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-orange-900 tracking-widest">End Time</label>
                            <input
                                type="time"
                                value={tempQuietHours.end}
                                onChange={(e) => setTempQuietHours({ ...tempQuietHours, end: e.target.value })}
                                className="bg-white border border-orange-200 rounded-lg px-2 py-1 text-xs font-black"
                            />
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={() => setIsEditingQuietHours(false)}
                                className="px-4 py-2 rounded-xl bg-white border border-orange-200 text-[10px] font-black uppercase tracking-widest text-orange-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveQuietHours}
                                disabled={isSaving === "quietHours"}
                                className="px-4 py-2 rounded-xl bg-orange-900 text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2"
                            >
                                {isSaving === "quietHours" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="text-sm font-black text-orange-900 leading-none uppercase tracking-tight">Quiet Hours Configured</p>
                            <p className="text-[10px] text-orange-700 font-bold uppercase mt-1 tracking-widest">
                                AI will remain silent between {settings?.quietHours?.start || "20:00"} and {settings?.quietHours?.end || "09:00"}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditingQuietHours(true)}
                            className="ml-auto px-4 py-2 rounded-xl bg-orange-100 text-[10px] font-black uppercase tracking-widest text-orange-900 hover:bg-orange-200 transition-colors"
                        >
                            Edit Schedule
                        </button>
                    </>
                )}
            </div>

            {/* Policy Cards Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {BANDS.map(band => {
                    const rule = rules.find(r => r.scoreBand === band.id);
                    const allowedCats = JSON.parse(rule?.allowedCats || '["Admission", "Tour"]');

                    return (
                        <div key={band.id} className="rounded-[40px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 relative overflow-hidden group">
                            <div className={cn("absolute top-0 right-0 h-24 w-24 -mt-10 -mr-10 rounded-full opacity-10 blur-xl", band.color.split(' ')[0])} />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className={cn("px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border", band.color)}>
                                        {band.label}
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Target Score: {band.score}</span>
                                </div>
                                <button
                                    onClick={() => handleSaveRule(band.id, { isEnabled: !(rule?.isEnabled ?? true) })}
                                    className={cn(
                                        "h-6 w-11 rounded-full flex items-center px-1 transition-colors outline outline-2 outline-transparent hover:outline-brand/20",
                                        (rule?.isEnabled ?? true) ? "bg-green-100" : "bg-zinc-100"
                                    )}
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded-full transition-all",
                                        (rule?.isEnabled ?? true) ? "bg-green-600 translate-x-5" : "bg-zinc-300"
                                    )} />
                                </button>
                            </div>

                            <div className={cn(
                                "grid gap-8 sm:grid-cols-2 transition-opacity",
                                !(rule?.isEnabled ?? true) && "opacity-40 pointer-events-none"
                            )}>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Frequency</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-zinc-900">{rule?.frequency || '24'}</span>
                                        <span className="text-xs font-bold text-zinc-500">hours</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="168" step="12"
                                        value={rule?.frequency || 24}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setRules(prev => {
                                                const exists = prev.find(r => r.scoreBand === band.id);
                                                if (exists) return prev.map(r => r.scoreBand === band.id ? { ...r, frequency: val } : r);
                                                return [...prev, { scoreBand: band.id, frequency: val, maxMessages: 7, isEnabled: true, allowedCats: '["Admission", "Tour"]' }];
                                            });
                                        }}
                                        className="w-full accent-brand"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Max Interactions</label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-zinc-900">{rule?.maxMessages || '7'}</span>
                                        <span className="text-xs font-bold text-zinc-500">steps</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="14" step="1"
                                        value={rule?.maxMessages || 7}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setRules(prev => {
                                                const exists = prev.find(r => r.scoreBand === band.id);
                                                if (exists) return prev.map(r => r.scoreBand === band.id ? { ...r, maxMessages: val } : r);
                                                return [...prev, { scoreBand: band.id, frequency: 24, maxMessages: val, isEnabled: true, allowedCats: '["Admission", "Tour"]' }];
                                            });
                                        }}
                                        className="w-full accent-brand"
                                    />
                                </div>
                            </div>

                            <div className={cn(
                                "mt-8 pt-8 border-t border-zinc-50 transition-opacity",
                                !(rule?.isEnabled ?? true) && "opacity-40 pointer-events-none"
                            )}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-4">Enabled Content Archetypes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Admission', 'Payment', 'Tour', 'Value', 'Nurture'].map(cat => {
                                        const isActive = allowedCats.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    const next = isActive ? allowedCats.filter((c: string) => c !== cat) : [...allowedCats, cat];
                                                    setRules(prev => {
                                                        const exists = prev.find(r => r.scoreBand === band.id);
                                                        if (exists) return prev.map(r => r.scoreBand === band.id ? { ...r, allowedCats: JSON.stringify(next) } : r);
                                                        return [...prev, { scoreBand: band.id, frequency: 24, maxMessages: 7, isEnabled: true, allowedCats: JSON.stringify(next) }];
                                                    });
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    isActive ? "bg-brand/10 border-brand/20 text-brand scale-105" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-zinc-300"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={() => handleSaveRule(band.id, rule)}
                                disabled={isSaving === band.id}
                                className={cn(
                                    "w-full mt-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                                    isSaving === band.id ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-brand shadow-lg hover:shadow-brand/20",
                                    !(rule?.isEnabled ?? true) && "opacity-40 pointer-events-none"
                                )}
                            >
                                {isSaving === band.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Save Policy
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Automation Queue & History */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[40px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Active Automation Queue</h3>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Pending AI outgoing messages</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-black text-zinc-600">{queue.length} Pending</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {queue.length > 0 ? queue.map((item, i) => {
                            const isPerforming = isActionLoading === item.id;

                            return (
                                <div key={i} className={cn(
                                    "flex items-center justify-between p-4 rounded-3xl bg-zinc-50 border border-zinc-100 border-l-4 border-l-orange-500 transition-all",
                                    isPerforming && "opacity-50 pointer-events-none"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                                            {isPerforming ? <Loader2 className="h-5 w-5 animate-spin text-brand" /> : <MessageSquare className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900 leading-none">{item.type}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1.5 tracking-widest">
                                                To: {item.leadName} • {format(new Date(item.scheduledAt), 'MMM dd, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCancelQueue(item.id)}
                                            className="h-8 w-8 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-400 shadow-sm transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleExecuteQueue(item.id)}
                                            className="h-8 w-8 rounded-full bg-zinc-900 hover:bg-brand flex items-center justify-center text-white shadow-sm transition-colors"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                <Zap className="h-12 w-12 mb-4 text-zinc-300" />
                                <p className="text-xs font-black uppercase tracking-widest">Queue is currently empty</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[40px] border border-zinc-200 bg-zinc-50 p-8 transition-all">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">AI Activity Log</h3>
                    <div className="space-y-6">
                        {history.length > 0 ? history.map((item, i) => (
                            <div key={i} className="relative pl-6 pb-6 border-l border-zinc-200 last:pb-0 group">
                                <div className="absolute left-0 top-0 -ml-1.5 h-3 w-3 rounded-full bg-zinc-300 border-2 border-zinc-50 transition-colors group-hover:bg-brand" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        {format(new Date(item.createdAt), 'h:mm a')}
                                    </p>
                                    <p className="text-xs font-black text-zinc-900 leading-tight">
                                        Sent to <span className="text-brand">{item.leadName}</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed mt-1">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center py-10 opacity-50">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
