'use client';

import { useState, use, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Receipt, Tag, CreditCard, FileText, TrendingUp, TrendingDown, Calendar, Hash, IndianRupee, Info, Plus, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { TransactionType, PaymentMethod } from '@/lib/types/accounts';
import {
    getSchoolIdBySlug,
    getAccountCategories,
    getAccountVendors,
    getFinancialYears,
    createTransaction,
} from '@/app/actions/account-actions';
import { getCurrentUserAction } from '@/app/actions/session-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
    { value: PaymentMethod.CASH, label: 'Cash', icon: IndianRupee },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Bank', icon: Landmark },
    { value: PaymentMethod.UPI, label: 'UPI', icon: SmartphoneIcon },
    { value: PaymentMethod.ONLINE, label: 'Online', icon: Globe },
    { value: PaymentMethod.CHEQUE, label: 'Cheque', icon: FileText },
];

function Landmark(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18" /><path d="m6 18 1.7-12L12 2l4.3 4L18 18" /><path d="M19 22V18" /><path d="M5 22V18" /><path d="M11 22v-4" /><path d="M15 22v-4" /></svg> }
function SmartphoneIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg> }
function Globe(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> }

function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />;
}

export default function NewTransactionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { currency } = useSidebar();

    const [schoolId, setSchoolId] = useState('');
    const [userId, setUserId] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        amount: '',
        type: TransactionType.DEBIT as TransactionType,
        paymentMethod: PaymentMethod.CASH as PaymentMethod,
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        vendorId: '',
        financialYearId: '',
        referenceNo: '',
        chequeNo: '',
        notes: '',
    });

    const setField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const sid = await getSchoolIdBySlug(slug);
                if (!sid) { toast.error("School not found"); return; }
                setSchoolId(sid);
                const user = await getCurrentUserAction();
                setUserId((user as any)?.data?.id || '');
                const [cats, vends, yrs] = await Promise.all([
                    getAccountCategories(sid),
                    getAccountVendors(sid),
                    getFinancialYears(sid),
                ]);
                setCategories(cats);
                setVendors(vends);
                setYears(yrs);
                const active = yrs.find((y: any) => y.isActive);
                if (active) setField('financialYearId', active.id);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const filteredCategories = categories.filter(c => c.type === form.type);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.categoryId) { toast.error('Please select a category.'); return; }
        if (!form.financialYearId) { toast.error('Please select a financial year.'); return; }
        if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Please enter a valid amount.'); return; }

        setSaving(true);
        try {
            await createTransaction(schoolId, userId, {
                title: form.title,
                amount: parseFloat(form.amount),
                type: form.type,
                paymentMethod: form.paymentMethod,
                date: new Date(form.date),
                categoryId: form.categoryId,
                financialYearId: form.financialYearId,
                vendorId: form.vendorId || undefined,
                referenceNo: form.referenceNo || undefined,
                notes: [
                    form.description,
                    form.chequeNo ? `Cheque No: ${form.chequeNo}` : '',
                    form.notes,
                ].filter(Boolean).join('\n') || undefined,
            } as any);
            toast.success('Transaction recorded successfully!');
            router.push(`/s/${slug}/accounts/transactions`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save transaction.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-slate-50" suppressHydrationWarning>
            <div className="p-6 md:p-8 space-y-8 pb-20">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        <Link href={`/s/${slug}/accounts`} className="hover:text-brand transition-colors">Accounts</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/s/${slug}/accounts/transactions`} className="hover:text-brand transition-colors">Transactions</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-800">New Entry</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                title="Go back"
                                className="group flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand/40 hover:bg-brand/5 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-brand" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <Receipt className="h-6 w-6 text-orange-500" />
                                    Record Entry
                                </h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Log a new financial movement into your system</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6" suppressHydrationWarning>

                    <div className="lg:col-span-2 space-y-6">

                        {/* Primary Details Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    Core Information
                                </h3>
                                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => { setField('type', TransactionType.DEBIT); setField('categoryId', ''); }}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            form.type === TransactionType.DEBIT
                                                ? "bg-white text-red-600 shadow-sm border border-slate-200/50"
                                                : "text-slate-500 hover:text-red-500"
                                        )}
                                    >
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setField('type', TransactionType.CREDIT); setField('categoryId', ''); }}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            form.type === TransactionType.CREDIT
                                                ? "bg-white text-green-600 shadow-sm border border-slate-200/50"
                                                : "text-slate-500 hover:text-green-600"
                                        )}
                                    >
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Income
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Transaction Title</label>
                                    <div suppressHydrationWarning>
                                        <input
                                            required
                                            value={form.title}
                                            onChange={e => setField('title', e.target.value)}
                                            data-lpignore="true"
                                            suppressHydrationWarning
                                            placeholder="e.g. Staff Salary Disbursement"
                                            className="w-full text-base font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                                                <span className="text-slate-600 font-bold text-sm">{currency}</span>
                                            </div>
                                            <input
                                                required type="number" step="0.01"
                                                value={form.amount}
                                                onChange={e => setField('amount', e.target.value)}
                                                placeholder="0.00"
                                                className="w-full text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-300 placeholder:font-normal"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required type="date"
                                                value={form.date}
                                                onChange={e => setField('date', e.target.value)}
                                                suppressHydrationWarning
                                                className="w-full text-base font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categorization Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-white">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-purple-500" />
                                    Categorization
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                    {loading ? <Skeleton className="h-[50px] rounded-xl" /> : (
                                        <select
                                            required
                                            value={form.categoryId}
                                            aria-label="Transaction Category"
                                            onChange={e => setField('categoryId', e.target.value)}
                                            className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Category</option>
                                            {filteredCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Financial Year</label>
                                    {loading ? <Skeleton className="h-[50px] rounded-xl" /> : (
                                        <select
                                            required
                                            value={form.financialYearId}
                                            aria-label="Financial Year"
                                            onChange={e => setField('financialYearId', e.target.value)}
                                            className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none cursor-pointer"
                                        >
                                            {years.map(y => (
                                                <option key={y.id} value={y.id}>{y.name}{y.isActive ? ' (Active)' : ''}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Vendor / Payee (Optional)</label>
                                    {loading ? <Skeleton className="h-[50px] rounded-xl" /> : (
                                        <select
                                            value={form.vendorId}
                                            aria-label="Vendor / Payee"
                                            onChange={e => setField('vendorId', e.target.value)}
                                            className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">No specific vendor</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-white">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                    Payment Channel
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {PAYMENT_METHODS.map(m => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.value} type="button"
                                                onClick={() => setField('paymentMethod', m.value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                                    form.paymentMethod === m.value
                                                        ? "border-brand bg-brand/5 shadow-sm"
                                                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                                                )}
                                            >
                                                <Icon className={cn("w-5 h-5", form.paymentMethod === m.value ? "text-brand" : "text-slate-400")} />
                                                <span className={cn("text-[11px] font-bold tracking-wide", form.paymentMethod === m.value ? "text-brand" : "text-slate-500")}>
                                                    {m.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ref / Invoice No</label>
                                        <div className="relative" suppressHydrationWarning>
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={form.referenceNo}
                                                onChange={e => setField('referenceNo', e.target.value)}
                                                data-lpignore="true"
                                                suppressHydrationWarning
                                                placeholder="e.g. INV-2025-001"
                                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>
                                    </div>
                                    {form.paymentMethod === PaymentMethod.CHEQUE && (
                                        <div className="space-y-1.5" suppressHydrationWarning>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Cheque Number</label>
                                            <input
                                                value={form.chequeNo}
                                                onChange={e => setField('chequeNo', e.target.value)}
                                                data-lpignore="true"
                                                suppressHydrationWarning
                                                placeholder="6-digit no"
                                                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Summary Sticky Card */}
                        <div className="sticky top-6 space-y-6">
                            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Preview</h3>
                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount to Record</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black tabular-nums tracking-tight">{currency}{form.amount || '0'}</span>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider", form.type === TransactionType.DEBIT ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400")}>
                                                {form.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-5 border-t border-slate-700/50">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Category</span>
                                            <span className="text-slate-100 font-semibold">{categories.find(c => c.id === form.categoryId)?.name || '--'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Method</span>
                                            <span className="text-slate-100 font-semibold">{form.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Date</span>
                                            <span className="text-slate-100 font-semibold">{form.date}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving || !form.title || !form.amount || !form.categoryId}
                                        className="w-full mt-6 py-3.5 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand/20 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                Save Transaction
                                                <Plus className="w-4 h-4 ml-1 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <h3 className="font-bold text-sm text-slate-800">Remarks</h3>
                                </div>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setField('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Internal notes or context..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
