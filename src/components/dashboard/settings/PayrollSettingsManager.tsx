"use client";

import { useState } from "react";
import {
    CreditCard,
    Save,
    Zap,
    Clock,
    Calendar,
    HandCoins,
    ShieldCheck,
    AlertCircle,
    Info,
    Smartphone,
    TrendingUp
} from "lucide-react";
import { updatePayrollSettingsAction } from "@/app/actions/payroll-settings-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PayrollSettingsManagerProps {
    schoolSlug: string;
    initialData: any;
}

export function PayrollSettingsManager({ schoolSlug, initialData }: PayrollSettingsManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullAttendanceBonus: initialData?.fullAttendanceBonus || 0,
        punctualityBonus: initialData?.punctualityBonus || 0,
        lateThreshold: initialData?.lateThreshold || 3,
        latePenalty: initialData?.latePenalty || 0,
        overtimeRate: initialData?.overtimeRate || 0,
        workDaysPerWeek: initialData?.workDaysPerWeek || 6,
        standardWorkHours: initialData?.standardWorkHours || 8,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await updatePayrollSettingsAction(schoolSlug, formData);
        if (res.success) {
            toast.success("Institutional payroll rules updated successfully");
        } else {
            toast.error(res.error || "Failed to update settings");
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with Stats snapshot */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                        <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Payroll Automation Engine</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                        Payroll <span className="text-zinc-400">Architect</span>
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium max-w-md">
                        Configure institutional rules for automated incentives, late thresholds, and salary calculation logic.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-zinc-200 dark:shadow-none disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Synchronizing..." : "Publish Rules"}
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Automated Incentives Card */}
                <div className="group relative bg-white dark:bg-zinc-950 rounded-[40px] p-10 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-500 hover:shadow-xl">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap className="h-32 w-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 rounded-[20px] bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/20 dark:text-emerald-400">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">Automated Incentives</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">Rewards for excellence</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Perfect Attendance Bonus</label>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter italic">Applied if 0 absences</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-300 italic">₹</span>
                                <input
                                    name="fullAttendanceBonus"
                                    type="number"
                                    value={formData.fullAttendanceBonus}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[1.5rem] border border-zinc-200 bg-white px-10 py-5 text-lg font-black italic focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Punctuality Incentive</label>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter italic">Applied if 0 late comings</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-300 italic">₹</span>
                                <input
                                    name="punctualityBonus"
                                    type="number"
                                    value={formData.punctualityBonus}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[1.5rem] border border-zinc-200 bg-white px-10 py-5 text-lg font-black italic focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Late Coming Rules Card */}
                <div className="group relative bg-zinc-900 text-white rounded-[40px] p-10 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock className="h-32 w-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 rounded-[20px] bg-white/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none italic uppercase">Punctuality Enforcement</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">Deduction & Threshold Engine</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Grace Threshold</label>
                                <div className="relative">
                                    <input
                                        name="lateThreshold"
                                        type="number"
                                        value={formData.lateThreshold}
                                        onChange={handleInputChange}
                                        className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-6 py-5 text-xl font-black italic focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Days</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 font-bold leading-tight">Max allowed "LATE" attendance markers before penalty initiates.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Late Penalty</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-500 italic">₹</span>
                                    <input
                                        name="latePenalty"
                                        type="number"
                                        value={formData.latePenalty}
                                        onChange={handleInputChange}
                                        className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-10 py-5 text-xl font-black italic text-rose-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10"
                                    />
                                </div>
                                <p className="text-[9px] text-zinc-500 font-bold leading-tight">Deduction amount per "LATE" day AFTER exceeding threshold.</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-start gap-4">
                            <Info className="h-5 w-5 text-blue-400 mt-1" />
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-300 leading-none">Automated Logic Verification</p>
                                <p className="text-[10px] text-zinc-500 font-medium">System will analyze monthly attendance markers. If "LATE" count is 5 and threshold is 3, a penalty of 2x [Penalty Amount] will be applied.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations & Standards Card */}
                <div className="lg:col-span-2 group relative border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-10 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-[20px] bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-900/20 dark:text-indigo-400">
                                <Calendar className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none italic uppercase">Operation Standards</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">Institutional Baseline Values</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8 items-center">
                            <div className="space-y-3 min-w-[150px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Working Days / Week</label>
                                <input
                                    name="workDaysPerWeek"
                                    type="number"
                                    value={formData.workDaysPerWeek}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[1.25rem] border border-zinc-200 bg-white px-6 py-4 text-base font-black italic focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                />
                            </div>
                            <div className="space-y-3 min-w-[150px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Standard Work Hours</label>
                                <input
                                    name="standardWorkHours"
                                    type="number"
                                    value={formData.standardWorkHours}
                                    onChange={handleInputChange}
                                    className="w-full rounded-[1.25rem] border border-zinc-200 bg-white px-6 py-4 text-base font-black italic focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                />
                            </div>
                            <div className="space-y-3 min-w-[150px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-indigo-500">Overtime Rate (Per HR)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-300 italic">₹</span>
                                    <input
                                        name="overtimeRate"
                                        type="number"
                                        value={formData.overtimeRate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-[1.25rem] border border-zinc-200 bg-white px-8 py-4 text-base font-black italic text-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 shadow-lg shadow-indigo-500/5 ring-4 ring-indigo-500/5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="h-6 w-6 text-zinc-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Rules are applied globally to current and future payroll cycles upon recalculation.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Engine Online</span>
                </div>
            </div>
        </form>
    );
}
