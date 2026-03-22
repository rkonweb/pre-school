'use client';

import React, { useEffect, useState } from 'react';
import {
    Loader2, Save, RotateCcw, CheckCircle2, Users, HardDrive,
    Coins, Ticket, Zap, Crown, ShieldCheck, Star,
    BookOpen, Settings, MessageSquare, Briefcase, ChevronDown, ChevronRight, Building2,
    CalendarClock, Info
} from 'lucide-react';
import {
    getSubscriptionPlansAction,
    updateSubscriptionPlanAction,
    getSubscriptionStatsAction,
    getTrialDaysAction,
    updateTrialDaysAction,
} from '@/app/actions/subscription-actions';
import { ALL_MODULES } from '@/config/modules';
import type { SubscriptionPlan } from '@/types/subscription';

// ── Category icons & order ─────────────────────────────────────────
const CAT_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    core:           { label: 'Core Platform',                 icon: Settings,      color: 'text-indigo-600' },
    academic:       { label: 'Academic Tools',                icon: BookOpen,      color: 'text-sky-600' },
    administrative: { label: 'Administrative Efficiency',     icon: Briefcase,     color: 'text-violet-600' },
    facilities:     { label: 'Campus Facilities',             icon: Building2,     color: 'text-amber-600' },
    communication:  { label: 'Communication & Engagement',    icon: MessageSquare, color: 'text-emerald-600' },
};
const CAT_ORDER: (keyof typeof CAT_META)[] = ['core', 'academic', 'administrative', 'facilities', 'communication'];

// ── Tier styling (use inline CSS for gradients – Tailwind JIT can't scan dynamic strings) ─────
// All ring/badge classes are COMPLETE strings so Tailwind JIT detects them.
const TIER_META: Record<string, {
    icon: React.ElementType;
    bg: string;          // inline CSS gradient
    badge: string;       // complete Tailwind classes
    ring: string;        // complete Tailwind ring class
    dark: boolean;       // enterprise = dark card
}> = {
    free:       { icon: Ticket,      bg: 'linear-gradient(to bottom, #f4f4f5, #e4e4e7)',   badge: 'bg-zinc-100 text-zinc-600',  ring: 'ring-zinc-200',  dark: false },
    basic:      { icon: ShieldCheck, bg: 'linear-gradient(to bottom, #eff6ff, #dbeafe)',   badge: 'bg-blue-100 text-blue-700',  ring: 'ring-blue-200',  dark: false },
    premium:    { icon: Zap,         bg: 'linear-gradient(to bottom, #dbeafe, #bfdbfe)',   badge: 'bg-blue-600 text-white',     ring: 'ring-blue-300',  dark: false },
    enterprise: { icon: Crown,       bg: 'linear-gradient(to bottom, #27272a, #18181b)',   badge: 'bg-zinc-700 text-zinc-100',  ring: 'ring-zinc-700',  dark: true  },
};

// ── Toggle ─────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            title={enabled ? 'Enabled · click to disable' : 'Disabled · click to enable'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${enabled ? 'bg-blue-600' : 'bg-zinc-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    );
}

// ── Number input ───────────────────────────────────────────────────
function NumberInput({
    value, onChange, prefix, suffix, min = 0
}: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; min?: number }) {
    return (
        <div className="flex items-center justify-center gap-1 text-sm">
            {prefix && <span className="text-zinc-400 font-medium text-xs">{prefix}</span>}
            <input
                type="number"
                min={min}
                value={value}
                aria-label={suffix ?? prefix ?? "Number input"}
                onChange={e => onChange(Math.max(min, Number(e.target.value)))}
                className="w-20 text-center font-bold text-zinc-800 border border-zinc-200 rounded-lg py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-sm"
            />
            {suffix && <span className="text-zinc-400 font-medium text-xs">{suffix}</span>}
        </div>
    );
}

// ── Unsaved badge ──────────────────────────────────────────────────
function UnsavedDot() {
    return <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse ml-1.5" title="Unsaved changes" />;
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [draft, setDraft] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [stats, setStats] = useState({ totalMRR: 0, activeTenants: 0, trialTenants: 0 });
    const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

    // ── Free Trial Period (global) ─────────────────────────────────────
    const [trialDays, setTrialDays] = useState<number>(30);
    const [trialDraft, setTrialDraft] = useState<number>(30);
    const [trialSaving, setTrialSaving] = useState(false);
    const [trialSaved, setTrialSaved] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const [plansRes, statsRes, days] = await Promise.all([
            getSubscriptionPlansAction(),
            getSubscriptionStatsAction(),
            getTrialDaysAction(),
        ]);
        const sorted = [...plansRes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setPlans(sorted);
        setDraft(JSON.parse(JSON.stringify(sorted)));
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        setTrialDays(days);
        setTrialDraft(days);
        setLoading(false);
    }

    const trialDirty = trialDraft !== trialDays;

    async function saveTrialDays() {
        setTrialSaving(true);
        const res = await updateTrialDaysAction(trialDraft);
        if (res.success) {
            setTrialDays(trialDraft);
            setTrialSaved(true);
            setTimeout(() => setTrialSaved(false), 2500);
        }
        setTrialSaving(false);
    }

    function isDirty(planId: string) {
        const orig = plans.find(p => p.id === planId);
        const cur = draft.find(p => p.id === planId);
        return JSON.stringify(orig) !== JSON.stringify(cur);
    }

    // Update a single plan's field in draft
    function updateDraft(planId: string, updater: (p: SubscriptionPlan) => SubscriptionPlan) {
        setDraft(prev => prev.map(p => p.id === planId ? updater({ ...p }) : p));
    }

    function toggleModule(planId: string, moduleId: string, enabled: boolean) {
        updateDraft(planId, p => {
            const mods = new Set(p.includedModules || []);
            enabled ? mods.add(moduleId) : mods.delete(moduleId);
            return { ...p, includedModules: Array.from(mods) };
        });
    }

    async function savePlan(planId: string) {
        const p = draft.find(d => d.id === planId);
        if (!p) return;
        setSaving(planId);
        const res = await updateSubscriptionPlanAction(planId, {
            name: p.name,
            description: p.description,
            price: p.price,
            isPopular: p.isPopular,
            isActive: p.isActive,
            supportLevel: p.supportLevel,
            includedModules: p.includedModules,
            limits: p.limits,
            additionalStaffPrice: p.additionalStaffPrice,
        });
        if (res.success) {
            setPlans(prev => prev.map(pl => pl.id === planId ? ({ ...pl, ...p }) : pl));
            setSaved(planId);
            setTimeout(() => setSaved(null), 2500);
        }
        setSaving(null);
    }

    function resetPlan(planId: string) {
        const orig = plans.find(p => p.id === planId);
        if (orig) setDraft(prev => prev.map(p => p.id === planId ? JSON.parse(JSON.stringify(orig)) : p));
    }

    function toggleCat(cat: string) {
        setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
    }

    if (loading) return (
        <div className="flex h-full items-center justify-center min-h-screen bg-zinc-50">
            <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-sm font-medium text-zinc-400">Loading plans…</p>
            </div>
        </div>
    );

    // Group modules by category
    const modulesByCategory = CAT_ORDER.map(cat => ({
        cat,
        modules: ALL_MODULES.filter(m => m.category === cat)
    }));

    const PLAN_WIDTH = 'w-44';

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen bg-zinc-50">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Subscription Plans</h2>
                    <p className="text-zinc-500 font-medium mt-1">Configure modules and pricing for your plans. Changes save per-plan.</p>
                </div>
                {/* Live Stats */}
                <div className="flex items-center gap-4">
                    {[
                        { icon: Coins,  label: 'MRR',    value: `₹${stats.totalMRR.toLocaleString()}`, color: 'text-blue-600' },
                        { icon: Users,  label: 'Active',  value: stats.activeTenants,                   color: 'text-emerald-600' },
                        { icon: Ticket, label: 'Trials',  value: stats.trialTenants,                    color: 'text-amber-600' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-zinc-200 shadow-sm">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <div>
                                <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{label}</div>
                                <div className="text-sm font-black text-zinc-800">{value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Free Trial Period (Global Setting) ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                    <CalendarClock className="h-5 w-5 text-indigo-500" />
                    <div>
                        <div className="font-bold text-zinc-800 text-sm">Free Trial Period</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Applies to all plans — how long a newly signed-up school gets for free before billing starts.</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
                        <Info className="h-3.5 w-3.5" />
                        Common to all plans
                    </div>
                </div>
                <div className="px-6 py-5 flex flex-wrap items-center gap-6">
                    {/* Number input */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-zinc-600 whitespace-nowrap">Trial Duration</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={365}
                                value={trialDraft}
                                onChange={e => setTrialDraft(Math.max(0, Math.min(365, Number(e.target.value))))}
                                title="Free trial days"
                                placeholder="30"
                                className="w-20 text-center font-black text-xl text-zinc-900 border border-zinc-200 rounded-xl py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                            />
                            <span className="text-sm font-semibold text-zinc-500">days</span>
                        </div>
                    </div>

                    {/* Quick-select presets */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-medium">Quick set:</span>
                        {[7, 14, 30, 60].map(d => (
                            <button
                                key={d}
                                onClick={() => setTrialDraft(d)}
                                title={`Set trial to ${d} days`}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    trialDraft === d
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>

                    {/* Save / Reset */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => setTrialDraft(trialDays)}
                            disabled={!trialDirty}
                            title="Reset to saved value"
                            className={`p-2 rounded-lg text-xs transition-all ${
                                trialDirty ? 'bg-zinc-100 hover:bg-red-50 hover:text-red-500 text-zinc-400' : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                            }`}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                            onClick={saveTrialDays}
                            disabled={!trialDirty || trialSaving}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                trialDirty && !trialSaving
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                        >
                            {trialSaving
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : trialSaved
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                : <Save className="h-4 w-4" />}
                            {trialSaved ? 'Saved!' : 'Save Trial Period'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Comparison Table ── */}
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse admin-table-clean">
                            <thead>
                                {/* Plan header cards */}
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left px-5 py-4 w-72">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Feature / Module</span>
                                    </th>
                                    {draft.map(plan => {
                                        const tm = TIER_META[plan.tier] || TIER_META.free;
                                        const Icon = tm.icon;
                                        const dirty = isDirty(plan.id);
                                        return (
                                            <th key={plan.id} className={`${PLAN_WIDTH} px-4 py-4 border-l border-zinc-100`}>
                                                <div className={`rounded-xl p-4 ring-1 ${tm.ring} text-center relative`} style={{ background: tm.bg }}>
                                                    {plan.isPopular && (
                                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                                            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                                <Star className="h-2.5 w-2.5" />Popular
                                                            </span>
                                                        </div>
                                                    )}
                                                    <Icon className={`h-5 w-5 mx-auto mb-1.5 ${plan.tier === 'enterprise' ? 'text-zinc-300' : 'text-zinc-500'}`} />
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={plan.name}
                                                            onChange={e => updateDraft(plan.id, p => ({ ...p, name: e.target.value }))}
                                                            title="Plan name"
                                                            placeholder="Plan name"
                                                            className={`font-black text-base text-center bg-transparent border-0 border-b-2 border-transparent focus:outline-none focus:border-blue-400 transition-colors w-28 ${plan.tier === 'enterprise' ? 'text-white placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-400'}`}
                                                        />
                                                        {dirty && <UnsavedDot />}
                                                    </div>
                                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 capitalize ${tm.badge}`}>{plan.tier}</span>
                                                </div>

                                                {/* Price */}
                                                <div className="mt-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-zinc-400 font-bold text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={plan.price}
                                                            onChange={e => updateDraft(plan.id, p => ({ ...p, price: Number(e.target.value) }))}
                                                            className="w-32 text-center font-black text-2xl text-zinc-900 border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg bg-transparent"
                                                        />
                                                    </div>
                                                    <div className="text-xs text-zinc-400 font-medium">/month</div>
                                                </div>

                                                {/* Save / Reset */}
                                                <div className="mt-3 flex gap-1.5">
                                                    <button
                                                        onClick={() => savePlan(plan.id)}
                                                        disabled={!dirty || saving === plan.id}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all ${dirty && saving !== plan.id ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                                                    >
                                                        {saving === plan.id
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            : saved === plan.id
                                                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                                            : <Save className="h-3.5 w-3.5" />
                                                        }
                                                        {saved === plan.id ? 'Saved!' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => resetPlan(plan.id)}
                                                        disabled={!dirty}
                                                        title="Reset to last saved"
                                                        className={`p-2 rounded-lg text-xs transition-all ${dirty ? 'bg-zinc-100 hover:bg-red-50 hover:text-red-500 text-zinc-400' : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'}`}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>

                                {/* Limits row — combined Users (students + staff) */}
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            <Users className="h-3.5 w-3.5" />
                                            Max Users <span className="font-normal normal-case text-zinc-400">(students + staff)</span>
                                        </div>
                                    </td>
                                    {draft.map(p => (
                                        <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                            <NumberInput
                                                value={p.limits?.maxStudents ?? 0}
                                                onChange={v => updateDraft(p.id, pl => ({
                                                    ...pl,
                                                    limits: { ...pl.limits, maxStudents: v, maxStaff: v }
                                                }))}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-zinc-50 border-b border-zinc-200">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            <HardDrive className="h-3.5 w-3.5" />
                                            Storage <span className="font-normal normal-case text-zinc-400">(GB)</span>
                                        </div>
                                    </td>
                                    {draft.map(p => (
                                        <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                            <NumberInput
                                                value={p.limits?.maxStorageGB ?? 0}
                                                onChange={v => updateDraft(p.id, pl => ({ ...pl, limits: { ...pl.limits, maxStorageGB: v } }))}
                                                min={1}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-zinc-50 border-b-2 border-zinc-200">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            <Coins className="h-3.5 w-3.5" />
                                            Extra User Price <span className="font-normal normal-case text-zinc-400">(₹/user)</span>
                                        </div>
                                    </td>
                                    {draft.map(p => (
                                        <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                            <NumberInput
                                                value={p.additionalStaffPrice ?? 0}
                                                onChange={v => updateDraft(p.id, pl => ({ ...pl, additionalStaffPrice: v }))}
                                                prefix="₹"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {modulesByCategory.map(({ cat, modules }) => {
                                    const meta = CAT_META[cat];
                                    const Icon = meta.icon;
                                    const collapsed = collapsedCats[cat];
                                    // count included modules per plan for this category
                                    const planCounts = draft.map(p => {
                                        const inc = new Set(p.includedModules || []);
                                        return modules.filter(m => inc.has(m.id)).length;
                                    });

                                    return (
                                        <React.Fragment key={cat}>
                                            {/* Category header */}
                                            <tr
                                                key={`cat-${cat}`}
                                                className="bg-zinc-50 border-t border-b border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
                                                onClick={() => toggleCat(cat)}
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className={`h-4 w-4 ${meta.color}`} />
                                                        <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">{meta.label}</span>
                                                        <span className="text-[10px] text-zinc-400 font-medium">{modules.length} modules</span>
                                                        {collapsed
                                                            ? <ChevronRight className="h-3.5 w-3.5 text-zinc-400 ml-auto" />
                                                            : <ChevronDown className="h-3.5 w-3.5 text-zinc-400 ml-auto" />}
                                                    </div>
                                                </td>
                                                {draft.map((p, i) => (
                                                    <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                                        <span className="text-xs font-bold text-zinc-500">
                                                            {planCounts[i]}/{modules.length}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Module rows */}
                                            {!collapsed && modules.map((mod, idx) => (
                                                <tr
                                                    key={mod.id}
                                                    className={`border-b border-zinc-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <div className="font-semibold text-sm text-zinc-800">{mod.label}</div>
                                                        <div className="text-xs text-zinc-400 mt-0.5">{mod.description}</div>
                                                    </td>
                                                    {draft.map(p => {
                                                        const enabled = (p.includedModules || []).includes(mod.id);
                                                        return (
                                                            <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3.5 border-l border-zinc-100`}>
                                                                <div className="flex flex-col items-center gap-1.5">
                                                                    <Toggle
                                                                        enabled={enabled}
                                                                        onChange={v => toggleModule(p.id, mod.id, v)}
                                                                    />
                                                                    <span className={`text-[10px] font-bold ${enabled ? 'text-blue-600' : 'text-zinc-300'}`}>
                                                                        {enabled ? 'Included' : 'Excluded'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>

                            {/* Footer: Popular flag & Active toggle */}
                            <tfoot>
                                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            <Star className="h-3.5 w-3.5" />
                                            Mark as Popular
                                        </div>
                                    </td>
                                    {draft.map(p => (
                                        <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                            <Toggle
                                                enabled={!!p.isPopular}
                                                onChange={v => updateDraft(p.id, pl => ({ ...pl, isPopular: v }))}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-zinc-50 border-t border-zinc-100">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Plan Active
                                        </div>
                                    </td>
                                    {draft.map(p => (
                                        <td key={p.id} className={`${PLAN_WIDTH} px-4 py-3 border-l border-zinc-100 text-center`}>
                                            <Toggle
                                                enabled={!!p.isActive}
                                                onChange={v => updateDraft(p.id, pl => ({ ...pl, isActive: v }))}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                {/* Module count summary */}
                                <tr className="border-t border-zinc-200 bg-white">
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-black text-zinc-600 uppercase tracking-wider">Total Modules</span>
                                    </td>
                                    {draft.map(p => {
                                        const count = (p.includedModules || []).length;
                                        const total = ALL_MODULES.length;
                                        const pct = Math.round((count / total) * 100);
                                        return (
                                            <td key={p.id} className={`${PLAN_WIDTH} px-4 py-4 border-l border-zinc-100 text-center`}>
                                                <div className="text-xl font-black text-zinc-900">{count}<span className="text-sm text-zinc-400 font-medium">/{total}</span></div>
                                                <div className="mt-1.5 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-zinc-400 font-medium mt-1">{pct}% coverage</div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
            </div>
        </div>
    );
}
