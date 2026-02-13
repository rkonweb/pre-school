"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    CalendarDays,
    Plus,
    History,
    CheckCircle2,
    MoreVertical,
    Edit2,
    Archive,
    Loader2,
    Calendar,
    Settings2,
    RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    getAcademicYearsAction,
    createAcademicYearAction,
    updateAcademicYearAction
} from "@/app/actions/academic-year-actions";

export default function AcademicYearsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [years, setYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingYear, setEditingYear] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isCurrent: false
    });

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        try {
            const res = await getAcademicYearsAction(slug);
            if (res.success) {
                setYears(res.data);
            }
        } catch (error) {
            toast.error("Failed to load academic years");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                isCurrent: formData.isCurrent
            };

            const res = editingYear
                ? await updateAcademicYearAction(slug, editingYear.id, payload)
                : await createAcademicYearAction(slug, payload);

            if (res.success) {
                toast.success(editingYear ? "Year updated" : "Year created");
                setShowForm(false);
                setEditingYear(null);
                setFormData({ name: "", startDate: "", endDate: "", isCurrent: false });
                loadData();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleEdit(year: any) {
        setEditingYear(year);
        setFormData({
            name: year.name,
            startDate: format(new Date(year.startDate), "yyyy-MM-dd"),
            endDate: format(new Date(year.endDate), "yyyy-MM-dd"),
            isCurrent: year.isCurrent
        });
        setShowForm(true);
    }

    async function handleSetCurrent(id: string) {
        try {
            const res = await updateAcademicYearAction(slug, id, { isCurrent: true });
            if (res.success) {
                toast.success("Current academic year updated");
                loadData();
            }
        } catch (error) {
            toast.error("Failed to update current year");
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100">
                        <CalendarDays className="h-3 w-3 text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Institutional Periods</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">Academic Years</h1>
                    <p className="text-zinc-500 font-medium">Manage and define the institutional calendar cycles.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="p-3 rounded-2xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
                    >
                        <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingYear(null);
                            setFormData({ name: "", startDate: "", endDate: "", isCurrent: false });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-200/50"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add New Year</span>
                    </button>
                </div>
            </div>

            {/* List & Form Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Years List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 shadow-sm space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Hydrating Years...</p>
                        </div>
                    ) : years.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-zinc-100 shadow-sm text-center px-6">
                            <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                                <History className="h-10 w-10 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 mb-2">No Academic Years Found</h3>
                            <p className="text-zinc-500 max-w-sm font-medium">Start by adding your first academic year to organize institutional records.</p>
                        </div>
                    ) : (
                        years.map((year) => (
                            <div
                                key={year.id}
                                className={cn(
                                    "group relative bg-white p-6 rounded-[32px] border transition-all duration-300",
                                    year.isCurrent ? "border-rose-200 shadow-lg shadow-rose-100/50" : "border-zinc-100 hover:border-zinc-200 shadow-sm hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center",
                                            year.isCurrent ? "bg-rose-500 text-white" : "bg-zinc-50 text-zinc-400"
                                        )}>
                                            <Calendar className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-zinc-900">{year.name}</h3>
                                                {year.isCurrent && (
                                                    <span className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Current Session
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {format(new Date(year.startDate), "MMM d, yyyy")} — {format(new Date(year.endDate), "MMM d, yyyy")}
                                                </span>
                                                <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                                <span className="capitalize text-zinc-400">{year.status.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!year.isCurrent && (
                                            <button
                                                onClick={() => handleSetCurrent(year.id)}
                                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                Set Current
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(year)}
                                            className="p-3 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 transition-all"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar - Form or Info */}
                <div className="space-y-6">
                    {showForm ? (
                        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                                    {editingYear ? "Edit Year" : "Add Year"}
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-2 rounded-full hover:bg-zinc-50 text-zinc-400"
                                >
                                    <Plus className="h-5 w-5 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Year Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2024-2025"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 rounded-3xl bg-zinc-50 border-0 focus:ring-2 focus:ring-rose-500/20 font-bold transition-all placeholder:text-zinc-300"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-6 py-4 rounded-3xl bg-zinc-50 border-0 focus:ring-2 focus:ring-rose-500/20 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-6 py-4 rounded-3xl bg-zinc-50 border-0 focus:ring-2 focus:ring-rose-500/20 font-bold transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-3xl flex items-center justify-between px-6">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black text-zinc-900">Current Session</p>
                                        <p className="text-[10px] text-zinc-400 font-medium tracking-tight">Mark as active institutional period</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isCurrent}
                                        onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })}
                                        className="h-6 w-6 rounded-lg text-rose-500 focus:ring-rose-500/20 border-zinc-200"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 rounded-3xl bg-zinc-900 text-white font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        editingYear ? "Update Configuration" : "Initialize Year"
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-[40px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Settings2 className="h-32 w-32" />
                            </div>

                            <div className="space-y-4 relative z-10">
                                <h3 className="text-2xl font-black tracking-tight leading-tight uppercase">Operational Context</h3>
                                <p className="text-sm font-medium opacity-60 leading-relaxed italic">
                                    Academic Years serve as the primary partition for all institutional records. Marking a year as "Current" will automatically filter dashboard analytics, attendance logs, and fee reports to reflect only data from that period.
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-zinc-900 transition-all">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Automated Archival</p>
                                        <p className="text-[10px] opacity-40 font-medium tracking-tight">Data from previous sessions is preserved.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-zinc-900 transition-all">
                                        <Archive className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Unified Reporting</p>
                                        <p className="text-[10px] opacity-40 font-medium tracking-tight">Generate reports across year boundaries.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
