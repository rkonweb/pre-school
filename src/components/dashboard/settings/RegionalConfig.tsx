"use client";

import { useState } from "react";
import {
    Globe,
    CreditCard,
    Calendar,
    Clock,
    Save,
    Loader2,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RegionalConfigProps {
    slug: string;
    initialData: any;
}

export function RegionalConfig({ slug, initialData }: RegionalConfigProps) {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateSchoolProfileAction(slug, formData);
        if (res.success) {
            toast.success("Operational configuration updated");
        } else {
            toast.error(res.error || "Failed to update config");
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-6xl space-y-10 animate-in fade-in duration-700">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-50 rounded-2xl flex items-center justify-center">
                            <Globe className="h-5 w-5" style={{ color: 'var(--brand-color)' }} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">Regional & Operational Config</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Functional Currency</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <select
                                    value={formData.currency || "USD"}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 font-black focus:ring-2 focus:ring-blue-600 transition-all appearance-none uppercase"
                                >
                                    <option value="USD">USD ($) - US Dollar</option>
                                    <option value="INR">INR (₹) - Indian Rupee</option>
                                    <option value="EUR">EUR (€) - Euro</option>
                                    <option value="GBP">GBP (£) - British Pound</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 flex-1">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Date Format Strategy</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <select
                                    value={formData.dateFormat || "MM/DD/YYYY"}
                                    onChange={e => setFormData({ ...formData, dateFormat: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 font-black focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY (USA)</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">System Timezone</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <select
                                    value={formData.timezone || "UTC-5 (EST)"}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 font-black focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
                                >
                                    <option>UTC-8 (PST) - Pacific Time</option>
                                    <option>UTC-5 (EST) - Eastern Time</option>
                                    <option>UTC+0 (GMT) - Universal Time</option>
                                    <option>UTC+1 (CET) - Central European</option>
                                    <option>UTC+5:30 (IST) - India Standard</option>
                                    <option>UTC+8 (SGT) - Singapore Time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="text-white px-10 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-xl disabled:opacity-50"
                            style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 20px 25px -5px rgba(var(--brand-color-rgb, 0, 0, 0), 0.1), 0 8px 10px -6px rgba(var(--brand-color-rgb, 0, 0, 0), 0.1)' }}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Update Operations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
