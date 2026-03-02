'use client';

import { useState } from "react";
import { X, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { createTransactionAction } from "@/app/actions/account-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddTransactionDrawerProps {
    slug: string;
    financialYears: { id: string; name: string; isActive: boolean }[];
    categories: { id: string; name: string; type: string }[];
    vendors: { id: string; name: string }[];
    onSuccess?: () => void;
}

const PAYMENT_METHODS = [
    { value: 'CASH', label: '💵 Cash' },
    { value: 'UPI', label: '📱 UPI' },
    { value: 'BANK_TRANSFER', label: '🏦 Bank Transfer' },
    { value: 'CHEQUE', label: '📄 Cheque' },
    { value: 'ONLINE', label: '🌐 Online' },
];

export default function AddTransactionDrawer({ slug, financialYears, categories, vendors, onSuccess }: AddTransactionDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const activeYear = financialYears.find(y => y.isActive) || financialYears[0];

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'DEBIT' as 'CREDIT' | 'DEBIT',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        referenceNo: '',
        status: 'COMPLETED',
        financialYearId: activeYear?.id || '',
        categoryId: '',
        vendorId: '',
    });

    const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Description is required"); return; }
        if (!form.amount || isNaN(Number(form.amount))) { toast.error("Valid amount is required"); return; }
        if (!form.financialYearId) { toast.error("Please select a financial year"); return; }

        setLoading(true);
        try {
            const res = await createTransactionAction(slug, {
                title: form.title,
                description: form.description,
                type: form.type as any,
                amount: parseFloat(form.amount),
                date: new Date(form.date),
                paymentMethod: form.paymentMethod as any,
                referenceNo: form.referenceNo,
                status: form.status as any,
                financialYearId: form.financialYearId,
                categoryId: form.categoryId || undefined as any,
                vendorId: form.vendorId || undefined,
            });

            if (res.success) {
                setSuccess(true);
                toast.success("Transaction recorded successfully!");
                setTimeout(() => {
                    setSuccess(false);
                    setIsOpen(false);
                    setForm(prev => ({ ...prev, title: '', description: '', amount: '', referenceNo: '' }));
                    onSuccess?.();
                }, 1500);
            } else {
                toast.error(res.error || "Failed to record transaction");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-zinc-900/20"
            >
                <Plus className="h-4 w-4" />
                Record Entry
            </button>

            {/* Drawer overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-5 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900">Record Transaction</h2>
                                <p className="text-xs text-zinc-500 font-medium mt-0.5">Add a new financial entry to the ledger</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors" title="Close">
                                <X className="h-5 w-5 text-zinc-400" />
                            </button>
                        </div>

                        {success ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <div className="p-4 bg-emerald-100 rounded-full animate-bounce">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                </div>
                                <p className="font-black text-zinc-900 text-lg">Transaction Recorded!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Type toggle */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['DEBIT', 'CREDIT'] as const).map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => set('type', t)}
                                                className={cn(
                                                    "py-3 rounded-xl font-black text-sm transition-all border-2",
                                                    form.type === t
                                                        ? t === 'DEBIT'
                                                            ? "bg-red-600 border-red-600 text-white shadow-lg"
                                                            : "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                                                        : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                                                )}
                                            >
                                                {t === 'DEBIT' ? '↓ Expense' : '↑ Income'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Description *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                        placeholder="e.g. Electricity Bill - March"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                                        required
                                        title="Transaction description"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Amount *</label>
                                    <input
                                        type="number"
                                        value={form.amount}
                                        onChange={e => set('amount', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                                        required
                                        title="Amount"
                                    />
                                </div>

                                {/* Date + Status row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Date *</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => set('date', e.target.value)}
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                                            title="Transaction date"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Status</label>
                                        <select
                                            value={form.status}
                                            onChange={e => set('status', e.target.value)}
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white"
                                            title="Status"
                                        >
                                            <option value="COMPLETED">✓ Completed</option>
                                            <option value="PENDING">⏳ Pending</option>
                                            <option value="CANCELLED">✕ Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={e => set('categoryId', e.target.value)}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white"
                                        title="Category"
                                    >
                                        <option value="">— No Category —</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Financial Year */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Financial Year *</label>
                                    <select
                                        value={form.financialYearId}
                                        onChange={e => set('financialYearId', e.target.value)}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white"
                                        title="Financial Year"
                                        required
                                    >
                                        <option value="">Select Financial Year</option>
                                        {financialYears.map(fy => (
                                            <option key={fy.id} value={fy.id}>{fy.name}{fy.isActive ? ' ★ (Active)' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PAYMENT_METHODS.map(pm => (
                                            <button
                                                key={pm.value}
                                                type="button"
                                                onClick={() => set('paymentMethod', pm.value)}
                                                className={cn(
                                                    "py-2.5 px-3 rounded-xl font-bold text-sm transition-all border-2 text-left",
                                                    form.paymentMethod === pm.value
                                                        ? "bg-zinc-900 border-zinc-900 text-white"
                                                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                                )}
                                            >
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vendor */}
                                {vendors.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Vendor (Optional)</label>
                                        <select
                                            value={form.vendorId}
                                            onChange={e => set('vendorId', e.target.value)}
                                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 bg-white"
                                            title="Vendor"
                                        >
                                            <option value="">— No Vendor —</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Reference + Notes */}
                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Reference No.</label>
                                    <input
                                        type="text"
                                        value={form.referenceNo}
                                        onChange={e => set('referenceNo', e.target.value)}
                                        placeholder="Invoice / Cheque No."
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
                                        title="Reference number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Notes</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 resize-none"
                                        title="Notes"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                                        form.type === 'DEBIT'
                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                                    )}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Recording..." : `Record ${form.type === 'DEBIT' ? 'Expense' : 'Income'}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
