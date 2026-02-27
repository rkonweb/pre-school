"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, CheckCircle, ChevronLeft, Loader2, AlertCircle,
    Smartphone, Building, X, ShieldCheck, Wallet, History, Receipt,
    Calendar, ArrowRight, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentFeesAction, recordPaymentAction } from "@/app/actions/parent-actions";
import { useParentData } from "@/context/parent-context";
import { toast } from "sonner";
import { PageWrapper, StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";
import { format } from "date-fns";

export default function FinancePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = (searchParams.get("phone") || "").trim();

    const { isLoading: isContextLoading, brandColor = "#6366f1", school } = useParentData();
    const secondaryColor = school?.secondaryColor || "#475569";

    // State
    const [fees, setFees] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");

    useEffect(() => {
        if (studentId && slug && phone) {
            loadFees();
        } else {
            setIsLoading(false);
        }
    }, [studentId, slug, phone]);

    const loadFees = async () => {
        setIsLoading(true);
        try {
            const feesRes = await getStudentFeesAction(slug, studentId, phone);
            if (feesRes.success) {
                setFees(feesRes);
            }
        } catch (error) {
            console.error("Failed to load fees", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        await loadFees();
        setSelectedFee(null);
        toast.success("Payment successful!");
    };

    if (isContextLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
                <Loader2 style={{ color: brandColor }} className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    const pendingFees = fees?.fees?.filter((f: any) => f.status !== "PAID") || [];

    // Flatten payments for a true transaction history
    const historyTransactions = (fees?.fees || []).flatMap((f: any) =>
        (f.payments || []).map((p: any) => ({
            ...p,
            feeTitle: f.title,
            feeId: f.id
        }))
    ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Verify brandColor validity
    const safeBrandColor = (brandColor && brandColor.startsWith("#")) ? brandColor : "#6366f1";

    return (
        <PageWrapper>
            <StickyHeader
                title="Fees"
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />

            <main className="px-5 space-y-6 flex-1 relative z-0">
                {/* Summary Card */}
                <FinanceSummaryCard
                    summary={fees?.summary}
                    brandColor={safeBrandColor}
                    secondaryColor={secondaryColor}
                />

                {/* Tabs */}
                <div className="bg-white p-1.5 rounded-[1.2rem] border border-slate-100 shadow-sm flex items-center">
                    <button
                        onClick={() => setActiveTab("PENDING")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === "PENDING" ? "bg-slate-900 text-white shadow-md scale-[1.02]" : "text-slate-400 hover:bg-slate-50"
                        )}
                        style={activeTab === "PENDING" ? {
                            background: `linear-gradient(135deg, ${safeBrandColor}, ${secondaryColor})`,
                            boxShadow: `0 4px 12px -2px ${safeBrandColor}40`
                        } : {}}
                    >
                        <Receipt className="h-4 w-4" />
                        Pending Dues
                    </button>
                    <button
                        onClick={() => setActiveTab("HISTORY")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === "HISTORY" ? "bg-slate-900 text-white shadow-md scale-[1.02]" : "text-slate-400 hover:bg-slate-50"
                        )}
                        style={activeTab === "HISTORY" ? {
                            background: `linear-gradient(135deg, ${safeBrandColor}, ${secondaryColor})`,
                            boxShadow: `0 4px 12px -2px ${safeBrandColor}40`
                        } : {}}
                    >
                        <History className="h-4 w-4" />
                        Payment History
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {activeTab === "PENDING" ? (
                            <motion.div
                                key="pending"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming Dues</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{pendingFees.length} Records</span>
                                </div>

                                {pendingFees.length === 0 ? (
                                    <EmptyState brandColor={safeBrandColor} />
                                ) : (
                                    pendingFees.map((fee: any, i: number) => (
                                        <FeeCard
                                            key={fee.id}
                                            fee={fee}
                                            index={i}
                                            brandColor={safeBrandColor}
                                            onPay={() => setSelectedFee(fee)}
                                        />
                                    ))
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{historyTransactions.length} Records</span>
                                </div>

                                {historyTransactions.length === 0 ? (
                                    <div className="bg-white rounded-[2rem] p-8 text-center border border-dashed border-slate-200">
                                        <p className="text-slate-400 text-xs font-bold">No payment history found.</p>
                                    </div>
                                ) : (
                                    historyTransactions.map((transaction: any, i: number) => (
                                        <PaymentHistoryCard
                                            key={transaction.id}
                                            transaction={transaction}
                                            index={i}
                                            brandColor={safeBrandColor}
                                        />
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>


            <AnimatePresence>
                {selectedFee && (
                    <PaymentModal
                        fee={selectedFee}
                        phone={phone}
                        onClose={() => setSelectedFee(null)}
                        onSuccess={handlePaymentSuccess}
                        brandColor={safeBrandColor}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}

// --- SUB COMPONENTS ---

function FinanceSummaryCard({ summary, brandColor, secondaryColor }: { summary: any, brandColor: string, secondaryColor: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-60 rounded-[2.5rem] p-7 sm:p-8 overflow-hidden shadow-2xl group border border-white/20"
            style={{
                background: `linear-gradient(135deg, ${brandColor}, ${secondaryColor})`,
                boxShadow: `0 20px 40px -10px ${brandColor}50`
            }}
        >
            {/* Decorative Blur Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/3 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-[40px] translate-y-1/3 -translate-x-1/3 mix-blend-overlay" />

            <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="inline-flex w-fit items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm mb-2">
                            <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em] leading-none">Total Balance</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none flex items-start gap-1">
                            <span className="text-xl sm:text-2xl mt-1 opacity-70">R</span>
                            {summary?.totalDue.toLocaleString() || "0"}
                        </h2>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.1)] shrink-0">
                        <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
                    <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/20 backdrop-blur-md shadow-inner flex flex-col justify-center">
                        <p className="text-[9px] sm:text-[10px] font-black text-white/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Paid YTD
                        </p>
                        <p className="text-lg sm:text-xl font-black leading-none tracking-tight">R{summary?.totalPaid.toLocaleString() || "0"}</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 sm:p-4 border border-white/20 backdrop-blur-md shadow-inner flex flex-col justify-center">
                        <p className="text-[9px] sm:text-[10px] font-black text-white/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Overdue
                        </p>
                        <p className="text-lg sm:text-xl font-black leading-none text-rose-100 tracking-tight">
                            {summary?.overdue || 0} Items
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function FeeCard({ fee, index, brandColor, onPay }: any) {
    const isOverdue = fee.status === "OVERDUE";
    const statusColor = isOverdue ? "text-rose-600 bg-rose-50 border-rose-100" : "text-indigo-600 bg-indigo-50 border-indigo-100";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 relative overflow-hidden group hover:shadow-xl transition-all"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                    <div
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border"
                        style={{
                            backgroundColor: isOverdue ? '#fff1f2' : `${brandColor}15`,
                            borderColor: isOverdue ? '#ffe4e6' : `${brandColor}30`
                        }}
                    >
                        <Receipt
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            style={{ color: isOverdue ? '#e11d48' : brandColor }}
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="font-black text-slate-800 text-base sm:text-lg tracking-tight leading-snug mb-1.5">{fee.title}</h4>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm",
                                statusColor
                            )}>
                                {fee.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                Due {format(new Date(fee.dueDate), "MMM do")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-400 mr-0.5">R</span>
                        {fee.amount.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-5 border-t border-slate-100/60">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Tuition & Fees</span>
                        <span>100%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: '0%', backgroundColor: brandColor }} />
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onPay}
                    className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-2 transition-all hover:opacity-90 active:scale-95 shrink-0"
                    style={{ backgroundColor: brandColor }}
                >
                    Pay Now
                    <ArrowRight className="h-4 w-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}

function PaymentHistoryCard({ transaction, index, brandColor }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/90 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-lg shadow-slate-200/40 flex items-center justify-between hover:shadow-xl transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="font-black text-slate-800 text-sm sm:text-base leading-tight">{transaction.feeTitle}</h4>
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {transaction.createdAt ? format(new Date(transaction.createdAt), "MMM do, yyyy") : "Unknown Date"}
                    </p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
                <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                    <span className="text-xs text-slate-400 mr-0.5">R</span>
                    {transaction.amount.toLocaleString()}
                </p>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/50 border border-emerald-200 px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                    {transaction.method || "PAID"}
                </span>
            </div>
        </motion.div>
    );
}

function EmptyState({ brandColor }: { brandColor: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-10 text-center border border-dashed border-slate-200">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${brandColor}10` }}
            >
                <CheckCircle className="h-8 w-8" style={{ color: brandColor }} />
            </div>
            <p className="text-slate-900 font-bold">All caught up!</p>
            <p className="text-slate-400 text-xs font-semibold mt-1">No pending fees at the moment.</p>
        </div>
    );
}

function PaymentModal({ fee, phone, onClose, onSuccess, brandColor }: any) {
    const [step, setStep] = useState<"METHOD" | "PROCESSING" | "SUCCESS">("METHOD");
    const [method, setMethod] = useState<string | null>(null);

    const handlePay = async () => {
        if (!method) return;
        setStep("PROCESSING");
        await new Promise(resolve => setTimeout(resolve, 2000));
        await recordPaymentAction(fee.id, fee.amount, method, `TXN-${Date.now()}`, phone);
        setStep("SUCCESS");
        setTimeout(onSuccess, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/50"
            >
                {step === "METHOD" && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Payment Details</h3>
                            <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="text-center mb-10 pb-8 border-b border-slate-100/60">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Amount due</p>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none flex items-start justify-center gap-1.5">
                                <span className="text-2xl text-slate-300 mt-1.5">R</span>
                                {fee.amount.toLocaleString()}
                            </h2>
                            <span className="inline-flex mt-4 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                                {fee.title}
                            </span>
                        </div>

                        <div className="space-y-3 mb-10">
                            <PaymentMethodOption icon={Smartphone} label="UPI Apps" subLabel="GPay, PhonePe" selected={method === "UPI"} onClick={() => setMethod("UPI")} brandColor={brandColor} />
                            <PaymentMethodOption icon={CreditCard} label="Cards" subLabel="Credit / Debit" selected={method === "CARD"} onClick={() => setMethod("CARD")} brandColor={brandColor} />
                            <PaymentMethodOption icon={Building} label="Net Banking" subLabel="All Banks" selected={method === "NETBANKING"} onClick={() => setMethod("NETBANKING")} brandColor={brandColor} />
                        </div>

                        <button
                            disabled={!method}
                            onClick={handlePay}
                            className="w-full py-4.5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest text-white shadow-lg shadow-slate-200/50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: brandColor,
                                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`
                            }}
                        >
                            Pay Securely
                            <ShieldCheck className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {step === "PROCESSING" && (
                    <div className="p-12 flex flex-col items-center justify-center text-center min-h-[460px]">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative h-20 w-20 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center border border-slate-50">
                                <Loader2 className="h-8 w-8 animate-spin" style={{ color: brandColor }} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Processing...</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Securely contacting gateway</p>
                    </div>
                )}

                {step === "SUCCESS" && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-12 flex flex-col items-center justify-center text-center min-h-[460px]"
                    >
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-40 animate-pulse" />
                            <div className="relative h-24 w-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-200/50">
                                <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3 leading-none">Payment Successful!</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-2">
                            REF: TXN-{Date.now().toString().slice(-6)}
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

function PaymentMethodOption({ icon: Icon, label, subLabel, selected, onClick, brandColor }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                selected ? "bg-white" : "border-slate-100 bg-white hover:border-slate-200"
            )}
            style={{ borderColor: selected ? brandColor : undefined }}
        >
            <div
                className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors"
                style={{ backgroundColor: selected ? brandColor : '#f1f5f9', color: selected ? 'white' : '#64748b' }}
            >
                <Icon className="h-6 w-6" />
            </div>
            <div className="text-left">
                <p className="font-black text-sm text-slate-900">{label}</p>
                <p className="text-xs font-bold text-slate-400">{subLabel}</p>
            </div>
            {selected && (
                <div className="ml-auto">
                    <CheckCircle className="h-5 w-5" style={{ color: brandColor }} />
                </div>
            )}
        </button>
    );
}
