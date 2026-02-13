"use client";

import { useState, useEffect } from "react";
import {
    Save,
    RefreshCw,
    Sliders,
    Loader2,
    Moon,
    Zap,
    Clock,
    Plus,
    Trash2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIInsightsChart } from "@/components/dashboard/ai/AIInsightsChart";
import { getAISettingsAction, updateAISettingsAction, getAIDistributionPreviewAction } from "@/app/actions/admission-actions";
import { getAutomationRulesAction, saveAutomationRuleAction } from "@/app/actions/automation-rule-actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AISettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // AI Settings State
    const [settings, setSettings] = useState<any>({
        weights: {
            responsiveness: 30,
            programInterest: 25,
            location: 15,
            budget: 20,
            engagement: 10
        },
        automationRules: {
            autoPauseDays: 7,
            highIntentThreshold: 80
        },
        globalAutomationEnabled: true,
        quietHours: { start: "20:00", end: "09:00" }
    });

    // Automation Rules (Policies) State
    const [automationPolicies, setAutomationPolicies] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<any[]>([]);

    const fetchAllData = async () => {
        setIsLoading(true);
        const [settingsRes, rulesRes] = await Promise.all([
            getAISettingsAction(slug),
            getAutomationRulesAction(slug)
        ]);

        if (settingsRes.success && settingsRes.settings) {
            setSettings(settingsRes.settings);
        }
        if (rulesRes.success) {
            setAutomationPolicies(rulesRes.rules || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [slug]);

    // Debounced Simulation using useEffect
    useEffect(() => {
        const timer = setTimeout(async () => {
            const res = await getAIDistributionPreviewAction(slug, settings.weights);
            if (res.success) {
                setDistribution(res.distribution || []);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, settings.weights]);

    const handleWeightChange = (key: string, value: number) => {
        setSettings((prev: any) => ({
            ...prev,
            weights: { ...prev.weights, [key]: value }
        }));
    };

    const handleSaveSettings = async () => {
        const totalWeight = Object.values(settings.weights).reduce((a: any, b: any) => a + b, 0) as number;
        if (totalWeight !== 100) {
            toast.error("Total weight must equal 100%");
            return;
        }

        setIsSaving(true);
        const res = await updateAISettingsAction(slug, settings);
        if (res.success) {
            toast.success("AI Configuration saved successfully");
            fetchAllData();
        } else {
            toast.error(res.error || "Failed to save settings");
        }
        setIsSaving(false);
    };

    const handleSavePolicy = async (policy: any) => {
        const res = await saveAutomationRuleAction(slug, policy);
        if (res.success) {
            toast.success(`${policy.scoreBand} Policy updated`);
            fetchAllData();
        } else {
            toast.error(res.error);
        }
    };

    const totalWeight = Object.values(settings.weights).reduce((a: any, b: any) => a + b, 0) as number;

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-zinc-300 animate-spin" />
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Hydrating AI Context...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-brand" />
                        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">AI Engine Config</h1>
                    </div>
                    <p className="text-sm font-bold text-zinc-400">Calibrate scoring matrices and autonomous engagement policies.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "px-4 py-2 rounded-2xl border flex items-center gap-3 transition-all",
                        settings.globalAutomationEnabled ? "bg-brand/10 border-brand/20" : "bg-zinc-100 border-zinc-200"
                    )}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Automation</p>
                        <button
                            onClick={() => setSettings((prev: any) => ({ ...prev, globalAutomationEnabled: !prev.globalAutomationEnabled }))}
                            className={cn(
                                "h-6 w-12 rounded-full relative transition-all",
                                settings.globalAutomationEnabled ? "bg-brand shadow-lg shadow-brand/20" : "bg-zinc-300"
                            )}
                        >
                            <div className={cn(
                                "h-4 w-4 rounded-full bg-white absolute top-1 transition-all",
                                settings.globalAutomationEnabled ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="h-12 px-8 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-zinc-900/20"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Commit Changes
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Scoring Matrices */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white rounded-[40px] border border-zinc-200 p-10 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-14 w-14 rounded-[20px] bg-zinc-100 flex items-center justify-center text-zinc-600">
                                <Sliders className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Scoring Matrix</h3>
                                <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Adjust propensity factor weighting</p>
                            </div>
                        </div>

                        <div className="grid gap-10 md:grid-cols-2">
                            <div className="space-y-8">
                                {Object.entries(settings.weights).map(([key, value]: [string, any]) => (
                                    <div key={key} className="space-y-3 group">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-brand transition-colors">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="text-xs font-black text-zinc-900">{value}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="5"
                                            value={value}
                                            onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                                            className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-brand"
                                        />
                                    </div>
                                ))}

                                <div className="pt-8 border-t border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            totalWeight === 100 ? "bg-green-500 animate-pulse" : "bg-red-500"
                                        )} />
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Weighting</span>
                                    </div>
                                    <span className={cn(
                                        "text-xl font-black",
                                        totalWeight === 100 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {totalWeight}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100 flex flex-col items-center justify-center text-center">
                                <AIInsightsChart distribution={distribution} />
                                <p className="text-[10px] font-bold text-zinc-400 mt-6 max-w-[240px] italic">
                                    Real-time simulation of lead distribution based on your current factoring.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Automation Policies */}
                    <div className="bg-white rounded-[40px] border border-zinc-200 p-10 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-14 w-14 rounded-[20px] bg-brand/10 flex items-center justify-center text-brand">
                                <Zap className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Nurture Policies</h3>
                                <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Autonomous engagement by score band</p>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {["HOT", "WARM", "COOL", "COLD"].map(band => {
                                const policy = automationPolicies.find(p => p.scoreBand === band) || {
                                    scoreBand: band,
                                    frequency: 24,
                                    maxMessages: 5
                                };
                                return (
                                    <div key={band} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shadow-sm",
                                                band === "HOT" ? "bg-red-500 text-white" :
                                                    band === "WARM" ? "bg-orange-500 text-white" :
                                                        band === "COOL" ? "bg-blue-500 text-white" :
                                                            "bg-zinc-400 text-white"
                                            )}>
                                                {band} Band
                                            </span>
                                            <CheckCircle2 className="h-4 w-4 text-green-500 opacity-50" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Frequency (Hrs)</label>
                                            <input
                                                type="number"
                                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-brand"
                                                value={policy.frequency}
                                                onChange={(e) => {
                                                    const updated = [...automationPolicies];
                                                    const idx = updated.findIndex(p => p.scoreBand === band);
                                                    if (idx >= 0) updated[idx].frequency = parseInt(e.target.value);
                                                    else updated.push({ ...policy, frequency: parseInt(e.target.value) });
                                                    setAutomationPolicies(updated);
                                                }}
                                                onBlur={() => handleSavePolicy(policy)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Limit (Msgs)</label>
                                            <input
                                                type="number"
                                                className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-brand"
                                                value={policy.maxMessages}
                                                onChange={(e) => {
                                                    const updated = [...automationPolicies];
                                                    const idx = updated.findIndex(p => p.scoreBand === band);
                                                    if (idx >= 0) updated[idx].maxMessages = parseInt(e.target.value);
                                                    else updated.push({ ...policy, maxMessages: parseInt(e.target.value) });
                                                    setAutomationPolicies(updated);
                                                }}
                                                onBlur={() => handleSavePolicy(policy)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Automation Rules & Guardrails */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-white rounded-[40px] border border-zinc-200 p-10 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-[18px] bg-zinc-900 text-white flex items-center justify-center">
                                <Moon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Quiet Hours</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Pause Windows</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Window Start</label>
                                <input
                                    type="time"
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-brand"
                                    value={settings.quietHours.start}
                                    onChange={(e) => setSettings((prev: any) => ({ ...prev, quietHours: { ...prev.quietHours, start: e.target.value } }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Window End</label>
                                <input
                                    type="time"
                                    className="w-full h-12 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-brand"
                                    value={settings.quietHours.end}
                                    onChange={(e) => setSettings((prev: any) => ({ ...prev, quietHours: { ...prev.quietHours, end: e.target.value } }))}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-brand/5 border border-brand/10">
                            <Clock className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                            <p className="text-[10px] text-brand/80 font-bold leading-relaxed italics">
                                During these hours, AI will queue messages but will not transmit them to parents.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-zinc-200 p-10 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-[18px] bg-brand text-white flex items-center justify-center">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Guardrails</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Operational Limits</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-zinc-500">Auto-Pause (Days)</span>
                                    <span className="font-black text-zinc-900">{settings.automationRules.autoPauseDays} Days</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={settings.automationRules.autoPauseDays}
                                    onChange={(e) => setSettings((prev: any) => ({
                                        ...prev,
                                        automationRules: { ...prev.automationRules, autoPauseDays: parseInt(e.target.value) }
                                    }))}
                                    className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-zinc-500">High Intent Threshold</span>
                                    <span className="font-black text-zinc-900">{settings.automationRules.highIntentThreshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="95"
                                    step="5"
                                    value={settings.automationRules.highIntentThreshold}
                                    onChange={(e) => setSettings((prev: any) => ({
                                        ...prev,
                                        automationRules: { ...prev.automationRules, highIntentThreshold: parseInt(e.target.value) }
                                    }))}
                                    className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer accent-zinc-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

