"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, History, Plus, Trash2, ArrowUpRight, ArrowDownRight, IndianRupee, PieChart, ShieldCheck, X } from "lucide-react";
import { addSalaryRevisionAction, deleteSalaryRevisionAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/contexts/ConfirmContext";

interface CustomItem {
    id: string;
    label: string;
    amount: number;
}

interface SalaryRevision {
    id: string;
    amount: number;
    currency: string;
    effectiveDate: string | Date;
    revisionDate: string | Date;
    reason: string | null;
    type: string;
    basic: number;
    hra: number;
    allowance: number;
    tax: number;
    pf: number;
    insurance: number;
    otherDeductions: string | null;
    customAdditions: string | null;
    customDeductions: string | null;
    netSalary: number;
}

interface SalaryPackageSectionProps {
    staffId: string;
    salaryRevisions: SalaryRevision[];
}

export function SalaryPackageSection({ staffId, salaryRevisions: initialRevisions }: SalaryPackageSectionProps) {
    const { confirm: confirmDialog } = useConfirm();
    const [revisions, setRevisions] = useState<SalaryRevision[]>(initialRevisions);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Form states for live calculation
    const [formData, setFormData] = useState({
        amount: 0,
        basic: 0,
        hra: 0,
        allowance: 0,
        tax: 0,
        pf: 0,
        insurance: 0
    });

    const [customAdditions, setCustomAdditions] = useState<CustomItem[]>([]);
    const [customDeductions, setCustomDeductions] = useState<CustomItem[]>([]);

    const totalCustomAdditions = customAdditions.reduce((acc, item) => acc + item.amount, 0);
    const totalCustomDeductions = customDeductions.reduce((acc, item) => acc + item.amount, 0);

    const netSalary = (formData.basic + formData.hra + formData.allowance + totalCustomAdditions) - (formData.tax + formData.pf + formData.insurance + totalCustomDeductions);
    const grossCTC = (formData.basic + formData.hra + formData.allowance + totalCustomAdditions);

    if (!mounted) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    const addCustomItem = (type: 'addition' | 'deduction') => {
        const newItem = { id: Math.random().toString(36).substr(2, 9), label: '', amount: 0 };
        if (type === 'addition') setCustomAdditions([...customAdditions, newItem]);
        else setCustomDeductions([...customDeductions, newItem]);
    };

    const updateCustomItem = (type: 'addition' | 'deduction', id: string, field: 'label' | 'amount', value: string | number) => {
        const setter = type === 'addition' ? setCustomAdditions : setCustomDeductions;
        const items = type === 'addition' ? customAdditions : customDeductions;
        setter(items.map(item => item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item));
    };

    const removeCustomItem = (type: 'addition' | 'deduction', id: string) => {
        const setter = type === 'addition' ? setCustomAdditions : setCustomDeductions;
        const items = type === 'addition' ? customAdditions : customDeductions;
        setter(items.filter(item => item.id !== id));
    };

    const handleAddRevision = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const { amount, ...otherFormData } = formData;
        const submitData = {
            amount: grossCTC,
            effectiveDate: (form.elements.namedItem("effectiveDate") as HTMLInputElement).value,
            reason: (form.elements.namedItem("reason") as HTMLInputElement).value,
            type: (form.elements.namedItem("type") as HTMLSelectElement).value,
            ...otherFormData,
            customAdditions: JSON.stringify(customAdditions),
            customDeductions: JSON.stringify(customDeductions),
            netSalary
        };

        const res = await addSalaryRevisionAction(staffId, submitData as any);
        if (res.success) {
            toast.success("Salary package created successfully");
            setRevisions([res.data as any, ...revisions]);
            setIsAdding(false);
            setFormData({ amount: 0, basic: 0, hra: 0, allowance: 0, tax: 0, pf: 0, insurance: 0 });
            setCustomAdditions([]);
            setCustomDeductions([]);
        } else {
            toast.error(res.error || "Failed to add revision");
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Salary Record",
            message: "Are you sure you want to delete this record?",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteSalaryRevisionAction(id);
        if (res.success) {
            toast.success("Record deleted");
            setRevisions(revisions.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-8 mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Detailed Salary Package</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage earnings, deductions, and calculate net payout.</p>
                    </div>
                </div>
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        <Plus className="h-4 w-4" /> New Package
                    </button>
                ) : (
                    <button
                        onClick={() => setIsAdding(false)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Form Section */}
            {isAdding && (
                <form onSubmit={handleAddRevision} className="bg-zinc-50/50 dark:bg-zinc-900/30 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Earnings */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                <Plus className="h-4 w-4" /> Earnings Breakdown
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Basic Pay</label>
                                    <input name="basic" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">HRA</label>
                                    <input name="hra" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Other Allowances</label>
                                    <input name="allowance" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                            </div>

                            {/* Custom Additions */}
                            <div className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Additions (Bonus, Incentives)</h5>
                                    <button type="button" onClick={() => addCustomItem('addition')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                {customAdditions.map((item) => (
                                    <div key={item.id} className="flex gap-2">
                                        <input
                                            placeholder="Label (e.g. Sales Bonus)"
                                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                            value={item.label}
                                            onChange={(e) => updateCustomItem('addition', item.id, 'label', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            className="w-24 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                            value={item.amount || ''}
                                            onChange={(e) => updateCustomItem('addition', item.id, 'amount', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeCustomItem('addition', item.id)} className="p-2 text-zinc-400 hover:text-rose-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-4 w-4" /> Statutory Deductions
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Professional Tax</label>
                                    <input name="tax" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Provident Fund (PF)</label>
                                    <input name="pf" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Insurance</label>
                                    <input name="insurance" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                            </div>

                            {/* Custom Deductions */}
                            <div className="pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Deductions (LOP, Penalty)</h5>
                                    <button type="button" onClick={() => addCustomItem('deduction')} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg dark:bg-rose-900/20 dark:text-rose-400">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                {customDeductions.map((item) => (
                                    <div key={item.id} className="flex gap-2">
                                        <input
                                            placeholder="Label (e.g. LOP Deduction)"
                                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                            value={item.label}
                                            onChange={(e) => updateCustomItem('deduction', item.id, 'label', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            className="w-24 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950"
                                            value={item.amount || ''}
                                            onChange={(e) => updateCustomItem('deduction', item.id, 'amount', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removeCustomItem('deduction', item.id)} className="p-2 text-zinc-400 hover:text-rose-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Date */}
                    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid gap-8 lg:grid-cols-3 items-center">
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Effective Date</label>
                                <input name="effectiveDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none ring-4 ring-brand/5 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Revision Type</label>
                                <select name="type" className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none ring-4 ring-brand/5 dark:border-zinc-800 dark:bg-zinc-950">
                                    <option value="INITIAL">Initial Hire</option>
                                    <option value="INCREMENT">Increment</option>
                                    <option value="PROMOTION">Promotion</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Revision Reason</label>
                                <input name="reason" placeholder="e.g. Performance Review Q4" className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none ring-4 ring-brand/5 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                        </div>

                        <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between h-full group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform font-black text-6xl italic italic uppercase pointer-events-none">
                                CALC
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Net Take Home</p>
                                <h4 className="text-4xl font-black mt-2 italic tracking-tighter text-emerald-400">₹ {netSalary.toLocaleString()}</h4>
                            </div>
                            <div className="mt-8 flex items-center justify-between relative z-10 gap-4">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Gross Institutional Cost: ₹ {grossCTC.toLocaleString()}</div>
                                <button type="submit" disabled={isLoading} className="px-8 py-3 bg-brand rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand/20">
                                    {isLoading ? "Locking..." : "Save Config"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* History Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-zinc-400" />
                        <h4 className="text-sm font-black uppercase tracking-[0.1em] italic text-zinc-600 dark:text-zinc-400">Revision History & Structural Breakdown</h4>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-zinc-400">Effective Date</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-zinc-400">Earnings Components</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-zinc-400"> Statutory Deductions</th>
                                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-zinc-400 text-right">Net Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {revisions.map((rev) => {
                                const adds = rev.customAdditions ? JSON.parse(rev.customAdditions) : [];
                                const deds = rev.customDeductions ? JSON.parse(rev.customDeductions) : [];

                                return (
                                    <tr key={rev.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                                        <td className="px-8 py-8">
                                            <div className="font-black text-zinc-900 dark:text-zinc-50 tracking-tighter text-base leading-none">
                                                {rev.effectiveDate ? format(new Date(rev.effectiveDate), "MMMM dd, yyyy") : "Archive Data"}
                                            </div>
                                            <div className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mt-2 flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-black">{rev.type}</span>
                                                <span className="truncate max-w-[150px]">{rev.reason || "Scheduled Adjustment"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge label="Basic" value={rev.basic} color="emerald" />
                                                <Badge label="HRA" value={rev.hra} color="emerald" />
                                                <Badge label="Allow" value={rev.allowance} color="emerald" />
                                                {adds.map((a: any, i: number) => (
                                                    <Badge key={i} label={a.label} value={a.amount} color="brand" />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge label="Tax" value={rev.tax} color="rose" />
                                                <Badge label="PF" value={rev.pf} color="rose" />
                                                <Badge label="Ins" value={rev.insurance} color="rose" />
                                                {deds.map((d: any, i: number) => (
                                                    <Badge key={i} label={d.label} value={d.amount} color="rose" />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-xl text-zinc-900 dark:text-zinc-50 italic tracking-tighter">₹ {(rev.netSalary || 0).toLocaleString()}</span>
                                                <button onClick={() => handleDelete(rev.id)} className="mt-4 p-2 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all bg-zinc-50 rounded-lg dark:bg-zinc-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Badge({ label, value, color }: { label: string, value: number, color: 'emerald' | 'brand' | 'rose' }) {
    if (value === 0) return null;
    const colors = {
        emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
        brand: "bg-brand/10 text-brand",
        rose: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
    };
    return (
        <div className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 border border-current border-opacity-10", colors[color])}>
            <span className="opacity-60">{label}:</span>
            <span>₹{value.toLocaleString()}</span>
        </div>
    );
}
