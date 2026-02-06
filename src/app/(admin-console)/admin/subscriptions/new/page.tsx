"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Settings,
    Box,
    Globe,
    ShieldCheck,
    Zap,
    Crown,
    Ticket,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSubscriptionPlanAction } from "@/app/actions/subscription-actions";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { toast } from "sonner";

export default function NewSubscriptionPlanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price: 0,
        description: "",
        tier: "basic" as "free" | "basic" | "premium" | "enterprise",
        features: "",
        maxStudents: 0,
        maxStaff: 0,
        maxStorageGB: 0,
        supportLevel: "email" as "community" | "email" | "priority" | "dedicated",
        includedModules: [] as string[],
        currency: "INR" // Default
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
                price: Number(formData.price),
                currency: formData.currency,
                billingPeriod: "monthly" as const,
                description: formData.description,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                limits: {
                    maxStudents: Number(formData.maxStudents),
                    maxStaff: Number(formData.maxStaff),
                    maxStorageGB: Number(formData.maxStorageGB)
                },
                isActive: true, // Default to active
                tier: formData.tier,
                supportLevel: formData.supportLevel,
                includedModules: formData.includedModules,
                sortOrder: 0
            };

            const res = await createSubscriptionPlanAction(payload);

            if (res.success) {
                toast.success("Plan created successfully");
                router.push("/admin/subscriptions");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to create plan");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
            setLoading(false);
        }
    };

    const toggleModule = (id: string) => {
        setFormData(prev => {
            const modules = prev.includedModules.includes(id)
                ? prev.includedModules.filter(m => m !== id)
                : [...prev.includedModules, id];
            return { ...prev, includedModules: modules };
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/subscriptions" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900">Create Subscription Plan</h1>
                            <p className="text-xs text-zinc-500 font-medium">Define pricing, limits, and module access.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/subscriptions"
                            className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Publish Plan
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10 space-y-10 animate-in slide-in-from-bottom-8 duration-500">

                {/* Identity Section */}
                <section className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Crown className="h-5 w-5 text-amber-500" /> Plan Identity
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Basic appearance and tier classification.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Plan Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-bold text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:font-normal"
                                    placeholder="e.g. Growth"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                    placeholder="Brief value proposition..."
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Tier Level</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['free', 'basic', 'premium', 'enterprise'] as const).map(tier => (
                                        <div
                                            key={tier}
                                            onClick={() => setFormData({ ...formData, tier })}
                                            className={cn(
                                                "cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all",
                                                formData.tier === tier
                                                    ? "bg-blue-50 border-blue-600 text-blue-700"
                                                    : "bg-white border-zinc-100 hover:border-zinc-200 text-zinc-500"
                                            )}
                                        >
                                            {tier === 'premium' ? <Zap className="h-4 w-4" /> :
                                                tier === 'enterprise' ? <Crown className="h-4 w-4" /> :
                                                    tier === 'basic' ? <ShieldCheck className="h-4 w-4" /> :
                                                        <Ticket className="h-4 w-4" />}
                                            <span className="text-xs font-bold capitalize">{tier}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing & Limits */}
                <section className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Box className="h-5 w-5 text-blue-600" /> Limits & Pricing
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Resource quotas and monthly costs.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Monthly Price</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                                        {formData.currency === 'INR' ? '₹' : '$'}
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-8 pr-3 font-bold text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <select
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                            className="text-xs font-bold text-zinc-500 bg-transparent outline-none cursor-pointer hover:text-zinc-900 uppercase"
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Support Level</label>
                                <select
                                    value={formData.supportLevel}
                                    onChange={e => setFormData({ ...formData, supportLevel: e.target.value as any })}
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                >
                                    <option value="community">Community / Self-Serve</option>
                                    <option value="email">Email Support</option>
                                    <option value="priority">Priority 24/7</option>
                                    <option value="dedicated">Dedicated Manager</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-100">
                            <div className="text-center space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase">Students</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.maxStudents}
                                    onChange={e => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                                    className="w-full text-center rounded-xl border-zinc-200 bg-zinc-50 p-3 font-bold text-xl text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase">Staff</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.maxStaff}
                                    onChange={e => setFormData({ ...formData, maxStaff: Number(e.target.value) })}
                                    className="w-full text-center rounded-xl border-zinc-200 bg-zinc-50 p-3 font-bold text-xl text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase">Storage (GB)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.maxStorageGB}
                                    onChange={e => setFormData({ ...formData, maxStorageGB: Number(e.target.value) })}
                                    className="w-full text-center rounded-xl border-zinc-200 bg-zinc-50 p-3 font-bold text-xl text-zinc-900 focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modules */}
                <section className="space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Settings className="h-5 w-5 text-zinc-900" /> Module Access
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">Select the functional modules included in this plan.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {(Object.keys(MODULE_CATEGORIES) as Array<keyof typeof MODULE_CATEGORIES>).map(catKey => {
                            const categoryModules = ALL_MODULES.filter(m => m.category === catKey);
                            if (categoryModules.length === 0) return null;

                            return (
                                <div key={catKey} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                                    <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{MODULE_CATEGORIES[catKey]}</h5>
                                    <div className="space-y-2">
                                        {categoryModules.map(mod => {
                                            const isSelected = formData.includedModules.includes(mod.id);
                                            return (
                                                <div
                                                    key={mod.id}
                                                    onClick={() => toggleModule(mod.id)}
                                                    className={cn(
                                                        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all group",
                                                        isSelected ? "bg-blue-50/50 border-blue-200" : "bg-white border-zinc-100 hover:border-zinc-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                                        isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-zinc-200 group-hover:border-zinc-300"
                                                    )}>
                                                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className={cn("text-sm font-bold block", isSelected ? "text-blue-900" : "text-zinc-700")}>{mod.label}</span>
                                                        <span className="text-[10px] text-zinc-400 block leading-snug">{mod.description}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Marketing Features */}
                <section className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Marketing Checklist items</label>
                            <textarea
                                rows={3}
                                value={formData.features}
                                onChange={e => setFormData({ ...formData, features: e.target.value })}
                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="Comma separated list (e.g. Free Domain, 24/7 Support, Daily Backups)..."
                            />
                            <p className="text-[10px] text-zinc-400">These items appear as checkmarks on the public pricing page.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
