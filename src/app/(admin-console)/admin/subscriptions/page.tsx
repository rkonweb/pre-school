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
function SortableRow({ plan, currency, onDelete }: { plan: SubscriptionPlan, currency: string, onDelete: (id: string) => void }) {
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
                    <div className="flex items-center gap-1.5" title="Total Users (Students + Staff)">
                        <Users className="h-3.5 w-3.5 text-zinc-300" />
                        {(plan.limits.maxStudents || 0) + (plan.limits.maxStaff || 0)}
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
                    <Link
                        href={`/admin/subscriptions/${plan.id}/edit`}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Link>
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
    const [currency, setCurrency] = useState("INR");
    const [stats, setStats] = useState({
        totalMRR: 0,
        activeTenants: 0,
        trialTenants: 0,
        churnRate: 0
    });

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
        try {
            const res = await deleteSubscriptionPlanAction(id);
            if (res.success) {
                loadPlans();
            } else {
                alert(res.error || "Failed to delete plan");
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
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
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-all active:scale-95"
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
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

