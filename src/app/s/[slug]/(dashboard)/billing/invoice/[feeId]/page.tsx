"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Printer, ShieldCheck, Mail, Phone, MapPin, Banknote, X, Loader2 } from "lucide-react";
import { getFeeDetailsForInvoiceAction } from "@/app/actions/billing-actions";
import { recordPaymentAction } from "@/app/actions/fee-actions";
import { format } from "date-fns";
import { useSidebar } from "@/context/SidebarContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InvoicePrintPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const feeId = params.feeId as string;

    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [paymentReference, setPaymentReference] = useState("");
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    const componentRef = useRef<HTMLDivElement>(null);
    const { currency } = useSidebar();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice_${invoiceData?.student?.firstName}_${feeId.slice(-6)}`,
    });

    useEffect(() => {
        loadInvoice();
    }, [slug, feeId]);

    async function loadInvoice() {
        setIsLoading(true);
        const res = await getFeeDetailsForInvoiceAction(slug, feeId);
        if (res.success && res.data) {
            setInvoiceData(res.data);

            // Pre-calculate balance to default payment amount
            const totalPaid = res.data.fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
            const balance = res.data.fee.amount - totalPaid;
            setPaymentAmount(balance.toString());
        } else {
            console.error(res.error);
        }
        setIsLoading(false);
    }

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(paymentAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setIsSubmittingPayment(true);
        const res = await recordPaymentAction(
            slug,
            feeId,
            amt,
            paymentMethod,
            paymentReference || "Manual Payment",
            new Date(paymentDate)
        );

        if (res.success) {
            toast.success("Payment recorded successfully!");
            setIsPaymentModalOpen(false);
            setPaymentReference("");
            loadInvoice(); // Refresh the data to show updated balances
        } else {
            toast.error(res.error || "Failed to record payment");
        }
        setIsSubmittingPayment(false);
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50 tracking-widest text-xs font-black uppercase text-zinc-400">Loading Invoice...</div>;
    }

    if (!invoiceData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 space-y-4">
                <p className="font-bold text-zinc-500">Invoice not found</p>
                <button onClick={() => router.back()} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold">Go Back</button>
            </div>
        );
    }

    const { fee, student, school } = invoiceData;
    const totalPaid = fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
    const balance = fee.amount - totalPaid;

    return (
        <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:px-8 font-sans relative">

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-brand" />
                                Record Payment
                            </h2>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                                        {currency}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={balance}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900 transition-shadow"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-zinc-400 text-right mt-1">Remaining balance: {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900 transition-shadow"
                                    required
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                                    <option value="CARD">Credit / Debit Card</option>
                                    <option value="UPI">UPI / Mobile Payment</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Reference / Notes</label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder="e.g. Transaction ID, UTR"
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900 transition-shadow"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Date</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium text-zinc-900 transition-shadow"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPayment}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-zinc-900 font-bold text-sm hover:brightness-110 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingPayment ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                    ) : (
                                        "Confirm Payment"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden flex-wrap gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-zinc-200 bg-white font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <div className="flex gap-3">
                    {balance > 0 && (
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-brand text-zinc-900 font-bold text-sm hover:brightness-110 transition-all shadow-sm"
                        >
                            <Banknote className="h-4 w-4" />
                            Record Payment
                        </button>
                    )}
                    <button
                        onClick={() => handlePrint()}
                        className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-zinc-900 font-bold text-sm text-white hover:bg-black transition-colors shadow-md"
                    >
                        <Printer className="h-4 w-4" />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* A4 Paper Container */}
            <div
                ref={componentRef}
                className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-full"
                style={{ minHeight: '1056px', padding: '3rem 4rem' }} // Approx A4 ratio
            >
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-8">
                    <div className="flex gap-4 items-center">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="h-20 w-auto object-contain" />
                        ) : (
                            <div className="h-20 w-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
                                <ShieldCheck className="h-10 w-10" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{school.name}</h1>
                            <div className="mt-2 space-y-1 text-xs text-zinc-500 font-medium">
                                {school.address && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {school.address}</p>}
                                {school.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {school.phone}</p>}
                                {school.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {school.email}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-zinc-200 uppercase tracking-widest mb-2">INVOICE</h2>
                        <p className="text-sm font-bold text-zinc-800">INV-{fee.id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-zinc-500 mt-1">Date: {format(new Date(), "MMM dd, yyyy")}</p>
                    </div>
                </div>

                {/* Bill To Info */}
                <div className="flex justify-between items-end mb-12">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Bill To</p>
                        <h3 className="text-lg font-black text-zinc-900">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-zinc-600 font-medium">ID: {student.admissionNumber || student.id.slice(-8)}</p>
                        <p className="text-sm text-zinc-600 font-medium">Class: {student.classroom?.name || student.grade}</p>
                        <p className="text-sm text-zinc-600 font-medium mt-2">{student.fatherName || student.motherName} (Parent)</p>
                    </div>
                    <div className="text-right p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Due Date</p>
                        <p className="text-lg font-black text-zinc-900">{format(new Date(fee.dueDate), "MMM dd, yyyy")}</p>
                        <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border"
                            style={{
                                borderColor: fee.status === 'PAID' ? '#10b981' : fee.status === 'PARTIAL' ? '#3b82f6' : '#ef4444',
                                color: fee.status === 'PAID' ? '#10b981' : fee.status === 'PARTIAL' ? '#3b82f6' : '#ef4444',
                                backgroundColor: fee.status === 'PAID' ? '#d1fae5' : fee.status === 'PARTIAL' ? '#dbeafe' : '#fee2e2'
                            }}
                        >
                            {fee.status}
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-zinc-200">
                            <th className="py-3 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</th>
                            <th className="py-3 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-zinc-100">
                            <td className="py-4">
                                <p className="font-bold text-zinc-900">{fee.title}</p>
                                {fee.description && <p className="text-xs text-zinc-500 mt-0.5">{fee.description}</p>}
                                {fee.academicYear && <p className="text-xs text-zinc-400 mt-0.5 italic">Academic Year {fee.academicYear.name}</p>}
                            </td>
                            <td className="py-4 text-right font-bold text-zinc-900">
                                {currency}{fee.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Payment History & Totals */}
                <div className="flex justify-between items-start mt-8">
                    <div className="w-1/2 pr-8">
                        {fee.payments && fee.payments.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-200 pb-2">Payment History</p>
                                <div className="space-y-3">
                                    {fee.payments.map((p: any) => (
                                        <div key={p.id} className="flex flex-col gap-1 text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-zinc-500 font-bold tracking-tight">{format(new Date(p.date || p.createdAt), "MMM dd, yyyy")}</span>
                                                <span className="font-bold text-emerald-600">+{currency}{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-zinc-400">
                                                <span className="capitalize">{p.method.replace('_', ' ').toLowerCase()}</span>
                                                <span className="font-mono text-[10px]">{p.reference || "Manual"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-1/3 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-zinc-500">Subtotal</span>
                            <span className="text-sm font-bold text-zinc-900">{currency}{fee.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-4">
                            <span className="text-sm font-bold text-emerald-600">Total Paid</span>
                            <span className="text-sm font-bold text-emerald-600">-{currency}{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-base font-black text-zinc-900">Amount Due</span>
                            <span className="text-xl font-black text-zinc-900">{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-24 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400 font-medium">
                    <p>Thank you for your business. Please retain this receipt for your records.</p>
                    <p className="mt-1">If you have any questions concerning this invoice, contact our administration office.</p>
                </div>
            </div>
        </div>
    );
}
