"use client";

import { useEffect, useState } from "react";
import {
    getSubscriptionPlansAction,
    createSubscriptionPlanAction,
    updateSubscriptionPlanAction,
    deleteSubscriptionPlanAction,
    getSubscriptionStatsAction
} from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { getSystemSettingsAction } from "@/app/actions/settings-actions";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import {
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle,
    Loader2,
    Ticket,
    ShieldCheck,
    Zap,
    Crown,
    Settings,
    Users,
    HardDrive,
    MessageSquare,
    Box,
    Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionManagementPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [currency, setCurrency] = useState("INR");
    const [stats, setStats] = useState({
        totalMRR: 0,
        activeTenants: 0,
        trialTenants: 0,
        churnRate: 0
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    // Initial form state
    const initialForm = {
        name: "",
        slug: "",
        price: 0,
        description: "",
        tier: "free" as any,
        features: "",
        maxStudents: 0,
        maxStaff: 0,
        maxStorageGB: 0,
        supportLevel: "community" as any,
        includedModules: [] as string[]
    };

    // Form State
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const [plansRes, settingsRes, statsRes] = await Promise.all([
                getSubscriptionPlansAction(),
                getSystemSettingsAction(),
                getSubscriptionStatsAction()
            ]);
            setPlans(plansRes);
            if (settingsRes.success && settingsRes.data) {
                setCurrency(settingsRes.data.currency);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData(initialForm);
        setIsCreating(true);
    };

    const openEditModal = (plan: SubscriptionPlan) => {
        setEditingId(plan.id);
        setFormData({
            name: plan.name,
            slug: plan.slug,
            price: plan.price,
            description: plan.description || "",
            tier: plan.tier,
            features: plan.features.join(", "),
            maxStudents: plan.limits.maxStudents,
            maxStaff: plan.limits.maxStaff,
            maxStorageGB: plan.limits.maxStorageGB,
            supportLevel: plan.supportLevel,
            includedModules: plan.includedModules || []
        });
        setIsCreating(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                price: Number(formData.price),
                currency: currency,
                billingPeriod: "monthly" as const,
                description: formData.description,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                limits: {
                    maxStudents: Number(formData.maxStudents),
                    maxStaff: Number(formData.maxStaff),
                    maxStorageGB: Number(formData.maxStorageGB)
                },
                isActive: true,
                tier: formData.tier,
                supportLevel: formData.supportLevel,
                includedModules: formData.includedModules
            };

            let res: any;
            if (editingId) {
                res = await updateSubscriptionPlanAction(editingId, payload);
            } else {
                res = await createSubscriptionPlanAction(payload);
            }

            if (res.success) {
                setIsCreating(false);
                setFormData(initialForm);
                loadPlans();
            } else {
                alert(res.error || "Failed to save plan");
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        try {
            await deleteSubscriptionPlanAction(id);
            loadPlans();
        } catch (error) {
            console.error(error);
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "free": return <Ticket className="h-5 w-5 text-zinc-500" />;
            case "basic": return <ShieldCheck className="h-5 w-5 text-blue-500" />;
            case "premium": return <Zap className="h-5 w-5 text-amber-500" />;
            case "enterprise": return <Crown className="h-5 w-5 text-purple-600" />;
            default: return <Ticket className="h-5 w-5" />;
        }
    };

    const formatPrice = (price: number) => {
        if (price === 0) return "Free";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900">BILLING <span className="text-blue-600">CONSOLE</span></h1>
                    <p className="text-zinc-500 font-medium mt-1">Real-time revenue metrics and plan management.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Create New Plan
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total MRR", value: formatPrice(stats.totalMRR), icon: Coins, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Tenants", value: stats.activeTenants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Free Trials", value: stats.trialTenants, icon: Ticket, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Avg Churn", value: `${stats.churnRate}%`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-2xl shrink-0", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100 uppercase tracking-wider">Live</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-zinc-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col group hover:border-blue-200 hover:shadow-md transition-all">
                            {plan.isPopular && (
                                <div className="bg-blue-600 text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <div className="p-6 flex-1 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                                        {getTierIcon(plan.tier)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-end mr-2">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase leading-none">Subscribers</span>
                                            <span className="text-xs font-black text-zinc-900">{(plan as any).activeSubscribers || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900">{plan.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{plan.description}</p>
                                </div>

                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-extrabold text-zinc-900">
                                        {formatPrice(plan.price)}
                                    </span>
                                    {plan.price > 0 && <span className="text-sm font-medium text-zinc-400 mb-1">/mo</span>}
                                </div>

                                {/* Limits Grid */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100">
                                    <div className="text-center space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400">Students</div>
                                        <div className="font-bold text-zinc-900 text-sm flex items-center justify-center gap-1">
                                            <Users className="h-3 w-3 text-zinc-400" /> {plan.limits.maxStudents}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1 border-l border-zinc-100">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400">Staff</div>
                                        <div className="font-bold text-zinc-900 text-sm flex items-center justify-center gap-1">
                                            <ShieldCheck className="h-3 w-3 text-zinc-400" /> {plan.limits.maxStaff}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-1 border-l border-zinc-100">
                                        <div className="text-[10px] uppercase font-bold text-zinc-400">Storage</div>
                                        <div className="font-bold text-zinc-900 text-sm flex items-center justify-center gap-1">
                                            <HardDrive className="h-3 w-3 text-zinc-400" /> {plan.limits.maxStorageGB}GB
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Included Modules</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(plan.includedModules || []).slice(0, 6).map(m => (
                                            <span key={m} className="px-2 py-1 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200 capitalize">
                                                {m}
                                            </span>
                                        ))}
                                        {(plan.includedModules?.length || 0) > 6 && (
                                            <span className="px-2 py-1 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200">
                                                +{(plan.includedModules?.length || 0) - 6}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-zinc-900">{editingId ? 'Edit Subscription Plan' : 'New Subscription Plan'}</h3>
                            <button onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-zinc-900">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Basic Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Plan Name</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                            placeholder="e.g. Starter"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Tier Type</label>
                                        <select
                                            value={formData.tier}
                                            onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        >
                                            <option value="free">Free Tier</option>
                                            <option value="basic">Basic</option>
                                            <option value="premium">Premium</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Price (Monthly {currency})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Support Level</label>
                                        <select
                                            value={formData.supportLevel}
                                            onChange={e => setFormData({ ...formData, supportLevel: e.target.value as any })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        >
                                            <option value="community">Community / Self-Serve</option>
                                            <option value="email">Email Support</option>
                                            <option value="priority">Priority 24/7</option>
                                            <option value="dedicated">Dedicated Manager</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        placeholder="Brief summary..."
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-zinc-100" />

                            {/* Limits */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                                    <Box className="h-4 w-4" /> Resource Limits
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Max Students</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.maxStudents}
                                            onChange={e => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Max Staff</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.maxStaff}
                                            onChange={e => setFormData({ ...formData, maxStaff: Number(e.target.value) })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Storage (GB)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.maxStorageGB}
                                            onChange={e => setFormData({ ...formData, maxStorageGB: Number(e.target.value) })}
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-100" />

                            {/* Modules */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Enabled Modules
                                </h4>

                                <div className="space-y-6">
                                    {(Object.keys(MODULE_CATEGORIES) as Array<keyof typeof MODULE_CATEGORIES>).map(catKey => {
                                        const categoryModules = ALL_MODULES.filter(m => m.category === catKey);
                                        if (categoryModules.length === 0) return null;

                                        return (
                                            <div key={catKey} className="space-y-2">
                                                <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{MODULE_CATEGORIES[catKey]}</h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {categoryModules.map(mod => (
                                                        <label key={mod.id} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors group">
                                                            <div className={cn(
                                                                "mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                                                formData.includedModules.includes(mod.id) ? "bg-blue-600 border-blue-600" : "border-zinc-300 bg-white group-hover:border-zinc-400"
                                                            )}>
                                                                {formData.includedModules.includes(mod.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={formData.includedModules.includes(mod.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setFormData(p => ({ ...p, includedModules: [...p.includedModules, mod.id] }));
                                                                    else setFormData(p => ({ ...p, includedModules: p.includedModules.filter(x => x !== mod.id) }));
                                                                }}
                                                            />
                                                            <div className="space-y-0.5">
                                                                <span className="text-xs font-bold text-zinc-700 block">{mod.label}</span>
                                                                <span className="text-[10px] text-zinc-400 block leading-snug">{mod.description}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Marketing Features (Display only)</label>
                                <textarea
                                    rows={2}
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="Comma separated list for pricing card display..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-zinc-100 py-4 -mx-6 px-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                                >
                                    {editingId ? 'Save Changes' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
