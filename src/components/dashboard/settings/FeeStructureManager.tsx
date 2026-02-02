"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    CreditCard,
    Calendar,
    Coins,
    CheckCircle2,
    Briefcase,
    AlertCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    Info,
    CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { createFeeStructureAction, updateFeeStructureAction, deleteFeeStructureAction } from "@/app/actions/fee-settings-actions";
import { cn, getCurrencySymbol } from "@/lib/utils";
interface FeeStructureManagerProps {
    slug: string;
    initialData: any[];
    onRefresh: () => void;
    currency?: string;
}

export function FeeStructureManager({ slug, initialData, onRefresh, currency }: FeeStructureManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        academicYear: "2024-25",
        description: "",
        termConfig: {
            count: 1,
            terms: [] as any[]
        },
        components: [] as any[]
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleCreate = () => {
        setFormData({
            name: "",
            academicYear: "2024-25",
            description: "",
            termConfig: {
                count: 1,
                terms: [{ id: 1, name: "Term 1", start: "", end: "" }]
            },
            components: [
                {
                    id: Date.now(),
                    name: "Tuition Fee",
                    amount: 0,
                    frequency: "TERM",
                    isOptional: false,
                    midTermRule: "PRO_RATA",
                    dueDate: "",
                    config: { terms: [] }
                }
            ]
        });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleEdit = (structure: any) => {
        let parsedTermConfig = { count: 1, terms: [{ id: 1, name: "Term 1", start: "", end: "" }] };
        if (structure.termConfig) {
            try {
                parsedTermConfig = JSON.parse(structure.termConfig);
            } catch (e) {
                console.error("Failed to parse term config", e);
            }
        }

        setFormData({
            name: structure.name,
            academicYear: structure.academicYear,
            description: structure.description || "",
            termConfig: parsedTermConfig,
            components: structure.components.map((c: any) => ({
                ...c,
                config: c.config ? JSON.parse(c.config) : { terms: [] }
            }))
        });
        setEditingId(structure.id);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this fee structure?")) return;
        const res = await deleteFeeStructureAction(slug, id);
        if (res.success) {
            toast.success("Structure deleted");
            onRefresh();
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleSave = async () => {
        if (!formData.name) return toast.error("Name is required");
        setIsSaving(true);

        // Sanitize Term Config based on count
        const validTerms = formData.termConfig.terms.slice(0, formData.termConfig.count);
        const finalData = {
            ...formData,
            termConfig: {
                ...formData.termConfig,
                terms: validTerms
            },
            // Recalculate component total amounts based on breakdown
            components: formData.components.map(c => {
                let finalAmount = c.amount;
                if (c.frequency === "TERM" && c.config?.terms?.length > 0) {
                    // Sum up installment amounts
                    finalAmount = c.config.terms.reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);
                }
                return { ...c, amount: finalAmount };
            })
        };

        let res;
        if (editingId) {
            res = await updateFeeStructureAction(slug, editingId, finalData);
        } else {
            res = await createFeeStructureAction(slug, finalData);
        }

        if (res.success) {
            toast.success(editingId ? "Structure updated" : "Structure created");
            setIsEditing(false);
            onRefresh();
        } else {
            toast.error(res.error || "Failed to save");
        }
        setIsSaving(false);
    };



    // Component Management
    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [
                ...prev.components,
                {
                    id: Date.now(),
                    name: "",
                    amount: 0,
                    frequency: "ONE_TIME",
                    isOptional: false,
                    midTermRule: "FULL",
                    dueDate: "",
                    config: { terms: [] }
                }
            ]
        }));
    };

    const removeComponent = (index: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.filter((_, i) => i !== index)
        }));
    };

    const updateComponent = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== index) return c;

                // Logic for when frequency changes to TERM
                if (field === "frequency" && value === "TERM") {
                    // Start with empty terms for manual addition
                    return { ...c, [field]: value, config: { ...c.config, terms: [] } };
                }

                return { ...c, [field]: value };
            })
        }));
    };

    // Sub-update for component term breakdown
    const updateComponentTerm = (compIndex: number, termIndex: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== compIndex) return c;
                const newTerms = [...(c.config?.terms || [])];
                newTerms[termIndex] = { ...newTerms[termIndex], [field]: value };
                return { ...c, config: { ...c.config, terms: newTerms } };
            })
        }));
    };

    // Add a new term to a component
    const addComponentTerm = (compIndex: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== compIndex) return c;
                const currentTerms = [...(c.config?.terms || [])];
                const nextNum = currentTerms.length + 1;
                currentTerms.push({
                    name: `Term ${nextNum}`,
                    startDate: "",
                    endDate: "",
                    dueDate: "",
                    amount: 0
                });
                return { ...c, config: { ...c.config, terms: currentTerms } };
            })
        }));
    };

    // Remove a term from a component
    const removeComponentTerm = (compIndex: number, termIndex: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== compIndex) return c;
                const newTerms = c.config.terms.filter((_: any, ti: number) => ti !== termIndex);
                return { ...c, config: { ...c.config, terms: newTerms } };
            })
        }));
    };

    if (isEditing) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-zinc-900">{editingId ? "Edit Fee Structure" : "New Fee Structure"}</h2>
                        <p className="text-zinc-500 font-medium">Define comprehensive fee plans and components.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Structure</>}
                        </button>
                    </div>
                </div>

                {/* Structure Details */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Plan Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Grade 1-5 Standard (2025)"
                                className="w-full h-14 bg-zinc-50 rounded-2xl px-5 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Academic Year</label>
                            <select
                                value={formData.academicYear}
                                onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                                className="w-full h-14 bg-zinc-50 rounded-2xl px-5 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>2023-24</option>
                                <option>2024-25</option>
                                <option>2025-26</option>
                                <option>2026-27</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add notes about this fee structure..."
                            className="w-full h-24 bg-zinc-50 rounded-2xl p-5 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>



                {/* Components Builder */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                            <Coins className="h-5 w-5 text-blue-600" /> Fee Components
                        </h3>
                        <button
                            onClick={addComponent}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Add Global
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.components.map((comp, idx) => (
                            <div key={idx} className="p-6 bg-zinc-50 border border-zinc-100 rounded-[24px] relative group hover:border-blue-200 transition-colors">
                                <button
                                    onClick={() => removeComponent(idx)}
                                    className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors z-20"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>

                                <div className="grid md:grid-cols-12 gap-4 items-start">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fee Head</label>
                                        <input
                                            type="text"
                                            value={comp.name}
                                            onChange={e => updateComponent(idx, 'name', e.target.value)}
                                            placeholder="e.g. Tuition Fee"
                                            className="w-full bg-white h-12 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Frequency</label>
                                        <select
                                            value={comp.frequency}
                                            onChange={e => updateComponent(idx, 'frequency', e.target.value)}
                                            className="w-full bg-white h-12 rounded-xl px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ONE_TIME">One Time</option>
                                            <option value="TERM">Term-wise</option>
                                            <option value="ANNUALLY">Annually</option>
                                            <option value="MONTHLY">Monthly</option>
                                        </select>
                                    </div>

                                    {/* DYNAMIC CONTENT BASED ON FREQUENCY */}
                                    {comp.frequency === 'ONE_TIME' && (
                                        <>
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{getCurrencySymbol(currency)}</span>
                                                    <input
                                                        type="number"
                                                        value={comp.amount}
                                                        onChange={e => updateComponent(idx, 'amount', e.target.value)}
                                                        className="w-full bg-white h-12 rounded-xl pl-8 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={comp.dueDate || ""}
                                                    onChange={e => updateComponent(idx, 'dueDate', e.target.value)}
                                                    className="w-full bg-white h-12 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {comp.frequency !== 'ONE_TIME' && comp.frequency !== 'TERM' && (
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{getCurrencySymbol(currency)}</span>
                                                <input
                                                    type="number"
                                                    value={comp.amount}
                                                    onChange={e => updateComponent(idx, 'amount', e.target.value)}
                                                    className="w-full bg-white h-12 rounded-xl pl-8 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* TERM-WISE EXPANDED VIEW */}
                                {comp.frequency === 'TERM' && (
                                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" /> Term Breakdown
                                            </h4>
                                            <button
                                                onClick={() => addComponentTerm(idx)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="h-3 w-3" /> Add Term
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {comp.config?.terms?.length === 0 && (
                                                <p className="text-xs text-zinc-400 italic text-center py-2">No terms added. Click "Add Term" to define installments.</p>
                                            )}
                                            {comp.config?.terms?.map((term: any, tIdx: number) => (
                                                <div key={tIdx} className="bg-white p-3 rounded-xl border border-zinc-200 relative group">
                                                    <button
                                                        onClick={() => removeComponentTerm(idx, tIdx)}
                                                        className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    <div className="grid md:grid-cols-12 gap-3 items-end">
                                                        <div className="md:col-span-3 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Name</label>
                                                            <input
                                                                type="text"
                                                                value={term.name}
                                                                onChange={e => updateComponentTerm(idx, tIdx, 'name', e.target.value)}
                                                                className="w-full bg-zinc-50 border-none rounded-lg h-8 px-2 text-xs font-bold focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Term Name"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-4 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Duration (Start - End)</label>
                                                            <div className="flex gap-1">
                                                                <input
                                                                    type="date"
                                                                    value={term.startDate || ""}
                                                                    onChange={e => updateComponentTerm(idx, tIdx, 'startDate', e.target.value)}
                                                                    className="w-full bg-zinc-50 border-none rounded-lg h-8 px-1 text-[10px] font-medium focus:ring-1 focus:ring-blue-500"
                                                                />
                                                                <input
                                                                    type="date"
                                                                    value={term.endDate || ""}
                                                                    onChange={e => updateComponentTerm(idx, tIdx, 'endDate', e.target.value)}
                                                                    className="w-full bg-zinc-50 border-none rounded-lg h-8 px-1 text-[10px] font-medium focus:ring-1 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-3 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Amount</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[10px]">{getCurrencySymbol(currency)}</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={term.amount}
                                                                    onChange={e => updateComponentTerm(idx, tIdx, 'amount', e.target.value)}
                                                                    className="w-full bg-zinc-50 border-none rounded-lg h-8 pl-5 text-xs font-bold focus:ring-1 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Due Date</label>
                                                            <input
                                                                type="date"
                                                                value={term.dueDate || ""}
                                                                onChange={e => updateComponentTerm(idx, tIdx, 'dueDate', e.target.value)}
                                                                className="w-full bg-zinc-50 border-none rounded-lg h-8 px-2 text-[10px] font-bold text-red-500 focus:ring-1 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {formData.components.length === 0 && (
                            <div className="p-8 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                                <p className="text-zinc-400 font-medium">No fee components added yet.</p>
                            </div>
                        )}

                        {/* Summary of Mid-Term Logic */}
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-blue-900">Mid-Term Joining Policy</h4>
                                <p className="text-[10px] text-blue-700 leading-relaxed">
                                    <strong>Charge Full:</strong> Student pays the complete fee for the current term regardless of joining date.<br />
                                    <strong>Pro-Rata:</strong> Fee is calculated based on remaining days in the term (using Term Schedule dates).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">Fee Structures</h2>
                    <p className="text-sm font-medium text-zinc-500 mt-1">
                        Global fee definitions for different grades and academic years.
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Create Structure
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialData.map(structure => (
                    <div key={structure.id} className="group bg-white rounded-[32px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <CreditCard className="h-32 w-32" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    {structure.academicYear}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(structure)}
                                        className="h-8 w-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(structure.id)}
                                        className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">{structure.name}</h3>
                            <p className="text-xs font-medium text-zinc-400 line-clamp-2 mb-6 h-8">
                                {structure.components.length} components defined
                            </p>

                            <div className="space-y-3 pt-6 border-t border-dashed border-zinc-100">
                                {structure.components.slice(0, 3).map((c: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-zinc-600">{c.name}</span>
                                        <span className="font-black text-zinc-900">{getCurrencySymbol(currency)}{c.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {structure.components.length > 3 && (
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center pt-2">
                                        + {structure.components.length - 3} more components
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Value</p>
                                    <p className="text-2xl font-black text-zinc-900">
                                        {getCurrencySymbol(currency)}{structure.components.reduce((sum: number, c: any) => sum + c.amount, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {initialData.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border border-zinc-100">
                    <CreditCard className="h-16 w-16 text-zinc-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-zinc-900">No Fee Structures</h3>
                    <p className="text-zinc-400 font-medium mt-2">Create your first fee plan to get started.</p>
                </div>
            )}
        </div>
    );
}
