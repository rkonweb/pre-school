"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    CreditCard,
    Plus,
    Search,
    Loader2,
    Calendar,
    Trophy,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    Banknote,
    X,
    Filter
} from "lucide-react";
import { SectionHeader } from "@/components/ui/erp-ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
    getActivityFeesAction, 
    createActivityFeeAction,
    getActivityEnrollmentsAction,
    getExtracurricularStatsAction
} from "@/app/actions/extracurricular-actions";
import { format } from "date-fns";

export default function ActivityFeesPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fees, setFees] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        studentId: "",
        activityId: "",
        amount: "",
        billingFrequency: "ONE_TIME",
        status: "PENDING"
    });

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const [feesRes, enrollRes, statsRes] = await Promise.all([
            getActivityFeesAction(slug),
            getActivityEnrollmentsAction(slug),
            getExtracurricularStatsAction(slug)
        ]);

        if (feesRes.success) setFees(feesRes.data);
        if (enrollRes.success) setEnrollments(enrollRes.data);
        if (statsRes.success) setStats(statsRes.data);
        
        setIsLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.studentId || !formData.activityId || !formData.amount) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        const res = await createActivityFeeAction(slug, {
            ...formData,
            amount: parseFloat(formData.amount)
        });

        if (res.success) {
            toast.success("Activity fee generated successfully");
            setIsModalOpen(false);
            setFormData({
                studentId: "",
                activityId: "",
                amount: "",
                billingFrequency: "ONE_TIME",
                status: "PENDING"
            });
            loadData();
        } else {
            toast.error(res.error || "Failed to generate fee");
        }
        setIsSubmitting(false);
    };

    const filteredFees = fees.filter(f => 
        (f.student.firstName + " " + f.student.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <SectionHeader
                title="Activity Fees"
                subtitle="Manage and generate fees for extracurricular activities."
                icon={CreditCard}
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-zinc-900 font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand/20"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Fee
                    </button>
                }
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Fees</p>
                            <p className="text-2xl font-black text-zinc-900">{fees.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Paid</p>
                            <p className="text-2xl font-black text-zinc-900">{fees.filter(f => f.status === 'PAID').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Pending</p>
                            <p className="text-2xl font-black text-zinc-900">{fees.filter(f => f.status === 'PENDING').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden">
                <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search student or activity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 transition-all font-medium text-zinc-900"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl hover:text-zinc-600 transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Activity</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Billing</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredFees.map((fee) => (
                                <tr key={fee.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                                                {fee.student.firstName[0]}
                                            </div>
                                            <p className="text-sm font-bold text-zinc-900">{fee.student.firstName} {fee.student.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-zinc-600">{fee.activity.name}</td>
                                    <td className="px-8 py-5 text-sm font-black text-zinc-900">${fee.amount.toFixed(2)}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase px-2 py-1 bg-zinc-100 rounded-lg">
                                            {fee.billingFrequency}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            fee.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {fee.status === "PAID" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {fee.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-medium text-zinc-400 italic">
                                        {format(new Date(fee.createdAt), "MMM dd, yyyy")}
                                    </td>
                                </tr>
                            ))}
                            {filteredFees.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-[24px] bg-zinc-50 flex items-center justify-center text-zinc-300">
                                                <CreditCard className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-bold text-zinc-400">No activity fees found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Fee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                Generate Fee
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Enrollment</label>
                                    <select
                                        value={`${formData.studentId}|${formData.activityId}`}
                                        onChange={(e) => {
                                            const [sid, aid] = e.target.value.split('|');
                                            setFormData({ ...formData, studentId: sid, activityId: aid });
                                        }}
                                        className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 font-bold text-zinc-900"
                                        required
                                    >
                                        <option value="">Select an enrolled student</option>
                                        {enrollments.map(en => (
                                            <option key={en.id} value={`${en.studentId}|${en.activityId}`}>
                                                {en.student.firstName} {en.student.lastName} - {en.activity.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 font-bold text-zinc-900"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Frequency</label>
                                        <select
                                            value={formData.billingFrequency}
                                            onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                                            className="w-full px-5 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 font-bold text-zinc-900"
                                            required
                                        >
                                            <option value="ONE_TIME">One Time</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="SEMESTER">Semester</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-brand text-zinc-900 font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Generate Invoice"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
