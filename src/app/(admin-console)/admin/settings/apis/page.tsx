"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Mail,
    RefreshCw,
    Activity,
    Key,
    Server,
    HardDrive,
    CreditCard,
    MessageSquare,
    MapPin,
    Video,
    Smartphone,
    Globe,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSystemSettingsAction, saveAPISettingsAction, testAIIntegrationAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";

// --- Types ---

interface IntegrationsConfig {
    // AI
    defaultProvider?: 'google' | 'openai';
    googleAiKey?: string;
    openAiKey?: string;

    // Storage
    googleDrive?: {
        serviceAccountEmail?: string;
        privateKey?: string;
        folderId?: string;
        isActive?: boolean;
    };

    // Payments
    payments?: {
        currency?: string;
        razorpay?: { keyId: string; keySecret: string; isActive: boolean };
        stripe?: { publishableKey: string; secretKey: string; isActive: boolean };
    };

    // SMS
    sms?: {
        provider?: 'twilio' | 'msg91' | 'none';
        twilio?: { accountSid: string; authToken: string; fromPhone: string };
        msg91?: { authKey: string; senderId: string };
    };

    // WhatsApp
    whatsapp?: {
        provider?: 'interakt' | 'wati' | 'none';
        interakt?: { apiKey: string };
        wati?: { endpoint: string; token: string };
    };

    // Others
    maps?: { googleMapsApiKey?: string };
    zoom?: { accountId: string; clientId: string; clientSecret: string };
}


export default function AdminAPISettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("email");

    // Flattened State for specific SMTP fields
    const [smtpSettings, setSmtpSettings] = useState({
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
        smtpSender: "noreply@pre-school.com",
    });

    // JSON State for everything else
    const [config, setConfig] = useState<IntegrationsConfig>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsDataLoading(true);
        const res = await getSystemSettingsAction();

        if (res.success && res.data) {
            setSmtpSettings({
                smtpHost: res.data.smtpHost || "",
                smtpPort: res.data.smtpPort || 587,
                smtpUser: res.data.smtpUser || "",
                smtpPass: res.data.smtpPass || "",
                smtpSender: res.data.smtpSender || "noreply@pre-school.com",
            });

            try {
                const parsedConfig = res.data.integrationsConfig ? JSON.parse(res.data.integrationsConfig) : {};
                setConfig(parsedConfig);
            } catch (e) {
                setConfig({});
            }
        }
        setIsDataLoading(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        const payload = {
            ...smtpSettings,
            integrationsConfig: JSON.stringify(config)
        };

        const res = await saveAPISettingsAction(payload);
        if (res.success) {
            toast.success("API configurations updated successfully.");
        } else {
            toast.error("Failed to update API configurations.");
        }
        setIsLoading(false);
    };

    const tabs = [
        { id: "email", label: "Email Gateway", icon: Mail },
        { id: "ai", label: "AI & Intelligence", icon: Activity },
        { id: "storage", label: "Storage & Files", icon: HardDrive },
        { id: "payments", label: "Payment Gateways", icon: CreditCard },
        { id: "communication", label: "SMS & WhatsApp", icon: MessageSquare },
        { id: "others", label: "Maps & Zoom", icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-zinc-50/30 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 py-4 mb-8">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Server className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-zinc-900 uppercase">API <span className="text-indigo-600">Connectors</span></h1>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manage System Integrations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all hover:rotate-180 duration-500 hover:bg-zinc-50"
                            title="Refresh Data"
                        >
                            <RefreshCw className={cn("h-4 w-4", isDataLoading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-6 py-2.5 font-black uppercase text-[10px] tracking-widest text-white shadow-lg transition-all active:scale-95",
                                isLoading ? "bg-zinc-700 cursor-not-allowed" : "bg-zinc-900 hover:bg-zinc-800 hover:-translate-y-0.5"
                            )}
                        >
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 flex gap-8">
                {/* Sidebar Navigation */}
                <div className="w-64 shrink-0 space-y-2 sticky top-32 h-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all text-left",
                                activeTab === tab.id
                                    ? "bg-white text-indigo-600 shadow-md ring-1 ring-zinc-100"
                                    : "text-zinc-500 hover:bg-white/50 hover:text-zinc-900"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-indigo-600" : "text-zinc-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === "email" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={Mail} title="SMTP Configuration" description="Configure outgoing email server settings." color="bg-amber-50 text-amber-600" />
                                <div className="grid gap-6 mt-6">
                                    <InputGroup label="SMTP Host" value={smtpSettings.smtpHost} onChange={(v) => setSmtpSettings({ ...smtpSettings, smtpHost: v })} placeholder="smtp.gmail.com" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Port" type="number" value={smtpSettings.smtpPort} onChange={(v) => setSmtpSettings({ ...smtpSettings, smtpPort: Number(v) })} placeholder="587" />
                                        <InputGroup label="Sender Email" value={smtpSettings.smtpSender} onChange={(v) => setSmtpSettings({ ...smtpSettings, smtpSender: v })} placeholder="noreply@school.com" />
                                    </div>
                                    <InputGroup label="Username" value={smtpSettings.smtpUser} onChange={(v) => setSmtpSettings({ ...smtpSettings, smtpUser: v })} />
                                    <InputGroup label="Password" type="password" value={smtpSettings.smtpPass} onChange={(v) => setSmtpSettings({ ...smtpSettings, smtpPass: v })} isSecret />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "ai" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={Activity} title="AI Config" description="Manage LLM providers." color="bg-indigo-50 text-indigo-600" />

                                <div className="flex gap-2 mt-6 mb-6">
                                    {['google', 'openai'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setConfig({ ...config, defaultProvider: p as any })}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                config.defaultProvider === p
                                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                                    : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                                            )}
                                        >
                                            {p === 'google' ? 'Google Gemini' : 'OpenAI GPT-4'}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>Google AI Studio Key (Gemini)</Label>
                                            <Badge isActive={!!config.googleAiKey} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value={config.googleAiKey} onChange={(v) => setConfig({ ...config, googleAiKey: v })} isSecret className="flex-1" />
                                            <TestKeyButton provider="google" apiKey={config.googleAiKey || ""} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label>OpenAI API Key (GPT-4)</Label>
                                            <Badge isActive={!!config.openAiKey} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value={config.openAiKey} onChange={(v) => setConfig({ ...config, openAiKey: v })} isSecret className="flex-1" />
                                            <TestKeyButton provider="openai" apiKey={config.openAiKey || ""} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "storage" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={HardDrive} title="Google Drive" description="Service Account for backup & storage." color="bg-blue-50 text-blue-600" />
                                <div className="grid gap-6 mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Switch checked={config.googleDrive?.isActive} onCheckedChange={(c) => setConfig({ ...config, googleDrive: { ...config.googleDrive, isActive: c } })} />
                                        <Label>Enable Google Drive Uploads</Label>
                                    </div>

                                    <InputGroup
                                        label="Service Account Email"
                                        value={config.googleDrive?.serviceAccountEmail}
                                        onChange={(v) => setConfig({ ...config, googleDrive: { ...config.googleDrive, serviceAccountEmail: v } })}
                                        placeholder="service-account@project.iam.gserviceaccount.com"
                                    />
                                    <InputGroup
                                        label="Folder ID"
                                        value={config.googleDrive?.folderId}
                                        onChange={(v) => setConfig({ ...config, googleDrive: { ...config.googleDrive, folderId: v } })}
                                        placeholder="1A2B3C..."
                                    />
                                    <InputGroup
                                        label="Private Key"
                                        value={config.googleDrive?.privateKey}
                                        onChange={(v) => setConfig({ ...config, googleDrive: { ...config.googleDrive, privateKey: v } })}
                                        isSecret
                                        isTextArea
                                        placeholder="-----BEGIN PRIVATE KEY-----..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "payments" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Razorpay */}
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <SectionHeader icon={CreditCard} title="Razorpay" description="Indian payment gateway." color="bg-blue-50 text-blue-900" />
                                    <Switch checked={config.payments?.razorpay?.isActive} onCheckedChange={(c) => setConfig({ ...config, payments: { ...config.payments, razorpay: { ...config.payments?.razorpay, isActive: c } as any } })} />
                                </div>
                                {config.payments?.razorpay?.isActive && (
                                    <div className="grid gap-6 mt-6 animate-in slide-in-from-top-2">
                                        <InputGroup label="Key ID" value={config.payments?.razorpay?.keyId} onChange={(v) => setConfig({ ...config, payments: { ...config.payments, razorpay: { ...config.payments?.razorpay, keyId: v } as any } })} />
                                        <InputGroup label="Key Secret" value={config.payments?.razorpay?.keySecret} onChange={(v) => setConfig({ ...config, payments: { ...config.payments, razorpay: { ...config.payments?.razorpay, keySecret: v } as any } })} isSecret />
                                    </div>
                                )}
                            </div>

                            {/* Stripe */}
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <SectionHeader icon={CreditCard} title="Stripe" description="International payments." color="bg-violet-50 text-violet-600" />
                                    <Switch checked={config.payments?.stripe?.isActive} onCheckedChange={(c) => setConfig({ ...config, payments: { ...config.payments, stripe: { ...config.payments?.stripe, isActive: c } as any } })} />
                                </div>
                                {config.payments?.stripe?.isActive && (
                                    <div className="grid gap-6 mt-6 animate-in slide-in-from-top-2">
                                        <InputGroup label="Publishable Key" value={config.payments?.stripe?.publishableKey} onChange={(v) => setConfig({ ...config, payments: { ...config.payments, stripe: { ...config.payments?.stripe, publishableKey: v } as any } })} />
                                        <InputGroup label="Secret Key" value={config.payments?.stripe?.secretKey} onChange={(v) => setConfig({ ...config, payments: { ...config.payments, stripe: { ...config.payments?.stripe, secretKey: v } as any } })} isSecret />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "communication" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* SMS */}
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={Smartphone} title="SMS Gateway" description="OTP and Notifications." color="bg-green-50 text-green-600" />
                                <div className="flex gap-2 mt-6 mb-6">
                                    {['none', 'twilio', 'msg91'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setConfig({ ...config, sms: { ...config.sms, provider: p as any } })}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                config.sms?.provider === p
                                                    ? "bg-green-50 border-green-200 text-green-700"
                                                    : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                {config.sms?.provider === 'twilio' && (
                                    <div className="grid gap-6 mt-4">
                                        <InputGroup label="Account SID" value={config.sms?.twilio?.accountSid} onChange={(v) => setConfig({ ...config, sms: { ...config.sms, twilio: { ...config.sms?.twilio, accountSid: v } as any } })} />
                                        <InputGroup label="Auth Token" value={config.sms?.twilio?.authToken} onChange={(v) => setConfig({ ...config, sms: { ...config.sms, twilio: { ...config.sms?.twilio, authToken: v } as any } })} isSecret />
                                        <InputGroup label="From Phone" value={config.sms?.twilio?.fromPhone} onChange={(v) => setConfig({ ...config, sms: { ...config.sms, twilio: { ...config.sms?.twilio, fromPhone: v } as any } })} />
                                    </div>
                                )}

                                {config.sms?.provider === 'msg91' && (
                                    <div className="grid gap-6 mt-4">
                                        <InputGroup label="Auth Key" value={config.sms?.msg91?.authKey} onChange={(v) => setConfig({ ...config, sms: { ...config.sms, msg91: { ...config.sms?.msg91, authKey: v } as any } })} isSecret />
                                        <InputGroup label="Sender ID" value={config.sms?.msg91?.senderId} onChange={(v) => setConfig({ ...config, sms: { ...config.sms, msg91: { ...config.sms?.msg91, senderId: v } as any } })} />
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={MessageSquare} title="WhatsApp Business" description="Interakt / WATI integration." color="bg-teal-50 text-teal-600" />
                                <div className="flex gap-2 mt-6 mb-6">
                                    {['none', 'interakt', 'wati'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setConfig({ ...config, whatsapp: { ...config.whatsapp, provider: p as any } })}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                config.whatsapp?.provider === p
                                                    ? "bg-teal-50 border-teal-200 text-teal-700"
                                                    : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                {config.whatsapp?.provider === 'interakt' && (
                                    <div className="mt-4">
                                        <InputGroup label="API Key" value={config.whatsapp?.interakt?.apiKey} onChange={(v) => setConfig({ ...config, whatsapp: { ...config.whatsapp, interakt: { ...config.whatsapp?.interakt, apiKey: v } as any } })} isSecret />
                                    </div>
                                )}
                                {config.whatsapp?.provider === 'wati' && (
                                    <div className="grid gap-6 mt-4">
                                        <InputGroup label="API Endpoint" value={config.whatsapp?.wati?.endpoint} onChange={(v) => setConfig({ ...config, whatsapp: { ...config.whatsapp, wati: { ...config.whatsapp?.wati, endpoint: v } as any } })} />
                                        <InputGroup label="Access Token" value={config.whatsapp?.wati?.token} onChange={(v) => setConfig({ ...config, whatsapp: { ...config.whatsapp, wati: { ...config.whatsapp?.wati, token: v } as any } })} isSecret />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "others" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={MapPin} title="Google Maps" description="Maps JavaScript API Key." color="bg-orange-50 text-orange-600" />
                                <div className="mt-6">
                                    <InputGroup label="API Key" value={config.maps?.googleMapsApiKey} onChange={(v) => setConfig({ ...config, maps: { ...config.maps, googleMapsApiKey: v } })} isSecret={false} placeholder="AIza..." />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
                                <SectionHeader icon={Video} title="Zoom" description="Server-to-Server OAuth app." color="bg-blue-50 text-blue-600" />
                                <div className="grid gap-6 mt-6">
                                    <InputGroup label="Account ID" value={config.zoom?.accountId} onChange={(v) => setConfig({ ...config, zoom: { ...config.zoom, accountId: v } })} />
                                    <InputGroup label="Client ID" value={config.zoom?.clientId} onChange={(v) => setConfig({ ...config, zoom: { ...config.zoom, clientId: v } })} />
                                    <InputGroup label="Client Secret" value={config.zoom?.clientSecret} onChange={(v) => setConfig({ ...config, zoom: { ...config.zoom, clientSecret: v } })} isSecret />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

// --- Helper Components ---

function SectionHeader({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">{title}</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{description}</p>
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{children}</label>;
}

function Input({ value, onChange, isSecret, type = "text", placeholder, className, isTextArea }: any) {
    const Comp = isTextArea ? "textarea" : "input";
    return (
        <div className={cn("relative", className)} suppressHydrationWarning>
            <Comp
                type={type === "number" ? "number" : isSecret ? "password" : "text"}
                value={value || ""}
                onChange={(e: any) => onChange(e.target.value)}
                rows={isTextArea ? 3 : undefined}
                className={cn(
                    "w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-zinc-300",
                    isTextArea && "resize-none"
                )}
                placeholder={placeholder}
            />
            {isSecret && <Key className="absolute right-4 top-4 h-4 w-4 text-zinc-300" />}
        </div>
    );
}

function InputGroup({ label, value, onChange, isSecret, type, placeholder, isTextArea }: any) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={value} onChange={onChange} isSecret={isSecret} type={type} placeholder={placeholder} isTextArea={isTextArea} />
        </div>
    );
}

function Badge({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100 uppercase">
            <CheckCircle2 className="h-3 w-3" /> Active
        </span>
    ) : (
        <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border bg-zinc-50 text-zinc-400 border-zinc-100 uppercase">
            <XCircle className="h-3 w-3" /> Inactive
        </span>
    );
}

function Switch({ checked, onCheckedChange }: { checked?: boolean, onCheckedChange: (c: boolean) => void }) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                checked ? "bg-indigo-600" : "bg-zinc-200"
            )}
        >
            <div className={cn(
                "h-4 w-4 rounded-full bg-white absolute top-1 transition-all shadow-sm",
                checked ? "left-5" : "left-1"
            )} />
        </button>
    );
}

function TestKeyButton({ provider, apiKey }: { provider: 'google' | 'openai', apiKey: string }) {
    const [isTesting, setIsTesting] = useState(false);

    const handleTest = async () => {
        if (!apiKey) return toast.error("Please enter an API key first.");
        setIsTesting(true);
        const res = await testAIIntegrationAction(provider, apiKey);
        if (res.success) {
            toast.success(`${provider === 'google' ? 'Google AI' : 'OpenAI'} connection successful!`);
        } else {
            toast.error(`Connection failed: ${res.error}`);
        }
        setIsTesting(false);
    };

    return (
        <button
            onClick={handleTest}
            disabled={isTesting || !apiKey}
            className={cn(
                "px-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border transition-all",
                isTesting
                    ? "bg-zinc-100 text-zinc-400 border-zinc-200"
                    : "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50"
            )}
        >
            {isTesting ? "Testing..." : "Test"}
        </button>
    );
}
