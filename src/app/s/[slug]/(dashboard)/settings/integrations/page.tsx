"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Zap,
    MessageSquare,
    MessageCircle,
    CreditCard,
    ArrowLeft,
    ShieldCheck,
    Loader2,
    Save,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Lock,
    MapPin,
    Video,
    Cloud,
    HardDrive
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getIntegrationSettingsAction, saveIntegrationSettingsAction } from "@/app/actions/settings-actions";

export default function IntegrationsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("whatsapp");

    const [config, setConfig] = useState<any>({
        whatsapp: {
            enabled: false,
            provider: "Meta",
            apiKey: "",
            phoneId: "",
            businessId: ""
        },
        sms: {
            enabled: false,
            provider: "Msg91",
            apiKey: "",
            senderId: ""
        },
        payment: {
            enabled: false,
            provider: "Razorpay",
            key: "",
            secret: ""
        },
        email: {
            enabled: false,
            host: "",
            port: "587",
            user: "",
            pass: "",
            from: ""
        },
        maps: {
            enabled: false,
            apiKey: ""
        },
        zoom: {
            enabled: false,
            clientId: "",
            clientSecret: "",
            accountId: ""
        },
        storage: {
            enabled: false,
            provider: "AWS",
            bucket: "",
            region: "",
            accessKey: "",
            secretKey: "",
            endpoint: ""
        },
        googleDrive: {
            enabled: false,
            clientEmail: "",
            privateKey: "",
            folderId: ""
        }
    });

    useEffect(() => {
        fetchData();
    }, [slug]);

    async function fetchData() {
        setLoading(true);
        const res = await getIntegrationSettingsAction(slug);
        if (res.success && res.data) {
            setConfig((prev: any) => ({
                ...prev,
                ...res.data
            }));
        }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        const res = await saveIntegrationSettingsAction(slug, config);
        if (res.success) {
            toast.success("Integration settings updated successfully");
        } else {
            toast.error(res.error || "Failed to save settings");
        }
        setSaving(false);
    }

    const tabs = [
        { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        { id: "sms", label: "SMS Gateway", icon: MessageSquare, color: "text-brand", bg: "bg-brand/5" },
        { id: "payment", label: "Payments", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50" },
        { id: "email", label: "Email SMTP", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
        { id: "maps", label: "Google Maps", icon: MapPin, color: "text-red-500", bg: "bg-red-50" },
        { id: "zoom", label: "Zoom / Meet", icon: Video, color: "text-cyan-500", bg: "bg-cyan-50" },
        { id: "storage", label: "Cloud Drive", icon: Cloud, color: "text-sky-500", bg: "bg-sky-50" },
        { id: "googleDrive", label: "Google Drive", icon: HardDrive, color: "text-green-500", bg: "bg-green-50" },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Restoring connections...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/settings`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Connectors & APIs</h1>
                        <p className="text-sm text-zinc-500 font-medium mt-0.5 italic">Bridge your school with global communication and payment clusters.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-6 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand/20 transition-all hover:brightness-110 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Syncing..." : "Save Config"}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-[28px] w-fit overflow-x-auto max-w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200"
                                : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? tab.color : "text-zinc-400")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden p-10">
                {activeTab === "whatsapp" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">WhatsApp API Configuration</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Official Meta/Wati integration protocol</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.whatsapp.enabled ? "bg-emerald-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                        {config.whatsapp.enabled ? "Active Node" : "Offline"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Engagement Enablement</label>
                                    <button
                                        onClick={() => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: !config.whatsapp.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.whatsapp.enabled ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Global Status</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.whatsapp.enabled ? "bg-emerald-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.whatsapp.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Service Cluster</label>
                                    <select
                                        value={config.whatsapp.provider}
                                        onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, provider: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-black text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
                                    >
                                        <option value="Meta">Meta Official API</option>
                                        <option value="Wati">Wati.io</option>
                                        <option value="Twilio">Twilio WhatsApp</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Access Token / API Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Enter secure credentials..."
                                            value={config.whatsapp.apiKey}
                                            onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, apiKey: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Phone Number ID</label>
                                    <input
                                        placeholder="e.g. 1045239582..."
                                        value={config.whatsapp.phoneId}
                                        onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, phoneId: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">WhatsApp Business ID</label>
                                    <input
                                        placeholder="e.g. 2495820395..."
                                        value={config.whatsapp.businessId}
                                        onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, businessId: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="p-6 rounded-[24px] bg-zinc-50 border border-zinc-100 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <ExternalLink className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-zinc-900 uppercase">Integration Docs</h4>
                                <p className="text-[10px] font-medium text-zinc-500 mt-1">Need help setting up your Meta Business app? <a href="#" className="text-emerald-600 font-black hover:underline">View Implementation Guide</a></p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "sms" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">SMS Gateway Matrix</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Tier-1 transit for transactional alerts</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/5 border border-brand/10">
                                    <div className={cn("h-2 w-2 rounded-full", config.sms.enabled ? "bg-brand animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-brand uppercase tracking-widest">
                                        {config.sms.enabled ? "Synchronized" : "Stalled"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Network Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, sms: { ...config.sms, enabled: !config.sms.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.sms.enabled ? "bg-brand/5 border-brand/20 text-brand" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Enable SMS</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.sms.enabled ? "bg-brand" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.sms.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Default Provider</label>
                                    <select
                                        value={config.sms.provider}
                                        onChange={(e) => setConfig({ ...config, sms: { ...config.sms, provider: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-black text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all uppercase"
                                    >
                                        <option value="Msg91">Msg91 (Recommended)</option>
                                        <option value="Twilio">Twilio</option>
                                        <option value="TextLocal">TextLocal</option>
                                        <option value="BulkSMS">BulkSMS</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Auth / API Token</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Enter secure API credentials..."
                                            value={config.sms.apiKey}
                                            onChange={(e) => setConfig({ ...config, sms: { ...config.sms, apiKey: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Sender Designation (Sender ID)</label>
                                    <input
                                        placeholder="e.g. PREEDU"
                                        maxLength={6}
                                        value={config.sms.senderId}
                                        onChange={(e) => setConfig({ ...config, sms: { ...config.sms, senderId: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-black text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all uppercase"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "payment" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Financial Terminal Settings</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Secure tunnel for fee disbursements</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.payment.enabled ? "bg-purple-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">
                                        {config.payment.enabled ? "Vault Encrypted" : "Decoupled"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Gateway Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, payment: { ...config.payment, enabled: !config.payment.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.payment.enabled ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Online Payments</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.payment.enabled ? "bg-purple-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.payment.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Primary Processor</label>
                                    <select
                                        value={config.payment.provider}
                                        onChange={(e) => setConfig({ ...config, payment: { ...config.payment, provider: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-black text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all uppercase"
                                    >
                                        <option value="Razorpay">Razorpay</option>
                                        <option value="Stripe">Stripe</option>
                                        <option value="Paytm">Paytm</option>
                                        <option value="SSLCommerz">SSLCommerz</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Merchant Key ID / Public Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            placeholder="e.g. rzp_test_..."
                                            value={config.payment.key}
                                            onChange={(e) => setConfig({ ...config, payment: { ...config.payment, key: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Secret Key / Salt</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Enter secure secret keys..."
                                            value={config.payment.secret}
                                            onChange={(e) => setConfig({ ...config, payment: { ...config.payment, secret: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "email" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Email SMTP Relay</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Native mail server orchestration</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.email.enabled ? "bg-orange-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                                        {config.email.enabled ? "Relay Active" : "Default Server"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Custom SMTP</label>
                                    <button
                                        onClick={() => setConfig({ ...config, email: { ...config.email, enabled: !config.email.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.email.enabled ? "bg-orange-50 border-orange-200 text-orange-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Enable Relay</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.email.enabled ? "bg-orange-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.email.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">SMTP Host</label>
                                    <input
                                        placeholder="e.g. smtp.gmail.com"
                                        value={config.email.host}
                                        onChange={(e) => setConfig({ ...config, email: { ...config.email, host: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Port</label>
                                    <input
                                        placeholder="587"
                                        value={config.email.port}
                                        onChange={(e) => setConfig({ ...config, email: { ...config.email, port: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Sender Address (From)</label>
                                    <input
                                        placeholder="noreply@school.com"
                                        value={config.email.from}
                                        onChange={(e) => setConfig({ ...config, email: { ...config.email, from: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Username / Auth User</label>
                                    <input
                                        placeholder="API Key or Email"
                                        value={config.email.user}
                                        onChange={(e) => setConfig({ ...config, email: { ...config.email, user: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Password / API Secret</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={config.email.pass}
                                            onChange={(e) => setConfig({ ...config, email: { ...config.email, pass: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "maps" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Geo-Spatial Intelligence</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Location tracking and address resolution</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.maps?.enabled ? "bg-red-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                                        {config.maps?.enabled ? "Live Uplink" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Service Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, maps: { ...config.maps, enabled: !config.maps?.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.maps?.enabled ? "bg-red-50 border-red-200 text-red-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Enable Maps</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.maps?.enabled ? "bg-red-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.maps?.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Google Maps API Key</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="AIzaSy..."
                                            value={config.maps?.apiKey}
                                            onChange={(e) => setConfig({ ...config, maps: { ...config.maps, apiKey: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium px-2">Ensure 'Maps JavaScript API' and 'Places API' are enabled in your Google Cloud Console.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "zoom" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Virtual Classroom Bridge</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Server-to-Server OAuth integration</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.zoom?.enabled ? "bg-cyan-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">
                                        {config.zoom?.enabled ? "Connected" : "Unlinked"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Integration Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, zoom: { ...config.zoom, enabled: !config.zoom?.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.zoom?.enabled ? "bg-cyan-50 border-cyan-200 text-cyan-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Enable Zoom</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.zoom?.enabled ? "bg-cyan-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.zoom?.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Account ID</label>
                                    <input
                                        placeholder="Zoom Account ID"
                                        value={config.zoom?.accountId}
                                        onChange={(e) => setConfig({ ...config, zoom: { ...config.zoom, accountId: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Client ID</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-cyan-500 transition-colors" />
                                        <input
                                            placeholder="Client ID"
                                            value={config.zoom?.clientId}
                                            onChange={(e) => setConfig({ ...config, zoom: { ...config.zoom, clientId: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Client Secret</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-cyan-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Client Secret"
                                            value={config.zoom?.clientSecret}
                                            onChange={(e) => setConfig({ ...config, zoom: { ...config.zoom, clientSecret: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "storage" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Cloud Object Storage</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">S3-Compatible Bucket Configuration</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.storage?.enabled ? "bg-sky-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">
                                        {config.storage?.enabled ? "Bucket Mounted" : "Unmounted"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Mount Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, storage: { ...config.storage, enabled: !config.storage?.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.storage?.enabled ? "bg-sky-50 border-sky-200 text-sky-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Mount Bucket</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.storage?.enabled ? "bg-sky-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.storage?.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Storage Provider</label>
                                    <select
                                        value={config.storage?.provider}
                                        onChange={(e) => setConfig({ ...config, storage: { ...config.storage, provider: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-black text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all uppercase"
                                    >
                                        <option value="AWS">AWS S3</option>
                                        <option value="Cloudflare">Cloudflare R2</option>
                                        <option value="DigitalOcean">DigitalOcean Spaces</option>
                                        <option value="MinIO">MinIO Self-Hosted</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Bucket Name</label>
                                    <input
                                        placeholder="e.g. school-assets"
                                        value={config.storage?.bucket}
                                        onChange={(e) => setConfig({ ...config, storage: { ...config.storage, bucket: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Region</label>
                                    <input
                                        placeholder="e.g. us-east-1"
                                        value={config.storage?.region}
                                        onChange={(e) => setConfig({ ...config, storage: { ...config.storage, region: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Access Key ID</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors" />
                                        <input
                                            placeholder="AKIA..."
                                            value={config.storage?.accessKey}
                                            onChange={(e) => setConfig({ ...config, storage: { ...config.storage, accessKey: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Secret Access Key</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Enter secret key..."
                                            value={config.storage?.secretKey}
                                            onChange={(e) => setConfig({ ...config, storage: { ...config.storage, secretKey: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                {config.storage?.provider !== 'AWS' && (
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Custom Endpoint (Optional)</label>
                                        <input
                                            placeholder="e.g. https://<accountid>.r2.cloudflarestorage.com"
                                            value={config.storage?.endpoint}
                                            onChange={(e) => setConfig({ ...config, storage: { ...config.storage, endpoint: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "googleDrive" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Google Drive API</h3>
                                    <p className="text-[10px] font-black text-zinc-400 tracking-widest uppercase italic">Service account for file uploads & storage</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
                                    <div className={cn("h-2 w-2 rounded-full", config.googleDrive?.enabled ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">
                                        {config.googleDrive?.enabled ? "Connected" : "Disconnected"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Integration Status</label>
                                    <button
                                        onClick={() => setConfig({ ...config, googleDrive: { ...config.googleDrive, enabled: !config.googleDrive?.enabled } })}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border flex items-center justify-between px-6 transition-all",
                                            config.googleDrive?.enabled ? "bg-green-50 border-green-200 text-green-900" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                                        )}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">Enable Google Drive</span>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-all",
                                            config.googleDrive?.enabled ? "bg-green-500" : "bg-zinc-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config.googleDrive?.enabled ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Folder ID (Optional)</label>
                                    <input
                                        placeholder="Leave empty for root folder"
                                        value={config.googleDrive?.folderId}
                                        onChange={(e) => setConfig({ ...config, googleDrive: { ...config.googleDrive, folderId: e.target.value } })}
                                        className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Service Account Email</label>
                                    <div className="relative group">
                                        <HardDrive className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-green-500 transition-colors" />
                                        <input
                                            placeholder="your-service-account@project.iam.gserviceaccount.com"
                                            value={config.googleDrive?.clientEmail}
                                            onChange={(e) => setConfig({ ...config, googleDrive: { ...config.googleDrive, clientEmail: e.target.value } })}
                                            className="w-full h-14 rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Private Key (from JSON credentials)</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-4 h-4 w-4 text-zinc-300 group-focus-within:text-green-500 transition-colors" />
                                        <textarea
                                            placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                                            value={config.googleDrive?.privateKey}
                                            onChange={(e) => setConfig({ ...config, googleDrive: { ...config.googleDrive, privateKey: e.target.value } })}
                                            rows={4}
                                            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 pl-14 pr-6 py-4 text-xs font-bold text-zinc-900 outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all font-mono resize-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium px-2">Paste the private_key value from your service account JSON file. Keep newlines intact.</p>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 rounded-[24px] bg-green-50 border border-green-100 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <ExternalLink className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-green-900 uppercase">Setup Instructions</h4>
                                <ol className="text-[10px] font-medium text-green-700 mt-2 space-y-1 list-decimal list-inside">
                                    <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-green-600 font-black hover:underline">Google Cloud Console</a></li>
                                    <li>Create a Service Account and download the JSON key</li>
                                    <li>Enable the Google Drive API for your project</li>
                                    <li>Copy the client_email and private_key from the JSON file</li>
                                    <li>(Optional) Create a folder in Google Drive and share it with the service account email</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Warning */}
            <div className="p-8 rounded-[32px] bg-amber-50 border border-amber-100 flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
                <div className="space-y-2">
                    <h4 className="text-sm font-black text-amber-900 uppercase">Cryptographic Safety Disclaimer</h4>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        These credentials establish direct tunnels to your financial and communication assets. Ensure your staff with "Integration Access" have undergone security vetting. All key modifications are logged with IP and Timestamp.
                    </p>
                </div>
            </div>
        </div>
    );
}
