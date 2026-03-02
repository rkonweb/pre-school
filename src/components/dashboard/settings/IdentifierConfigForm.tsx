"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Hash, Type, PlusCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { updateIdentifierConfigAction, IdentifierType } from "@/app/actions/identifier-actions";

interface IdentifierConfig {
    prefix: string;
    suffix: string;
    padding: number;
    nextNumber: number;
}

interface Props {
    slug: string;
    initialConfigs: Record<IdentifierType, IdentifierConfig>;
}

export function IdentifierConfigForm({ slug, initialConfigs }: Props) {
    const [configs, setConfigs] = useState(initialConfigs);
    const [isSaving, setIsSaving] = useState<IdentifierType | null>(null);

    const handleUpdate = async (type: IdentifierType) => {
        setIsSaving(type);
        try {
            const res = await updateIdentifierConfigAction(slug, type, configs[type]);
            if (res.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} format updated.`);
            } else {
                toast.error(res.error || "Failed to update.");
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSaving(null);
        }
    };

    const renderPreview = (type: IdentifierType) => {
        const config = configs[type];
        const numStr = String(config.nextNumber).padStart(config.padding, '0');
        return `${config.prefix}${numStr}${config.suffix}`;
    };

    const ConfigCard = ({ type, title, description }: { type: IdentifierType, title: string, description: string }) => (
        <div className="group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none">
            <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{description}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                        {renderPreview(type)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <Type className="h-3 w-3" /> Prefix
                        </label>
                        <input
                            type="text"
                            value={configs[type].prefix}
                            onChange={(e) => setConfigs({ ...configs, [type]: { ...configs[type], prefix: e.target.value } })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                            placeholder="e.g. INV-"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <Type className="h-3 w-3" /> Suffix
                        </label>
                        <input
                            type="text"
                            value={configs[type].suffix}
                            onChange={(e) => setConfigs({ ...configs, [type]: { ...configs[type], suffix: e.target.value } })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                            placeholder="e.g. /24"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <Hash className="h-3 w-3" /> Start Number
                        </label>
                        <input
                            type="number"
                            value={configs[type].nextNumber}
                            onChange={(e) => setConfigs({ ...configs, [type]: { ...configs[type], nextNumber: parseInt(e.target.value) || 1 } })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3" /> Minimum Digits
                        </label>
                        <select
                            value={configs[type].padding}
                            onChange={(e) => setConfigs({ ...configs, [type]: { ...configs[type], padding: parseInt(e.target.value) } })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                        >
                            <option value={1}>No Padding (1)</option>
                            <option value={2}>2 Digits (01)</option>
                            <option value={3}>3 Digits (001)</option>
                            <option value={4}>4 Digits (0001)</option>
                            <option value={5}>5 Digits (00001)</option>
                            <option value={6}>6 Digits (000001)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Auto-increments on generation
                </div>
                <button
                    onClick={() => handleUpdate(type)}
                    disabled={isSaving === type}
                    className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving === type ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Save className="h-3.5 w-3.5" />
                    )}
                    Save
                </button>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConfigCard
                type="invoice"
                title="Invoice Numbers"
                description="Custom format for fee invoices and receipts."
            />
            <ConfigCard
                type="admission"
                title="Admission Numbers"
                description="Formats for students during the final admission phase."
            />
            <ConfigCard
                type="enquiry"
                title="Enquiry Numbers"
                description="Unique identifiers for initial lead inquiries."
            />
            <ConfigCard
                type="enrollment"
                title="Enrollment Numbers"
                description="Used for tracking students during registration."
            />
        </div>
    );
}
