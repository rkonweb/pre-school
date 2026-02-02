"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Download, CheckCircle, Clock, AlertCircle, ArrowUpRight, Loader2, ChevronDown } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getStudentFeesAction, recordPaymentAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { useParentData } from "@/context/parent-context";

export default function FeesPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const { students, school, studentStats, isLoading: isContextLoading } = useParentData();
    const checkPhone = searchParams.get("phone");
    const schoolSlug = params.schoolName as string;

    // Local State for specific fee fetch
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [feesData, setFeesData] = useState<any>(null); // Detailed transactions
    const [isSwitching, setIsSwitching] = useState(false);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);

    useEffect(() => {
        // Reset selection when switching students
        setSelectedFees([]);
    }, [selectedStudentId]);

    // Set initial student from context
    useEffect(() => {
        if (!selectedStudentId && students.length > 0) {
            setSelectedStudentId(students[0].id);
        }
    }, [students, selectedStudentId]);

    // Fetch detailed fees when student selected
    useEffect(() => {
        if (selectedStudentId && checkPhone) {
            loadStudentFees(selectedStudentId);
        }
    }, [selectedStudentId, checkPhone]);

    const loadStudentFees = async (studentId: string) => {
        setIsSwitching(true);
        // We might already have summary in context, but we need transaction list
        const res = await getStudentFeesAction(studentId, checkPhone || "");
        if (res.success) {
            setFeesData(res);
        } else {
            // toast.error(res.error || "Failed to load fee details");
        }
        setIsSwitching(false);
    };

    if (isContextLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    const brandColor = school?.brandColor || "#2563eb";

    const handleToggleFee = (feeId: string) => {
        setSelectedFees(prev => {
            if (prev.includes(feeId)) return prev.filter(id => id !== feeId);
            return [...prev, feeId];
        });
    };

    const handleSelectAll = () => {
        if (selectedFees.length === pendingFees.length) {
            setSelectedFees([]);
        } else {
            setSelectedFees(pendingFees.map((f: any) => f.id));
        }
    };

    const handlePayment = async (feeIds: string[]) => {
        console.log("Handle Payment Clicked", feeIds, checkPhone);
        if (feeIds.length === 0) return;

        const feesToPay = (feesData?.fees || []).filter((f: any) => feeIds.includes(f.id));
        const totalAmount = feesToPay.reduce((sum: number, f: any) => {
            const paid = f.payments?.reduce((pSum: number, p: any) => pSum + p.amount, 0) || 0;
            return sum + (f.amount - paid);
        }, 0);

        if (totalAmount <= 0) {
            toast.error("No amount to pay");
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(
            `Proceed to pay ₹${totalAmount.toLocaleString()} for ${feeIds.length} fee(s)?\n\n` +
            feesToPay.map((f: any) => `• ${f.title}: ₹${f.amount.toLocaleString()}`).join('\n')
        );

        if (!confirmed) return;

        // Simulate payment processing (in production, integrate with Razorpay/Stripe)
        toast.loading("Processing payment...", { id: "payment" });

        try {
            // Process each fee payment
            for (const feeId of feeIds) {
                const fee = feesToPay.find((f: any) => f.id === feeId);
                if (!fee) continue;

                const paid = fee.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                const remainingAmount = fee.amount - paid;

                if (remainingAmount > 0) {
                    const result = await recordPaymentAction(
                        feeId,
                        remainingAmount,
                        "ONLINE", // Payment method
                        `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Mock transaction reference
                        checkPhone || ""
                    );

                    if (!result.success) {
                        throw new Error(result.error || "Payment failed");
                    }
                }
            }

            toast.success("Payment successful!", { id: "payment" });

            // Reload fees data
            if (selectedStudentId) {
                await loadStudentFees(selectedStudentId);
            }

            // Clear selection
            setSelectedFees([]);

        } catch (error: any) {
            toast.error(error.message || "Payment failed", { id: "payment" });
        }
    };

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    // Derived Data
    // Use feesData (Detail) if available, otherwise fallback/empty
    const pendingFees = feesData?.fees?.filter((f: any) => ["PENDING", "PARTIAL", "OVERDUE"].includes(f.status)) || [];
    const allTransactions = [...(feesData?.fees || [])].sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    const totalSelectedAmount = (feesData?.fees || [])
        .filter((f: any) => selectedFees.includes(f.id))
        .reduce((sum: number, f: any) => sum + f.amount, 0) || 0;

    // Prefer DETAIL total due, else CONTEXT summary
    const contextSummary = selectedStudentId ? studentStats[selectedStudentId]?.fees : null;
    const totalDueAmount = feesData?.summary?.totalDue ?? contextSummary?.totalDue ?? 0;

    return (
        <div className="px-6 py-12 max-w-4xl mx-auto space-y-12 min-h-screen">
            {/* Header */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div
                            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                        >
                            Accounts & Billing
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.9] text-zinc-900">
                            Manage <br />
                            <span className="text-zinc-300">your dues.</span>
                        </h1>
                    </div>

                    {/* Student Switcher */}
                    {students.length > 0 && (
                        <div className="relative group">
                            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-colors">
                                <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    {selectedStudent?.firstName?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Student</span>
                                    <span className="text-sm font-black text-zinc-900">{selectedStudent?.firstName}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-zinc-400 ml-2" />
                            </div>

                            {/* Dropdown for multiple students */}
                            {students.length > 1 && (
                                <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                                    {students.map((s: any) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSelectedStudentId(s.id)}
                                            className="px-4 py-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-3"
                                        >
                                            <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold">
                                                {s.firstName.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-bold ${selectedStudentId === s.id ? 'text-zinc-900' : 'text-zinc-500'}`}>
                                                {s.firstName} {s.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Main Billing Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-zinc-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-zinc-900/20"
            >
                {isSwitching && (
                    <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            {selectedFees.length > 0 ? "Selected Total" : "Total Due Balance"}
                        </p>
                        <h2 className="text-6xl font-black tracking-tighter">
                            ₹{(selectedFees.length > 0 ? totalSelectedAmount : totalDueAmount).toLocaleString()}
                        </h2>
                        {totalDueAmount > 0 ? (
                            <p className="text-orange-400 font-bold text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {selectedFees.length > 0
                                    ? `${selectedFees.length} Items Selected`
                                    : pendingFees.length > 0 ? "Outstanding dues" : "All clear"}
                            </p>
                        ) : (
                            <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" /> All dues paid
                            </p>
                        )}
                    </div>

                    {totalDueAmount > 0 && (
                        <button
                            onClick={() => handlePayment(selectedFees.length > 0 ? selectedFees : pendingFees.map((f: any) => f.id))}
                            className="px-10 py-5 bg-white text-zinc-900 rounded-2xl font-black text-lg hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {selectedFees.length > 0 ? `Pay Selected (₹${totalSelectedAmount.toLocaleString()})` : "Pay All Dues"}
                        </button>
                    )}
                </div>

                <div
                    className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-[100px] opacity-20"
                    style={{ backgroundColor: brandColor }}
                />
            </motion.div>

            {/* Transaction History & Selection */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black tracking-tight">Fee Records</h2>
                        {pendingFees.length > 0 && (
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-3 py-1 bg-zinc-100 rounded-lg"
                            >
                                {selectedFees.length === pendingFees.length ? "Deselect All" : "Select All Pending"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Show simple loader if switching but no data? No, isSwitching handles overlay above. */}
                    {allTransactions.length === 0 ? (
                        <div className="p-12 text-center bg-zinc-50 rounded-[2rem] border border-zinc-100">
                            <p className="text-zinc-400 font-medium">{isSwitching ? "Loading records..." : "No fee records found for this student."}</p>
                        </div>
                    ) : (
                        allTransactions.map((tx: any, i: number) => {
                            const isPending = ["PENDING", "PARTIAL", "OVERDUE"].includes(tx.status);
                            const isSelected = selectedFees.includes(tx.id);

                            return (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => isPending && handleToggleFee(tx.id)}
                                    className={`
                                        group border p-6 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300
                                        ${isPending ? 'cursor-pointer hover:border-zinc-300' : 'opacity-75'}
                                        ${isSelected ? 'bg-zinc-900 border-zinc-900 shadow-xl' : 'bg-white border-zinc-100 hover:shadow-lg hover:shadow-zinc-100'}
                                    `}
                                >
                                    <div className="flex items-center gap-5">
                                        {/* Checkbox or Icon */}
                                        <div className={`
                                            h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shrink-0
                                            ${isSelected ? 'bg-zinc-800 text-white' :
                                                tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' :
                                                    tx.status === 'OVERDUE' ? 'bg-red-50 text-red-500' :
                                                        'bg-zinc-50 text-zinc-400'}
                                        `}>
                                            {isSelected ? <CheckCircle className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-lg tracking-tight ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{tx.title}</h4>
                                            <p className={`text-xs font-medium ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                Due: {new Date(tx.dueDate).toLocaleDateString()} • {tx.description || "Tuition Fee"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        {/* Status Badge */}
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${isSelected ? 'bg-zinc-800 text-zinc-300' :
                                            tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                tx.status === 'OVERDUE' ? 'bg-red-50 text-red-600' :
                                                    'bg-amber-50 text-amber-600'
                                            }`}>
                                            {tx.status}
                                        </div>

                                        <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-white' : 'text-zinc-900'}`}>₹{tx.amount.toLocaleString()}</span>

                                        {isPending && !isSelected && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePayment([tx.id]);
                                                }}
                                                className="px-4 py-2 text-blue-600 hover:text-blue-700 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider"
                                                style={{ color: brandColor }}
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
