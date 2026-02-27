"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Printer, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { getFeeDetailsForInvoiceAction } from "@/app/actions/billing-actions";
import { format } from "date-fns";
import { useSidebar } from "@/context/SidebarContext";

export default function InvoicePrintPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const feeId = params.feeId as string;

    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
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
        if (res.success) {
            setInvoiceData(res.data);
        } else {
            console.error(res.error);
        }
        setIsLoading(false);
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
        <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:px-8 font-sans">
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-zinc-200 bg-white font-bold text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <button
                    onClick={() => handlePrint()}
                    className="flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-zinc-900 font-bold text-sm text-white hover:bg-black transition-colors shadow-md"
                >
                    <Printer className="h-4 w-4" />
                    Print / PDF
                </button>
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
                                <div className="space-y-2">
                                    {fee.payments.map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-600">{format(new Date(p.date || p.createdAt), "MMM dd, yyyy")} - {p.method}</span>
                                            <span className="font-bold text-zinc-900">{currency}{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
