'use client';

import { useState, use, useEffect } from 'react';
import { Plus, X, Loader2, Tags, CalendarDays, CheckCircle2, CircleDashed } from 'lucide-react';
import { TransactionType } from '@/lib/types/accounts';
import {
    getSchoolIdBySlug,
    getAccountCategories,
    getFinancialYears,
    createAccountCategory,
    createFinancialYear,
} from '@/app/actions/account-actions';
import { toast } from 'sonner';

export default function AccountsSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [categories, setCategories] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [schoolId, setSchoolId] = useState('');
    const [loading, setLoading] = useState(true);

    const [showCatModal, setShowCatModal] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [catForm, setCatForm] = useState({ name: '', type: TransactionType.DEBIT, description: '' });
    const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '' });

    useEffect(() => {
        async function load() {
            setLoading(true);
            const sid = await getSchoolIdBySlug(slug);
            if (!sid) { setLoading(false); return; }
            setSchoolId(sid);
            const [cats, yrs] = await Promise.all([getAccountCategories(sid), getFinancialYears(sid)]);
            setCategories(cats); setYears(yrs);
            setLoading(false);
        }
        load();
    }, [slug]);

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await createAccountCategory(schoolId, catForm as any);
            toast.success('Category added successfully!');
            setShowCatModal(false);
            const updated = await getAccountCategories(schoolId);
            setCategories(updated);
            setCatForm({ name: '', type: TransactionType.DEBIT, description: '' });
        } catch { toast.error('Failed to save category.'); }
        setSaving(false);
    }

    async function handleAddYear(e: React.FormEvent) {
        e.preventDefault();
        if (!yearForm.startDate || !yearForm.endDate) { toast.error('Please fill in all fields.'); return; }
        setSaving(true);
        try {
            await createFinancialYear(schoolId, yearForm.name, new Date(yearForm.startDate), new Date(yearForm.endDate));
            toast.success('Financial year added successfully!');
            setShowYearModal(false);
            const updated = await getFinancialYears(schoolId);
            setYears(updated);
            setYearForm({ name: '', startDate: '', endDate: '' });
        } catch { toast.error('Failed to save financial year.'); }
        setSaving(false);
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20" suppressHydrationWarning>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900">Account Settings</h1>
                <p className="mt-1 text-sm font-medium text-zinc-500">Manage transaction categories and financial timelines</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Categories Settings Card */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                                <Tags className="w-5 h-5 text-brand" />
                            </div>
                            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Categories</h2>
                        </div>
                        <button
                            onClick={() => setShowCatModal(true)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl p-2.5 transition-colors shadow-sm"
                            title="Add Category"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto min-h-0">
                        <ul className="space-y-3">
                            {categories.map((cat) => (
                                <li key={cat.id} className="group flex justify-between items-center bg-zinc-50/80 border border-zinc-100 p-4 rounded-2xl transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-zinc-900">{cat.name}</span>
                                        {cat.description && <span className="text-xs font-medium text-zinc-500 line-clamp-1">{cat.description}</span>}
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-black shrink-0 ${cat.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {cat.type}
                                    </span>
                                </li>
                            ))}
                            {categories.length === 0 && (
                                <li className="text-sm font-medium text-zinc-500 text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center gap-2">
                                    <Tags className="w-6 h-6 text-zinc-300" />
                                    No categories defined yet
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Financial Years Card */}
                <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Financial Years</h2>
                        </div>
                        <button
                            onClick={() => setShowYearModal(true)}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl p-2.5 transition-colors shadow-sm"
                            title="Add Financial Year"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto min-h-0">
                        <ul className="space-y-4">
                            {years.map((year) => (
                                <li key={year.id} className="group relative bg-zinc-50/80 border border-zinc-100 p-5 rounded-2xl items-center transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                                        <span className="text-[10px] font-black uppercase text-zinc-400">FY</span>
                                        <span className="text-sm font-black text-zinc-800 leading-none">{year.name.split('-')[1] || year.name.slice(-2)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-zinc-900 truncate">{year.name}</span>
                                            {year.isActive && <span className="flex items-center gap-1 text-[10px] uppercase font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3" /> Active</span>}
                                            {year.isClosed && <span className="flex items-center gap-1 text-[10px] uppercase font-black text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-md"><CircleDashed className="w-3 h-3" /> Closed</span>}
                                        </div>
                                        <div className="text-zinc-500 text-xs font-medium">
                                            {new Date(year.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} — {new Date(year.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {years.length === 0 && (
                                <li className="text-sm font-medium text-zinc-500 text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center gap-2">
                                    <CalendarDays className="w-6 h-6 text-zinc-300" />
                                    No financial years defined
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>

            {/* Modals using Backdrop filter for premium feel */}
            {/* Add Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-100">
                            <h3 className="text-lg font-black text-zinc-900">Add New Category</h3>
                            <button onClick={() => setShowCatModal(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category Name <span className="text-red-500">*</span></label>
                                <input required value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Utilities, Salaries"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Transaction Type <span className="text-red-500">*</span></label>
                                <select title="Transaction Type" value={catForm.type} onChange={e => setCatForm(f => ({ ...f, type: e.target.value as TransactionType }))}
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer">
                                    <option value={TransactionType.DEBIT}>Expense (Debit)</option>
                                    <option value={TransactionType.CREDIT}>Income (Credit)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description <span className="text-zinc-400 font-medium normal-case">(Optional)</span></label>
                                <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Brief details about this category"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 border border-zinc-200 text-zinc-700 rounded-xl py-3 text-sm font-black hover:bg-zinc-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 rounded-xl py-3 text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Financial Year Modal */}
            {showYearModal && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-100">
                            <h3 className="text-lg font-black text-zinc-900">Add Financial Year</h3>
                            <button onClick={() => setShowYearModal(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleAddYear} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Year Name <span className="text-red-500">*</span></label>
                                <input required value={yearForm.name} onChange={e => setYearForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. FY 2024-25"
                                    data-lpignore="true" suppressHydrationWarning
                                    className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 placeholder:font-medium placeholder:text-zinc-400 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Start Date <span className="text-red-500">*</span></label>
                                    <input required type="date" value={yearForm.startDate} onChange={e => setYearForm(f => ({ ...f, startDate: e.target.value }))}
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">End Date <span className="text-red-500">*</span></label>
                                    <input required type="date" value={yearForm.endDate} onChange={e => setYearForm(f => ({ ...f, endDate: e.target.value }))}
                                        className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowYearModal(false)} className="flex-1 border border-zinc-200 text-zinc-700 rounded-xl py-3 text-sm font-black hover:bg-zinc-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 rounded-xl py-3 text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Year'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
