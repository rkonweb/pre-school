'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Building2, User, Mail, Phone, MapPin, FileText, Landmark, Globe, Tag, CreditCard, Building } from 'lucide-react';
import { getSchoolIdBySlug, createAccountVendor } from '@/app/actions/account-actions';
import { toast } from 'sonner';

const VENDOR_CATEGORIES = ['Utilities', 'Stationery & Supplies', 'Catering & Food', 'Maintenance', 'IT & Technology', 'Transport', 'Security', 'Furniture & Equipment', 'Printing & Media', 'Consultancy', 'Other'];

export default function NewVendorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const [schoolId, setSchoolId] = useState('');
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        // Basic Info
        name: '',
        category: '',
        status: 'ACTIVE',
        // Contact
        contactName: '',
        email: '',
        phone: '',
        website: '',
        // Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        // Financial
        taxId: '',
        pan: '',
        bankName: '',
        accountNo: '',
        ifsc: '',
        bankBranch: '',
        // Other
        paymentTerms: 'Net 30',
        notes: '',
    });

    useEffect(() => {
        getSchoolIdBySlug(slug).then(sid => { if (sid) setSchoolId(sid); });
    }, [slug]);

    const setField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!schoolId) return;
        setSaving(true);
        try {
            // Combine bank details into single field and address parts
            const bankDetails = [form.bankName, form.accountNo, form.ifsc, form.bankBranch].filter(Boolean).join(' | ');
            const fullAddress = [form.address, form.city, form.state, form.pincode].filter(Boolean).join(', ');
            const notes = [
                form.pan ? `PAN: ${form.pan}` : '',
                form.website ? `Website: ${form.website}` : '',
                form.paymentTerms ? `Payment Terms: ${form.paymentTerms}` : '',
                form.notes,
            ].filter(Boolean).join('\n');

            await createAccountVendor(schoolId, {
                name: form.name,
                contactName: form.contactName || undefined,
                email: form.email || undefined,
                phone: form.phone || undefined,
                address: fullAddress || undefined,
                taxId: form.taxId || undefined,
                bankDetails: bankDetails || undefined,
                notes: notes || undefined,
                category: form.category || undefined,
                status: form.status,
            } as any);

            toast.success('Vendor saved successfully!');
            router.push(`/s/${slug}/accounts/vendors`);
            router.refresh(); // Ensure the vendor list fetches new data
        } catch (err: any) {
            toast.error(err.message || 'Failed to save vendor.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20" suppressHydrationWarning>
            {/* Breadcrumbs & Header */}
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
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Add New Vendor</h1>
                        <p className="mt-1 text-sm font-medium text-zinc-500">Register a vendor or payee for expense tracking</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Form Fields (Left Column) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Basic Information */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                                <Building className="w-5 h-5 text-brand" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Company Info</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Vendor / Company Name <span className="text-red-500">*</span></label>
                                <input
                                    required value={form.name} onChange={e => setField('name', e.target.value)}
                                    placeholder="e.g. City Electricity Board, ABC Stationery Pvt Ltd"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            value={form.category} onChange={e => setField('category', e.target.value)}
                                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 appearance-none outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all cursor-pointer"
                                        >
                                            <option value="">Select category...</option>
                                            {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                            <ArrowLeft className="h-4 w-4 -rotate-90 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                                    <div className="relative">
                                        <select
                                            value={form.status} onChange={e => setField('status', e.target.value)}
                                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 appearance-none outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all cursor-pointer"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                            <ArrowLeft className="h-4 w-4 -rotate-90 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Contact Person</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Contact Person Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={form.contactName} onChange={e => setField('contactName', e.target.value)}
                                        placeholder="Primary contact person at the vendor"
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                                            placeholder="vendor@company.com"
                                            data-lpignore="true" suppressHydrationWarning
                                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                            data-lpignore="true" suppressHydrationWarning
                                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="url" value={form.website} onChange={e => setField('website', e.target.value)}
                                        placeholder="https://vendor-website.com"
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-green-500" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Address Details</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Street Address</label>
                                <textarea
                                    value={form.address} onChange={e => setField('address', e.target.value)} rows={2}
                                    placeholder="Building, Street, Area"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand resize-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">City</label>
                                    <input
                                        value={form.city} onChange={e => setField('city', e.target.value)} placeholder="e.g. Mumbai"
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">State</label>
                                    <input
                                        value={form.state} onChange={e => setField('state', e.target.value)} placeholder="e.g. Maharashtra"
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">PIN Code</label>
                                    <input
                                        value={form.pincode} onChange={e => setField('pincode', e.target.value)} placeholder="400001"
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Secondary Form Fields (Right Column) */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Financial/Tax Settings */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-500" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Tax & Bank</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">GST Number</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={form.taxId} onChange={e => setField('taxId', e.target.value.toUpperCase())}
                                        placeholder="22AAAAA0000A1Z5" maxLength={15}
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold font-mono text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">PAN Number</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        value={form.pan} onChange={e => setField('pan', e.target.value.toUpperCase())}
                                        placeholder="AAAAA0000A" maxLength={10}
                                        data-lpignore="true" suppressHydrationWarning
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold font-mono text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all uppercase"
                                    />
                                </div>
                            </div>

                            <hr className="border-zinc-100 my-4" />

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Bank Name</label>
                                <input
                                    value={form.bankName} onChange={e => setField('bankName', e.target.value)}
                                    placeholder="e.g. State Bank of India"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Account Number</label>
                                <input
                                    value={form.accountNo} onChange={e => setField('accountNo', e.target.value)}
                                    placeholder="000011112222"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold font-mono text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">IFSC Code</label>
                                <input
                                    value={form.ifsc} onChange={e => setField('ifsc', e.target.value.toUpperCase())}
                                    placeholder="SBIN0001234" maxLength={11}
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold font-mono text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Internal Terms & Notes */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden">
                        <div className="flex items-center gap-3 px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Internal Details</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Payment Terms</label>
                                <div className="relative">
                                    <select
                                        value={form.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)}
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 appearance-none outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all cursor-pointer"
                                    >
                                        <option>Immediate</option>
                                        <option>Net 7</option>
                                        <option>Net 15</option>
                                        <option>Net 30</option>
                                        <option>Net 45</option>
                                        <option>Net 60</option>
                                        <option>Monthly</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                        <ArrowLeft className="h-4 w-4 -rotate-90 text-zinc-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Private Notes</label>
                                <textarea
                                    value={form.notes} onChange={e => setField('notes', e.target.value)} rows={4}
                                    placeholder="Notes only visible to admins..."
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand resize-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button Block */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-6 flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand font-black text-white px-8 py-4 transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                <div className="relative h-full w-8 bg-white/20" />
                            </div>
                            {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving Vendor...</> : "Record Vendor Database"}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
}
