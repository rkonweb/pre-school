'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Loader2, Building2, User, Mail, Phone, MapPin,
    FileText, Tag, Landmark, Save, Trash2,
    CheckCircle2, XCircle, TrendingUp, TrendingDown, Receipt
} from 'lucide-react';
import { getAccountVendorById, updateAccountVendor, deleteAccountVendor } from '@/app/actions/account-actions';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VENDOR_CATEGORIES = [
    'Utilities', 'Stationery & Supplies', 'Catering & Food', 'Maintenance',
    'IT & Technology', 'Transport', 'Security', 'Furniture & Equipment',
    'Printing & Media', 'Consultancy', 'Other'
];

type Txn = {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string | Date;
    status: string;
};

type Vendor = {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    taxId?: string | null;
    bankDetails?: string | null;
    notes?: string | null;
    category?: string | null;
    status: string;
    createdAt: string | Date;
    transactions?: Txn[];
};

export default function VendorDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params);
    const router = useRouter();

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '', contactName: '', email: '', phone: '',
        address: '', taxId: '', bankDetails: '', notes: '',
        category: '', status: 'ACTIVE',
    });

    useEffect(() => {
        getAccountVendorById(id).then(v => {
            if (!v) { toast.error('Vendor not found'); router.back(); return; }
            setVendor(v as Vendor);
            setForm({
                name: v.name ?? '',
                contactName: v.contactName ?? '',
                email: v.email ?? '',
                phone: v.phone ?? '',
                address: v.address ?? '',
                taxId: v.taxId ?? '',
                bankDetails: v.bankDetails ?? '',
                notes: v.notes ?? '',
                category: v.category ?? '',
                status: v.status ?? 'ACTIVE',
            });
            setLoading(false);
        });
    }, [id]);

    const setField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateAccountVendor(id, {
                name: form.name,
                contactName: form.contactName || null,
                email: form.email || null,
                phone: form.phone || null,
                address: form.address || null,
                taxId: form.taxId || null,
                bankDetails: form.bankDetails || null,
                notes: form.notes || null,
                category: form.category || null,
                status: form.status as any,
            } as any);
            toast.success('Vendor updated!');
            router.push(`/s/${slug}/accounts/vendors`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update vendor');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm(`Delete "${vendor?.name}"? This cannot be undone.`)) return;
        try {
            await deleteAccountVendor(id, slug);
            toast.success('Vendor deleted');
            router.push(`/s/${slug}/accounts/vendors`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete vendor');
        }
    }

    const totalSpend = vendor?.transactions?.reduce((sum, t) => t.type === 'DEBIT' ? sum + t.amount : sum, 0) ?? 0;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-sm text-zinc-500 animate-pulse font-medium">Loading vendor...</p>
                </div>
            </div>
        );
    }

    const inputClass = "w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all";
    const labelClass = "block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2";

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20" suppressHydrationWarning>

            {/* Back + Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="group mb-4 flex w-fit items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-900"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-[0.85rem] border border-zinc-200 bg-white transition-all group-hover:scale-105 group-hover:border-zinc-300 group-hover:shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span>Back to Vendors</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-900">{vendor?.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {form.status === 'ACTIVE' ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-black text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                                        <XCircle className="w-3 h-3" /> Inactive
                                    </span>
                                )}
                                {vendor?.category && (
                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                        {vendor.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {vendor?.transactions && vendor.transactions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Transactions</p>
                        <p className="text-2xl font-black text-zinc-900">{vendor.transactions.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Spend</p>
                        <p className="text-2xl font-black text-red-600">₹{totalSpend.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Added On</p>
                        <p className="text-base font-black text-zinc-700">
                            {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSave} suppressHydrationWarning>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left — Edit Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Company Info */}
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                            <div className="flex items-center gap-3 px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-brand" />
                                </div>
                                <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Company Info</h2>
                            </div>
                            <div className="p-8 space-y-5">
                                <div>
                                    <label className={labelClass}>Vendor / Company Name <span className="text-red-500">*</span></label>
                                    <input required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. City Electricity Board" suppressHydrationWarning className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select value={form.category} onChange={e => setField('category', e.target.value)} title="Category" className={inputClass}>
                                            <option value="">Select category...</option>
                                            {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <select value={form.status} onChange={e => setField('status', e.target.value)} title="Status" className={inputClass}>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                            <div className="flex items-center gap-3 px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-500" />
                                </div>
                                <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Contact Person</h2>
                            </div>
                            <div className="p-8 space-y-5">
                                <div>
                                    <label className={labelClass}>Contact Person Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input value={form.contactName} onChange={e => setField('contactName', e.target.value)} placeholder="Primary contact" suppressHydrationWarning className={`${inputClass} pl-11`} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="vendor@company.com" suppressHydrationWarning className={`${inputClass} pl-11`} />
                                        </div>
                                    </div>
                                    <div>
                                        <PhoneInput
                                            label="Phone"
                                            value={form.phone}
                                            onChange={val => setField('phone', val)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                                        <textarea value={form.address} onChange={e => setField('address', e.target.value)} rows={2} placeholder="Full address" suppressHydrationWarning className={`${inputClass} pl-11 resize-none`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tax & Bank */}
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                            <div className="flex items-center gap-3 px-8 py-5 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                </div>
                                <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Tax & Bank Details</h2>
                            </div>
                            <div className="p-8 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>GST / Tax ID</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input value={form.taxId} onChange={e => setField('taxId', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} suppressHydrationWarning className={`${inputClass} pl-11 font-mono uppercase`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Bank Details</label>
                                        <div className="relative">
                                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input value={form.bankDetails} onChange={e => setField('bankDetails', e.target.value)} placeholder="Bank | Acc No | IFSC" suppressHydrationWarning className={`${inputClass} pl-11`} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Private Notes</label>
                                    <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3} placeholder="Notes only visible to admins..." suppressHydrationWarning className={`${inputClass} resize-none`} />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand font-black text-white px-8 py-4 transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
                        </button>
                    </div>

                    {/* Right — Transaction History */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden sticky top-6">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-amber-500" />
                                </div>
                                <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Transaction History</h2>
                            </div>
                            <div className="divide-y divide-zinc-50 max-h-[500px] overflow-y-auto">
                                {vendor?.transactions && vendor.transactions.length > 0 ? (
                                    vendor.transactions.map(t => (
                                        <div key={t.id} className="px-6 py-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                                    t.type === 'DEBIT' ? "bg-red-50" : "bg-emerald-50"
                                                )}>
                                                    {t.type === 'DEBIT'
                                                        ? <TrendingDown className="w-4 h-4 text-red-500" />
                                                        : <TrendingUp className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-zinc-900 truncate">{t.description}</p>
                                                    <p className="text-[10px] text-zinc-400">
                                                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-black shrink-0",
                                                t.type === 'DEBIT' ? "text-red-600" : "text-emerald-600"
                                            )}>
                                                {t.type === 'DEBIT' ? '-' : '+'}₹{t.amount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-12 text-center">
                                        <Receipt className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-zinc-400">No transactions yet</p>
                                        <p className="text-xs text-zinc-300 mt-1">Transactions linked to this vendor will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
