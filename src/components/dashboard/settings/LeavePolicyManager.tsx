"use client";

import { useState, useEffect } from "react";
import { getRolesAction } from "@/app/actions/role-actions";
import {
    Calendar,
    ShieldCheck,
    Plus,
    Trash2,
    Clock,
    CreditCard,
    Users,
    FileText,
    ChevronRight,
    Settings,
    Copy,
    CheckCircle2,
    Palmtree,
    Timer,
    Zap,
    AlertCircle,
    Edit3,
    Check
} from "lucide-react";
import { createLeavePolicyAction, deleteLeavePolicyAction, updateLeavePolicyAction } from "@/app/actions/leave-policy-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveType {
    name: string;
    code: string;
    totalDays: number;
    isPaid: boolean;
    allowHalfDay: boolean;
    minNoticePeriod: number;
    requiresApproval: boolean;
    gender: string;
}

interface LeavePolicy {
    id: string;
    name: string;
    description: string | null;
    effectiveFrom: string | Date;
    isDefault: boolean;
    leaveTypes: LeaveType[];
    roleId?: string | null;

    // Punctuality
    lateComingGrace: number;
    lateComingMax: number;
    earlyLeavingGrace: number;
    earlyLeavingMax: number;

    // Attendance Rules
    minFullDayHours: number;
    minHalfDayHours: number;
    maxDailyPunchEvents: number;

    // Permissions
    permissionAllowed: boolean;
    permissionMaxMins: number;
    permissionMaxOccur: number;
    minPunchGapMins: number;
}

interface LeavePolicyManagerProps {
    schoolSlug: string;
    initialPolicies: LeavePolicy[];
}

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
    { name: "Casual Leave", code: "CL", totalDays: 12, isPaid: true, allowHalfDay: true, minNoticePeriod: 1, requiresApproval: true, gender: "ALL" },
    { name: "Sick Leave", code: "SL", totalDays: 10, isPaid: true, allowHalfDay: true, minNoticePeriod: 0, requiresApproval: true, gender: "ALL" },
    { name: "Loss of Pay", code: "LOP", totalDays: 99, isPaid: false, allowHalfDay: true, minNoticePeriod: 0, requiresApproval: true, gender: "ALL" }
];

const INITIAL_FORM_STATE = {
    id: "",
    name: "",
    description: "",
    effectiveFrom: new Date().toISOString().split('T')[0],
    isDefault: false,
    roleId: "" as string | null,
    lateComingGrace: 15,
    lateComingMax: 60,
    earlyLeavingGrace: 15,
    earlyLeavingMax: 60,
    minFullDayHours: 8,
    minHalfDayHours: 4,
    maxDailyPunchEvents: 10,
    permissionAllowed: true,
    permissionMaxMins: 120,
    permissionMaxOccur: 2,
    minPunchGapMins: 0,
    leaveTypes: [...DEFAULT_LEAVE_TYPES]
};

export function LeavePolicyManager({ schoolSlug, initialPolicies }: LeavePolicyManagerProps) {
    const [policies, setPolicies] = useState<LeavePolicy[]>(initialPolicies);
    const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function fetchRoles() {
            const res = await getRolesAction(schoolSlug);
            if (res.success && res.roles) {
                setRoles(res.roles);
            }
        }
        fetchRoles();
    }, [schoolSlug]);

    const [newPolicy, setNewPolicy] = useState(INITIAL_FORM_STATE);

    if (!mounted) return null;

    const handleSavePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = editingId
            ? await updateLeavePolicyAction(schoolSlug, editingId, newPolicy)
            : await createLeavePolicyAction(schoolSlug, newPolicy);

        if (res.success) {
            toast.success(editingId ? "Policy updated successfully" : "Comprehensive Leave policy created");

            if (editingId) {
                setPolicies(policies.map(p => p.id === editingId ? res.data as any : p));
            } else {
                setPolicies([...policies, res.data as any]);
            }

            resetForm();
        } else {
            toast.error(res.error || "Failed to save policy");
        }
        setIsLoading(false);
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setNewPolicy(INITIAL_FORM_STATE);
    };

    const handleEdit = (policy: LeavePolicy) => {
        setEditingId(policy.id);
        setIsCreating(true);
        setNewPolicy({
            id: policy.id,
            name: policy.name,
            description: policy.description || "",
            effectiveFrom: new Date(policy.effectiveFrom).toISOString().split('T')[0],
            isDefault: policy.isDefault,
            roleId: policy.roleId || null,
            lateComingGrace: policy.lateComingGrace,
            lateComingMax: policy.lateComingMax,
            earlyLeavingGrace: policy.earlyLeavingGrace,
            earlyLeavingMax: policy.earlyLeavingMax,
            minFullDayHours: policy.minFullDayHours || 8,
            minHalfDayHours: policy.minHalfDayHours || 4,
            maxDailyPunchEvents: policy.maxDailyPunchEvents || 10,
            permissionAllowed: policy.permissionAllowed,
            permissionMaxMins: policy.permissionMaxMins || 120,
            permissionMaxOccur: policy.permissionMaxOccur || 2,
            minPunchGapMins: policy.minPunchGapMins || 0,
            leaveTypes: (policy.leaveTypes || []).map((lt: any) => ({ ...lt }))
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will affect staff attendance rules.")) return;
        const res = await deleteLeavePolicyAction(schoolSlug, id);
        if (res.success) {
            toast.success("Policy removed");
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    const updateLeaveType = (index: number, field: keyof LeaveType, value: any) => {
        const updated = [...newPolicy.leaveTypes];
        updated[index] = { ...updated[index], [field]: value };
        setNewPolicy({ ...newPolicy, leaveTypes: updated });
    };

    const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = e.target.value;
        if (roleId === "") {
            // Default Global
            setNewPolicy({ ...newPolicy, roleId: null, isDefault: true, name: "Default Global Policy" });
        } else {
            const role = roles.find(r => r.id === roleId);
            setNewPolicy({
                ...newPolicy,
                roleId: roleId,
                isDefault: false,
                name: role ? role.name : ""
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">Attendance & Leave Policy</h3>
                    <p className="text-sm text-zinc-500">Define entitlements, punctuality markers, and short-break permissions.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        <Plus className="h-4 w-4" /> Comprehensive Policy
                    </button>
                )}
            </div>

            {isCreating && (
                <form onSubmit={handleSavePolicy} className="bg-zinc-50/50 dark:bg-zinc-900/30 p-10 rounded-[40px] border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                            {editingId ? "Update Policy" : "Define New Policy"}
                        </h3>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 text-zinc-400" />
                        </button>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Core Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Identity & Schedule
                            </h4>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Applicable Role (Policy Name)</label>
                                    <select
                                        value={newPolicy.roleId || ""}
                                        onChange={handleRoleSelect}
                                        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                    >
                                        <option value="">Default Global Policy</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-zinc-400 font-bold px-2">
                                        Policy Identifier: <span className="text-blue-600">{newPolicy.name}</span>
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Effective Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newPolicy.effectiveFrom}
                                        onChange={e => setNewPolicy({ ...newPolicy, effectiveFrom: e.target.value })}
                                        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                    />
                                </div>
                            </div>

                            {/* Attendance Calculation Rules */}
                            <div className="space-y-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Calculations & Limits
                                </h4>
                                <div className="grid gap-6 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Min Hrs for Full Day</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" step="0.5" value={newPolicy.minFullDayHours} onChange={e => setNewPolicy({ ...newPolicy, minFullDayHours: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">HRS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Min Hrs for Half Day</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" step="0.5" value={newPolicy.minHalfDayHours} onChange={e => setNewPolicy({ ...newPolicy, minHalfDayHours: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">HRS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Max Punches / Day</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.maxDailyPunchEvents} onChange={e => setNewPolicy({ ...newPolicy, maxDailyPunchEvents: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">EVENTS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Punch Gap</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.minPunchGapMins} onChange={e => setNewPolicy({ ...newPolicy, minPunchGapMins: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">MINS</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    Staff working less than {newPolicy.minHalfDayHours} hours will be marked ABSENT automatically. Max {newPolicy.maxDailyPunchEvents} punch events allowed per day.
                                </p>
                            </div>

                            {/* Punctuality Rules */}
                            <div className="space-y-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                                    <Timer className="h-4 w-4" /> Punctuality & Grace Periods
                                </h4>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Late Coming Grace</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.lateComingGrace} onChange={e => setNewPolicy({ ...newPolicy, lateComingGrace: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">MINS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Max Late / Mo</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.lateComingMax} onChange={e => setNewPolicy({ ...newPolicy, lateComingMax: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">MINS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Early Exit Grace</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.earlyLeavingGrace} onChange={e => setNewPolicy({ ...newPolicy, earlyLeavingGrace: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">MINS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Max Early / Mo</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800">
                                            <input type="number" value={newPolicy.earlyLeavingMax} onChange={e => setNewPolicy({ ...newPolicy, earlyLeavingMax: Number(e.target.value) })} className="w-full bg-transparent font-bold focus:outline-none" />
                                            <span className="text-[8px] font-black text-zinc-400">MINS</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                    <AlertCircle className="h-3 w-3" />
                                    Attendance will be flagged if late coming exceeds {newPolicy.lateComingMax} minutes in a calendar month.
                                </p>
                            </div>
                        </div>

                        {/* Permission Rules Sidebar */}
                        <div className="bg-zinc-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Zap className="h-32 w-32" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Short-Leave Permissions
                            </h4>

                            <div className="space-y-8 relative z-10">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <div className={cn(
                                        "w-12 h-6 rounded-full relative transition-colors",
                                        newPolicy.permissionAllowed ? "bg-blue-500" : "bg-zinc-700"
                                    )}>
                                        <input type="checkbox" checked={newPolicy.permissionAllowed} onChange={e => setNewPolicy({ ...newPolicy, permissionAllowed: e.target.checked })} className="hidden" />
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            newPolicy.permissionAllowed ? "left-7" : "left-1"
                                        )} />
                                    </div>
                                    <span className="text-sm font-bold">Enabled</span>
                                </label>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Max Permission Minutes / Mo</label>
                                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                                        <input type="number" value={newPolicy.permissionMaxMins} onChange={e => setNewPolicy({ ...newPolicy, permissionMaxMins: Number(e.target.value) })} className="bg-transparent font-black text-xl w-full focus:outline-none" />
                                        <span className="text-[9px] font-black opacity-40">MINS</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Max Occurrences / Mo</label>
                                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                                        <input type="number" value={newPolicy.permissionMaxOccur} onChange={e => setNewPolicy({ ...newPolicy, permissionMaxOccur: Number(e.target.value) })} className="bg-transparent font-black text-xl w-full focus:outline-none" />
                                        <span className="text-[9px] font-black opacity-40">TIMES</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-relaxed italic border-l-2 border-blue-500 pl-4">
                                    Permissions are short breaks (e.g. 1 hour) that don't count as half-day leaves.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Leave Type Entitlements
                        </h4>

                        <div className="grid gap-4">
                            {newPolicy.leaveTypes.map((lt, idx) => (
                                <div key={idx} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 grid gap-6 md:grid-cols-4 items-end">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Type Name</label>
                                        <input
                                            value={lt.name}
                                            onChange={e => updateLeaveType(idx, "name", e.target.value)}
                                            className="w-full border-b border-zinc-100 dark:border-zinc-800 py-1 text-sm font-bold focus:outline-none dark:bg-transparent"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Annual Limit</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={lt.totalDays}
                                                onChange={e => updateLeaveType(idx, "totalDays", e.target.value)}
                                                className="w-16 border-b border-zinc-100 dark:border-zinc-800 py-1 text-sm font-bold focus:outline-none dark:bg-transparent"
                                            />
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Days</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 md:col-span-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={lt.isPaid}
                                                onChange={e => updateLeaveType(idx, "isPaid", e.target.checked)}
                                                className="h-5 w-5 rounded-lg border-zinc-300 text-brand focus:ring-brand"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-brand">Paid</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={lt.requiresApproval}
                                                onChange={e => updateLeaveType(idx, "requiresApproval", e.target.checked)}
                                                className="h-5 w-5 rounded-lg border-zinc-300 text-brand focus:ring-brand"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-brand">Approval Required</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-8 py-4 bg-zinc-100 text-zinc-400 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-10 py-4 bg-brand text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand/30 transition-all hover:brightness-110 active:scale-95"
                        >
                            {isLoading ? "Synchronizing..." : editingId ? "Save Changes" : "Create Policy"}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-6">
                {policies.map(policy => (
                    <div key={policy.id} className="bg-white dark:bg-zinc-950 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden group hover:shadow-2xl transition-all duration-700">
                        <div className="p-10 border-b border-zinc-50 dark:border-zinc-900 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-[24px] border border-zinc-100 dark:border-zinc-800">
                                    <FileText className="h-8 w-8 text-brand" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{policy.name}</h4>
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" /> From: {format(new Date(policy.effectiveFrom), "dd MMM, yyyy")}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                            <Timer className="h-3 w-3" /> Late Grace: {policy.lateComingGrace}m / {policy.lateComingMax}m Cap
                                        </span>
                                        {policy.isDefault && (
                                            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-emerald-100 dark:border-emerald-800">
                                                Active Policy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(policy)}
                                    className="p-3 text-zinc-300 hover:text-brand transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-[18px] border border-zinc-100 dark:border-zinc-800"
                                >
                                    <Edit3 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(policy.id)}
                                    className="p-3 text-zinc-300 hover:text-rose-500 transition-colors bg-zinc-50 dark:bg-zinc-900 rounded-[18px] border border-zinc-100 dark:border-zinc-800"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Punctuality Summary Card */}
                            <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/20">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-4">Punctuality Cap</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-zinc-500">Late Grace:</span>
                                        <span className="text-zinc-900">{policy.lateComingGrace} mins</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-zinc-500">Early Grace:</span>
                                        <span className="text-zinc-900">{policy.earlyLeavingGrace} mins</span>
                                    </div>
                                </div>
                            </div>

                            {/* Permission Summary Card */}
                            <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-100/50 dark:border-blue-900/20">
                                <p className="text-[9px] font-black uppercase tracking-widest text-brand mb-4">Short Permissions</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-zinc-500">Allowed:</span>
                                        <span className="text-zinc-900">{policy.permissionAllowed ? "YES" : "NO"}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-zinc-500">Monthly Cap:</span>
                                        <span className="text-zinc-900">{policy.permissionMaxMins} mins ({policy.permissionMaxOccur}x)</span>
                                    </div>
                                </div>
                            </div>

                            {policy.leaveTypes?.map((lt, lidx) => (
                                <div key={lidx} className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100/50 dark:border-zinc-800/50 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{lt.code}</span>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            lt.isPaid ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                                        )}>
                                            {lt.isPaid ? "Paid" : "LOP"}
                                        </span>
                                    </div>
                                    <h5 className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight">{lt.name}</h5>
                                    <div className="mt-4 flex items-end justify-between">
                                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{lt.totalDays} <span className="text-[10px] font-black opacity-30 tracking-tight">DAYS</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
