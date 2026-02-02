"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, History, Plus, Trash2, ArrowUpRight, ArrowDownRight, IndianRupee, PieChart, ShieldCheck } from "lucide-react";
import { addSalaryRevisionAction, deleteSalaryRevisionAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    otherDeductions: number;
    netSalary: number;
}

interface SalaryPackageSectionProps {
    staffId: string;
    salaryRevisions: SalaryRevision[];
}

export function SalaryPackageSection({ staffId, salaryRevisions: initialRevisions }: SalaryPackageSectionProps) {
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
        insurance: 0,
        otherDeductions: 0
    });

    const netSalary = (formData.basic + formData.hra + formData.allowance) - (formData.tax + formData.pf + formData.insurance + formData.otherDeductions);
    const grossCTC = (formData.basic + formData.hra + formData.allowance);

    const currentSalary = revisions.length > 0 ? revisions[0] : null;

    if (!mounted) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
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
            netSalary
        };

        const res = await addSalaryRevisionAction(staffId, submitData);
        if (res.success) {
            toast.success("Salary package created successfully");
            setRevisions([res.data as any, ...revisions]);
            setIsAdding(false);
            setFormData({ amount: 0, basic: 0, hra: 0, allowance: 0, tax: 0, pf: 0, insurance: 0, otherDeductions: 0 });
        } else {
            toast.error(res.error || "Failed to add revision");
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Detailed Salary Package</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage earnings, deductions, and calculate net payout.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                >
                    {isAdding ? "Cancel" : <><Plus className="h-4 w-4" /> New Package</>}
                </button>
            </div>

            {/* Form Section */}
            {isAdding && (
                <form onSubmit={handleAddRevision} className="bg-zinc-50/50 dark:bg-zinc-900/30 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Earnings */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                <Plus className="h-4 w-4" /> Earnings Breakdown
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Basic Pay</label>
                                    <input name="basic" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">HRA</label>
                                    <input name="hra" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Other Allowances</label>
                                    <input name="allowance" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                                <Trash2 className="h-4 w-4" /> Deductions
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Professional Tax</label>
                                    <input name="tax" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Provident Fund (PF)</label>
                                    <input name="pf" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Insurance</label>
                                    <input name="insurance" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Others</label>
                                    <input name="otherDeductions" type="number" onChange={handleInputChange} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary & Date */}
                    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid gap-8 lg:grid-cols-3 items-center">
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Effective Date</label>
                                <input name="effectiveDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none ring-4 ring-zinc-500/5 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Revision Type</label>
                                <select name="type" className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none ring-4 ring-zinc-500/5 dark:border-zinc-800 dark:bg-zinc-950">
                                    <option value="INITIAL">Initial Hire</option>
                                    <option value="INCREMENT">Increment</option>
                                    <option value="PROMOTION">Promotion</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Revision Reason</label>
                                <input name="reason" placeholder="e.g. Performance Review Q4" className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none ring-4 ring-zinc-500/5 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                        </div>

                        <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between h-full group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                <ShieldCheck className="h-24 w-24" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Calculated Net Payout</p>
                                <h4 className="text-4xl font-black mt-2">₹ {netSalary.toLocaleString()}</h4>
                            </div>
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gross CTC: ₹ {grossCTC.toLocaleString()}</div>
                                <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">
                                    {isLoading ? "Saving..." : "Save Package"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* History with Expanded View */}
            <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-zinc-400" />
                        <h4 className="text-sm font-black uppercase tracking-tight">Revision History & Structure</h4>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Effective</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Gross CTC</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Earnings (B+H+A)</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap">Deductions</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-zinc-400 whitespace-nowrap text-right">Net Payout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {revisions.map((rev, idx) => (
                                <tr key={rev.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                                            {rev.effectiveDate ? format(new Date(rev.effectiveDate), "dd MMM, yyyy") : "N/A"}
                                        </div>
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">
                                            {rev.type} • {rev.reason || "Scheduled"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 font-bold text-zinc-500">₹ {(rev.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 font-bold">B: {(rev.basic || 0).toLocaleString()}</span>
                                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 font-bold">H: {(rev.hra || 0).toLocaleString()}</span>
                                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 font-bold">A: {(rev.allowance || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-[10px] text-rose-500 font-black">
                                            - ₹ {((rev.tax || 0) + (rev.pf || 0) + (rev.insurance || 0) + (rev.otherDeductions || 0)).toLocaleString()}
                                        </div>
                                        <div className="text-[9px] text-zinc-400 uppercase tracking-widest">
                                            Tax: {rev.tax || 0} | PF: {rev.pf || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-lg text-blue-600 leading-none">₹ {(rev.netSalary || 0).toLocaleString()}</span>
                                            <button onClick={() => handleDelete(rev.id)} className="mt-2 p-1.5 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition-all">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
