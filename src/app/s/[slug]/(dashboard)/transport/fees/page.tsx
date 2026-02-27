'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTransportFeesAction, generateTransportInvoicesAction, sendTransportFeeRemindersAction } from "@/app/actions/transport-fee-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Loader2, Wallet, History, AlertCircle, TrendingUp, Filter, Receipt, BellRing, Mail } from "lucide-react";

export default function TransportFeesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [reminding, setReminding] = useState(false);

    useEffect(() => {
        fetchFees();
    }, [slug]);

    async function fetchFees() {
        setLoading(true);
        const res = await getTransportFeesAction(slug);
        if (res.success && res.data) {
            setFees(res.data);
        }
        setLoading(false);
    }

    async function handleGenerateBilling() {
        if (!confirm("Generate Monthly Transport Fees for the current month?")) return;
        setGenerating(true);
        try {
            const now = new Date();
            const res = await generateTransportInvoicesAction(slug, "MONTHLY", now.getMonth() + 1, now.getFullYear());
            if (res.success) {
                toast.success(`Successfully generated ${res.count} invoices.`);
                fetchFees();
            } else {
                toast.error(res.error || "Failed to generate invoices.");
            }
        } finally {
            setGenerating(false);
        }
    }

    async function handleSendReminders() {
        if (!confirm("Send proactive reminders to all parents with pending transport fees?")) return;
        setReminding(true);
        try {
            const res = await sendTransportFeeRemindersAction(slug);
            if (res.success) {
                toast.success(`Successfully dispatched ${res.count} automated reminders via SMS/App.`);
            } else {
                toast.error(res.error || "Failed to dispatch reminders.");
            }
        } finally {
            setReminding(false);
        }
    }

    // Calculate stats
    const totalPending = fees.filter(f => f.status === "PENDING").reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.filter(f => f.status === "PAID").reduce((sum, f) => sum + f.amount, 0);
    const totalOverdue = fees.filter(f => f.status === "PENDING" && new Date(f.dueDate) < new Date()).reduce((sum, f) => sum + f.amount, 0);

    return (
        <div className="flex flex-col gap-8 pb-20 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Transport Accounts
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Monitor fee collections, overdue payments, and billing automation.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSendReminders}
                        disabled={reminding || loading}
                        className="h-12 px-6 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-brand rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {reminding ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                        Broadcast Reminders
                    </button>
                    <button
                        onClick={handleGenerateBilling}
                        disabled={generating || loading}
                        className="h-12 px-8 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Generate Invoices
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-zinc-200 shadow-xl shadow-zinc-200/40 relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><Wallet className="h-24 w-24 -rotate-12 translate-x-8 -translate-y-8" /></div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest relative z-10">Total Collected</p>
                    <h3 className="text-3xl font-black text-zinc-900 mt-2 relative z-10 dark:text-zinc-100">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPaid)}
                    </h3>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest relative z-10 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                        <TrendingUp className="h-3 w-3" />
                        Healthy Flow
                    </div>
                </div>
                <div className="bg-zinc-900 text-white p-6 rounded-[32px] shadow-xl shadow-zinc-900/20 relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest relative z-10">Total Pending</p>
                    <h3 className="text-3xl font-black text-white mt-2 relative z-10">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPending)}
                    </h3>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest relative z-10 bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-500/20">
                        <History className="h-3 w-3" />
                        Awaiting Payment
                    </div>
                </div>
                <div className={cn(
                    "p-6 rounded-[32px] border shadow-xl relative overflow-hidden transition-colors",
                    totalOverdue > 0 ? "bg-red-50 border-red-200 text-red-950 shadow-red-200/50" : "bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/40 dark:bg-zinc-950 dark:border-zinc-800"
                )}>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest relative z-10", totalOverdue > 0 ? "text-red-700" : "text-zinc-400")}>Total Overdue</p>
                    <h3 className="text-3xl font-black mt-2 relative z-10 dark:text-zinc-100">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalOverdue)}
                    </h3>
                    {totalOverdue > 0 && (
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-widest relative z-10 bg-red-100 w-fit px-3 py-1 rounded-full border border-red-200 animate-pulse">
                            <AlertCircle className="h-3 w-3" />
                            Action Required
                        </div>
                    )}
                </div>
                <div className="bg-gradient-to-br from-brand to-brand/80 text-[var(--secondary-color)] p-6 rounded-[32px] shadow-xl shadow-brand/30 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <Mail className="h-10 w-10 mb-3 opacity-90" />
                    <p className="text-sm font-black uppercase tracking-tight">Active Automation</p>
                    <p className="text-[10px] font-medium opacity-80 mt-1">Reminders dispatching at T-3 days and overdue intervals.</p>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white border border-zinc-200 rounded-[32px] shadow-xl shadow-zinc-200/40 overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-row items-center justify-between dark:bg-zinc-900/50 dark:border-zinc-800">
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Open Invoices</h2>
                        <p className="text-xs text-zinc-500 font-medium">Recent transport fee billings</p>
                    </div>
                </div>
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 text-xs font-black text-zinc-400 uppercase tracking-widest dark:border-zinc-800">
                                    <th className="px-8 py-4">Title</th>
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Due Date</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {fees.map((fee) => (
                                    <tr key={fee.id} className="group hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-900/30">
                                        <td className="px-8 py-4">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{fee.title}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{fee.description || "Transport"}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                                                    {fee.student?.firstName?.[0]}
                                                </div>
                                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
                                                    {fee.student?.firstName} {fee.student?.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
                                                {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(fee.amount)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                fee.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    fee.status === "PENDING" && new Date(fee.dueDate) < new Date() ? "bg-red-50 text-red-700 border-red-100" :
                                                        "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {fee.status === "PENDING" && new Date(fee.dueDate) < new Date() ? "OVERDUE" : fee.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {fees.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Receipt className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-zinc-400">Zero active transport invoices</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
