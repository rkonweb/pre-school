"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Server,
    ShieldAlert,
    Mail,
    Database,
    RefreshCw,
    Lock,
    Cloud,
    CheckCircle2,
    AlertTriangle,
    Globe,
    Clock,
    Coins,
    ShieldCheck,
    HardDrive,
    Trash2,
    Activity,
    Users,
    Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSystemSettingsAction, saveSystemSettingsAction, getInfrastructureStatsAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    // System Settings State
    const [settings, setSettings] = useState({
        timezone: "UTC+05:30 (India Standard Time)",
        currency: "INR",
        mfaEnabled: true,
        sessionTimeout: false,
        allowedDomains: "*",
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
        smtpSender: "noreply@pre-school.com",
        backupEnabled: true,
        backupFrequency: "DAILY",
        maintenanceMode: false
    });

    // Infrastructure Stats State
    const [stats, setStats] = useState({
        totalSchools: 0,
        totalStaff: 0,
        totalStudents: 0,
        dbSizeMB: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsStatsLoading(true);
        const [settingsRes, statsRes] = await Promise.all([
            getSystemSettingsAction(),
            getInfrastructureStatsAction()
        ]);

        if (settingsRes.success && settingsRes.data) {
            setSettings(settingsRes.data);
        }
        if (statsRes.success && statsRes.data) {
            setStats(statsRes.data);
        }
        setIsStatsLoading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        const res = await saveSystemSettingsAction(settings);
        if (res.success) {
            toast.success("System configurations updated successfully.");
        } else {
            toast.error("Failed to update system configurations.");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 p-10 min-h-screen pb-20 bg-zinc-50/30">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">System <span className="text-blue-600">Console</span></h1>
                    <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Global Platform Control & Resource Monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="p-3 rounded-2xl bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all hover:rotate-180 duration-500"
                    >
                        <RefreshCw className={cn("h-4 w-4", isStatsLoading && "animate-spin")} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={cn(
                            "flex items-center gap-2 rounded-2xl px-8 py-3.5 font-black uppercase text-[10px] tracking-widest text-white shadow-xl transition-all active:scale-95",
                            isLoading ? "bg-zinc-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:-translate-y-0.5"
                        )}
                    >
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isLoading ? "Synchronizing..." : "Commit Changes"}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Schools", value: stats.totalSchools, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Staff", value: stats.totalStaff, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Total Students", value: stats.totalStudents, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "DB Payload", value: `${stats.dbSizeMB} MB`, icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden group">
                        <div className="relative z-10">
                            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-zinc-900 mt-1">{isStatsLoading ? "..." : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Core Settings Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Security & Localization Row */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Regional Settings */}
                        <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 ring-8 ring-blue-50/50">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Localization</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Regional standards and time.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">System Timezone</label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (India Standard Time)</option>
                                        <option value="UTC+00:00 (Greenwich Mean Time)">UTC+00:00 (Greenwich Mean Time)</option>
                                        <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                                        <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                                        <option value="UTC+01:00 (Central European Time)">UTC+01:00 (Central European Time)</option>
                                        <option value="UTC+08:00 (Singapore/China Time)">UTC+08:00 (Singapore/China Time)</option>
                                        <option value="UTC+09:00 (Japan Standard Time)">UTC+09:00 (Japan Standard Time)</option>
                                        <option value="UTC+10:00 (Australian Eastern Time)">UTC+10:00 (Australian Eastern Time)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Global Currency</label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="INR">INR - Indian Rupee (₹)</option>
                                        <option value="USD">USD - US Dollar ($)</option>
                                        <option value="EUR">EUR - Euro (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-600 ring-8 ring-rose-50/50">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Access Shield</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Auth policies and security levels.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setSettings({ ...settings, mfaEnabled: !settings.mfaEnabled })}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        settings.mfaEnabled ? "bg-rose-50/30 border-rose-100" : "bg-zinc-50/50 border-zinc-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl", settings.mfaEnabled ? "bg-rose-100 text-rose-600" : "bg-white text-zinc-400")}>
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-black uppercase text-zinc-900 tracking-tight text-left">Enforce MFA</span>
                                    </div>
                                    <div className={cn("w-10 h-6 rounded-full flex items-center px-1 transition-colors", settings.mfaEnabled ? "bg-rose-500" : "bg-zinc-200")}>
                                        <div className={cn("h-4 w-4 rounded-full bg-white transition-transform", settings.mfaEnabled ? "translate-x-4" : "")} />
                                    </div>
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        settings.maintenanceMode ? "bg-amber-50/30 border-amber-100" : "bg-zinc-50/50 border-zinc-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl", settings.maintenanceMode ? "bg-amber-100 text-amber-600" : "bg-white text-zinc-400")}>
                                            <AlertTriangle className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-black uppercase text-zinc-900 tracking-tight text-left">Maintenance Mode</span>
                                    </div>
                                    <div className={cn("w-10 h-6 rounded-full flex items-center px-1 transition-colors", settings.maintenanceMode ? "bg-amber-500" : "bg-zinc-200")}>
                                        <div className={cn("h-4 w-4 rounded-full bg-white transition-transform", settings.maintenanceMode ? "translate-x-4" : "")} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Email Gateway */}
                    <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 ring-8 ring-amber-50/50">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Email Gateway</h3>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SMTP configuration for system emails.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Host</label>
                                <input
                                    value={settings.smtpHost || ""}
                                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none"
                                    placeholder="smtp.provider.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Port</label>
                                <input
                                    type="number"
                                    value={settings.smtpPort || 587}
                                    onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none"
                                    placeholder="587"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Sender Email</label>
                                <input
                                    value={settings.smtpSender || ""}
                                    onChange={(e) => setSettings({ ...settings, smtpSender: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none"
                                    placeholder="noreply@domain.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Username</label>
                                <input
                                    value={settings.smtpUser || ""}
                                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2 text-right">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block text-left">API Key / Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={settings.smtpPass || ""}
                                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 font-mono text-sm font-bold text-zinc-700 outline-none"
                                    />
                                    <Key className="absolute right-4 top-4 h-4 w-4 text-zinc-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Stats Column */}
                <div className="space-y-8">
                    {/* Backups */}
                    <div className="rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-2xl shadow-zinc-900/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-3xl bg-white/10 flex items-center justify-center text-emerald-400 ring-8 ring-white/5">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter">Snapshots</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider underline decoration-emerald-500/50">Redundancy Status</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Next Scheduled</span>
                                    <span className="text-xs font-black text-emerald-400">6:00 AM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[75%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500">75%</span>
                                </div>
                            </div>
                            <button className="w-full py-4 rounded-2xl bg-white text-zinc-900 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 hover:scale-[1.02] transition-all">
                                Trigger Manual Backup
                            </button>
                        </div>
                    </div>

                    {/* Infrastructure Health */}
                    <div className="rounded-[2.5rem] bg-white border border-zinc-100 p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-8 ring-indigo-50/50">
                                <Server className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Stack Health</h3>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Server status and latency.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "DB Master", status: "HEALTHY", val: 99 },
                                { name: "Redis Cache", status: "SYNCED", val: 100 },
                                { name: "Storage Box", status: "NEAR LIMIT", val: 82, color: "bg-amber-500" }
                            ].map((s, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider font-mono">{s.name}</span>
                                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", s.status === "HEALTHY" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 uppercase font-serif italic")}>
                                            {s.status}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-zinc-50 border border-zinc-100 overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", s.color || "bg-indigo-600")} style={{ width: `${s.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
