"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getSubscriptionPlansAction,
    createSubscriptionPlanAction,
    updateSubscriptionPlanAction,
    deleteSubscriptionPlanAction,
    getSubscriptionStatsAction,
    reorderSubscriptionPlansAction
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
    Box,
    Coins,
    GripVertical,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

// DnD Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Row Component
function SortableRow({ plan, currency, onEdit, onDelete }: { plan: SubscriptionPlan, currency: string, onEdit: (p: SubscriptionPlan) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: plan.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' as const : undefined,
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
        <tr ref={setNodeRef} style={style} className={cn("group border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors", isDragging && "bg-white shadow-lg border-zinc-200")}>
            <td className="pl-4 py-3 w-10">
                <button {...attributes} {...listeners} className="cursor-grab hover:text-zinc-900 text-zinc-300 active:cursor-grabbing">
                    <GripVertical className="h-4 w-4" />
                </button>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-zinc-50 border border-zinc-100",
                        plan.tier === 'premium' ? 'text-amber-500' :
                            plan.tier === 'enterprise' ? 'text-purple-500' :
                                plan.tier === 'basic' ? 'text-blue-500' : 'text-zinc-500'
                    )}>
                        {plan.tier === 'premium' ? <Zap className="h-4 w-4" /> :
                            plan.tier === 'enterprise' ? <Crown className="h-4 w-4" /> :
                                plan.tier === 'basic' ? <ShieldCheck className="h-4 w-4" /> :
                                    <Ticket className="h-4 w-4" />}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-zinc-900">{plan.name}</div>
                        {plan.isPopular && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Popular</span>}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="font-bold text-sm text-zinc-900">{formatPrice(plan.price)}</div>
                <div className="text-xs text-zinc-400 capitalize">{plan.billingPeriod}</div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
                    <div className="flex items-center gap-1.5" title="Max Students">
                        <Users className="h-3.5 w-3.5 text-zinc-300" />
                        {plan.limits.maxStudents}
                    </div>
                    <div className="flex items-center gap-1.5" title="Max Staff">
                        <ShieldCheck className="h-3.5 w-3.5 text-zinc-300" />
                        {plan.limits.maxStaff}
                    </div>
                    <div className="flex items-center gap-1.5" title="Storage">
                        <HardDrive className="h-3.5 w-3.5 text-zinc-300" />
                        {plan.limits.maxStorageGB}GB
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {(plan.includedModules || []).slice(0, 3).map(m => (
                        <span key={m} className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 capitalize truncate max-w-[80px]">
                            {ALL_MODULES.find(mod => mod.id === m)?.label || m}
                        </span>
                    ))}
                    {(plan.includedModules?.length || 0) > 3 && (
                        <span className="bg-zinc-100 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded border border-zinc-200">
                            +{(plan.includedModules?.length || 0) - 3}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    plan.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-100"
                )}>
                    {plan.isActive ? "Active" : "Inactive"}
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(plan)} className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(plan.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

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

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPlans((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Optimistic update
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    sortOrder: index
                }));

                // Call server action in background
                reorderSubscriptionPlansAction(updates).catch(console.error);

                return newItems;
            });
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
                <Link
                    href="/admin/subscriptions/new"
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Create New Plan
                </Link>
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
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                            <Box className="h-4 w-4 text-zinc-400" />
                            Manage Plans
                        </h3>
                        <span className="text-xs font-medium text-zinc-400">Drag to reorder public pricing page</span>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="pl-4 py-3 w-10"></th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Plan Name</th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Pricing</th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Limits</th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Modules</th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext
                                    items={plans.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {plans.map((plan) => (
                                        <SortableRow
                                            key={plan.id}
                                            plan={plan}
                                            currency={currency}
                                            onEdit={openEditModal}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
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
