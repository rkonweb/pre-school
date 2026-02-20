"use client";

import { useState, useMemo } from "react";
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
    CalendarDays,
    Check
} from "lucide-react";
import { toast } from "sonner";
import { createFeeStructureAction, updateFeeStructureAction, deleteFeeStructureAction } from "@/app/actions/fee-settings-actions";
import { cn, getCurrencySymbol } from "@/lib/utils";


interface FeeStructureManagerProps {
    slug: string;
    initialData: any[]; // List of all fee structures
    classrooms: any[]; // List of all classrooms
    academicYears?: any[];
    currentAcademicYear?: any;
    onRefresh: () => void;
    currency?: string;
}

export function FeeStructureManager({ slug, initialData, classrooms, academicYears = [], currentAcademicYear, onRefresh, currency }: FeeStructureManagerProps) {
    const defaultYear = currentAcademicYear?.name || (academicYears && academicYears.length > 0 ? academicYears[0].name : "2024-25");
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Helper to extract grade name (e.g., "Grade 1 - A" -> "Grade 1")
    const getGradeName = (className: string) => {
        // Splitting by " - " assuming the format "Grade - Section"
        // If no separator, return full name
        // Also handle "Grade 1 A" vs "Grade 1 - A" if needed, but " - " is standard in this app based on user context
        const parts = className.split(" - ");
        return parts.length > 1 ? parts[0] : className;
    };

    // Group classrooms by Grade
    const gradeGroups = useMemo(() => {
        const groups: Record<string, any[]> = {};
        classrooms.forEach(cls => {
            const grade = getGradeName(cls.name);
            if (!groups[grade]) groups[grade] = [];
            groups[grade].push(cls);
        });
        return groups;
    }, [classrooms]);

    // Derived list of unique grades
    const grades = useMemo(() => Object.keys(gradeGroups).sort(), [gradeGroups]);

    // Filter structures by selected year
    const structuresForYear = useMemo(() => {
        return initialData.filter(s => s.academicYear === selectedYear);
    }, [initialData, selectedYear]);

    // Map each GRADE to its active structure (if any)
    const gradeFeeMap = useMemo(() => {
        const map = new Map<string, any>();
        grades.forEach(grade => {
            const classesInGrade = gradeGroups[grade];
            // Find a structure that includes ANY class ID from this grade
            const structure = structuresForYear.find(s => {
                try {
                    const ids = JSON.parse(s.classIds || "[]");
                    return classesInGrade.some(c => ids.includes(c.id));
                } catch (e) { return false; }
            });
            if (structure) {
                map.set(grade, structure);
            }
        });
        return map;
    }, [grades, gradeGroups, structuresForYear]);

    // Form State
    const [formData, setFormData] = useState({
        name: "", // Will be auto-generated or hidden
        academicYear: "2024-25",
        description: "",
        termConfig: {
            count: 1,
            terms: [] as any[]
        },
        classIds: [] as string[],
        components: [] as any[]
    });

    const [isSaving, setIsSaving] = useState(false);

    // Start Editing for a specific Grade
    const handleEditGradeFees = (grade: string) => {
        const existingStructure = gradeFeeMap.get(grade);

        if (existingStructure) {
            loadStructureIntoForm(existingStructure);
        } else {
            // Create new structure for this grade -> Auto-select ALL classes in this grade
            const classIds = gradeGroups[grade].map(c => c.id);
            setFormData({
                name: `Fees for ${grade} (${selectedYear})`,
                academicYear: selectedYear,
                description: "",
                termConfig: {
                    count: 1,
                    terms: [{ id: 1, name: "Term 1", start: "", end: "" }]
                },
                classIds: classIds,
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
        }
    };

    const loadStructureIntoForm = (structure: any) => {
        let parsedTermConfig = { count: 1, terms: [{ id: 1, name: "Term 1", start: "", end: "" }] };
        let parsedClassIds: string[] = [];

        if (structure.termConfig) {
            try {
                parsedTermConfig = JSON.parse(structure.termConfig);
            } catch (e) {
                console.error("Failed to parse term config", e);
            }
        }

        if (structure.classIds) {
            try {
                parsedClassIds = JSON.parse(structure.classIds);
            } catch (e) {
                console.error("Failed to parse classIds", e);
            }
        }

        setFormData({
            name: structure.name,
            academicYear: structure.academicYear,
            description: structure.description || "",
            termConfig: parsedTermConfig,
            classIds: parsedClassIds,
            components: structure.components.map((c: any) => ({
                ...c,
                config: c.config ? JSON.parse(c.config) : { terms: [] }
            }))
        });
        setEditingId(structure.id);
        setIsEditing(true);
    }

    const handleSave = async () => {
        setIsSaving(true);

        // Auto-generate name based on GRADES if not editing manually
        // Reverse map selected classIds to Grades
        const selectedGrades = new Set<string>();
        formData.classIds.forEach(id => {
            const cls = classrooms.find(c => c.id === id);
            if (cls) selectedGrades.add(getGradeName(cls.name));
        });
        const gradeNames = Array.from(selectedGrades).sort().join(", ");
        const autoName = `Fees for ${gradeNames || "Grades"} (${formData.academicYear})`;

        const validTerms = formData.termConfig.terms.slice(0, formData.termConfig.count);
        const finalData = {
            ...formData,
            name: autoName, // Force auto-name
            termConfig: {
                ...formData.termConfig,
                terms: validTerms
            },
            components: formData.components.map(c => {
                let finalAmount = c.amount;
                if (c.frequency === "TERM" && c.config?.terms?.length > 0) {
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
            toast.success("Fees saved successfully");
            setIsEditing(false);
            onRefresh();
        } else {
            toast.error(res.error || "Failed to save");
        }
        setIsSaving(false);
    };

    // Field Update Handlers
    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [
                ...prev.components,
                { id: Date.now(), name: "", amount: 0, frequency: "ONE_TIME", isOptional: false, midTermRule: "FULL", dueDate: "", config: { terms: [] } }
            ]
        }));
    };
    const removeComponent = (index: number) => {
        setFormData(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== index) }));
    };
    const updateComponent = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== index) return c;
                if (field === "frequency" && value === "TERM") return { ...c, [field]: value, config: { ...c.config, terms: [] } };
                return { ...c, [field]: value };
            })
        }));
    };
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
    const addComponentTerm = (compIndex: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((c, i) => {
                if (i !== compIndex) return c;
                const currentTerms = [...(c.config?.terms || [])];
                const nextNum = currentTerms.length + 1;
                currentTerms.push({ name: `Term ${nextNum}`, startDate: "", endDate: "", dueDate: "", amount: 0 });
                return { ...c, config: { ...c.config, terms: currentTerms } };
            })
        }));
    };
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
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-40 border-b border-zinc-100">
                    <div>
                        <h2 className="text-3xl font-black text-zinc-900">Define Fees</h2>
                        <p className="text-zinc-500 font-medium">Setting fees for {formData.academicYear}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-brand text-[var(--secondary-color)] font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand/20">
                            {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Fees</>}
                        </button>
                    </div>
                </div>

                {/* Components Builder */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2"><Coins className="h-5 w-5 text-brand" /> Fee Components</h3>
                        <div className="flex gap-2">
                            {/* Shortcuts */}
                            <button onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    components: [...prev.components, { id: Date.now(), name: "Tuition Fee", amount: 0, frequency: "TERM", isOptional: false, midTermRule: "PRO_RATA", dueDate: "", config: { terms: [] } }]
                                }))
                            }} className="px-3 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-200 transition-colors">
                                + Tuition
                            </button>
                            <button onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    components: [...prev.components, { id: Date.now(), name: "Books & Stationery", amount: 0, frequency: "ONE_TIME", isOptional: false, midTermRule: "FULL", dueDate: "", config: { terms: [] } }]
                                }))
                            }} className="px-3 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-200 transition-colors">
                                + Books
                            </button>
                            <button onClick={addComponent} className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/20 transition-colors flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Custom
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {formData.components.map((comp, idx) => (
                            <div key={idx} className="p-6 bg-zinc-50 border border-zinc-100 rounded-[24px] relative group hover:border-brand/30 transition-colors shadow-sm">
                                <button onClick={() => removeComponent(idx)} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors z-20"><Trash2 className="h-5 w-5" /></button>
                                <div className="grid md:grid-cols-12 gap-4 items-start">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fee Head</label>
                                        <input type="text" value={comp.name} onChange={e => updateComponent(idx, 'name', e.target.value)} placeholder="e.g. Tuition Fee" className="w-full bg-white h-12 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Frequency</label>
                                        <select value={comp.frequency} onChange={e => updateComponent(idx, 'frequency', e.target.value)} className="w-full bg-white h-12 rounded-xl px-4 font-bold text-xs outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                                            <option value="ONE_TIME">One Time</option>
                                            <option value="TERM">Term-wise</option>
                                            <option value="ANNUALLY">Annually</option>
                                            <option value="MONTHLY">Monthly</option>
                                        </select>
                                    </div>
                                    {comp.frequency === 'ONE_TIME' && (
                                        <>
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{getCurrencySymbol(currency)}</span>
                                                    <input type="number" value={comp.amount} onChange={e => updateComponent(idx, 'amount', e.target.value)} className="w-full bg-white h-12 rounded-xl pl-8 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-brand" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Due Date</label>
                                                <input type="date" value={comp.dueDate || ""} onChange={e => updateComponent(idx, 'dueDate', e.target.value)} className="w-full bg-white h-12 rounded-xl px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-brand" />
                                            </div>
                                        </>
                                    )}
                                    {comp.frequency !== 'ONE_TIME' && comp.frequency !== 'TERM' && (
                                        <div className="md:col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{getCurrencySymbol(currency)}</span>
                                                <input type="number" value={comp.amount} onChange={e => updateComponent(idx, 'amount', e.target.value)} className="w-full bg-white h-12 rounded-xl pl-8 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-brand" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {comp.frequency === 'TERM' && (
                                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Term Breakdown</h4>
                                            <button onClick={() => addComponentTerm(idx)} className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand/20 transition-colors flex items-center gap-1"><Plus className="h-3 w-3" /> Add Term</button>
                                        </div>
                                        <div className="space-y-3">
                                            {comp.config?.terms?.length === 0 && <p className="text-xs text-zinc-400 italic text-center py-2">No terms added.</p>}
                                            {comp.config?.terms?.map((term: any, tIdx: number) => (
                                                <div key={tIdx} className="bg-white p-3 rounded-xl border border-zinc-200 relative group animate-in slide-in-from-left-2 duration-300">
                                                    <button onClick={() => removeComponentTerm(idx, tIdx)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                                                    <div className="grid md:grid-cols-12 gap-3 items-end">
                                                        <div className="md:col-span-3 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Name</label>
                                                            <input type="text" value={term.name} onChange={e => updateComponentTerm(idx, tIdx, 'name', e.target.value)} className="w-full bg-zinc-50 border-none rounded-lg h-8 px-2 text-xs font-bold focus:ring-1 focus:ring-brand" placeholder="Term Name" />
                                                        </div>
                                                        <div className="md:col-span-4 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Duration (Start - End)</label>
                                                            <div className="flex gap-1">
                                                                <input type="date" value={term.startDate || ""} onChange={e => updateComponentTerm(idx, tIdx, 'startDate', e.target.value)} className="w-full bg-zinc-50 border-none rounded-lg h-8 px-1 text-[10px] font-medium focus:ring-1 focus:ring-brand" />
                                                                <input type="date" value={term.dueDate || ""} onChange={e => updateComponentTerm(idx, tIdx, 'dueDate', e.target.value)} className="w-full bg-zinc-50 border-none rounded-lg h-8 px-2 text-[10px] font-bold text-red-500 focus:ring-1 focus:ring-brand" />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-3 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Amount</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[10px]">{getCurrencySymbol(currency)}</span>
                                                                <input type="number" placeholder="0.00" value={term.amount} onChange={e => updateComponentTerm(idx, tIdx, 'amount', e.target.value)} className="w-full bg-zinc-50 border-none rounded-lg h-8 pl-5 text-xs font-bold focus:ring-1 focus:ring-brand" />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-1">
                                                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Due Date</label>
                                                            <input type="date" value={term.dueDate || ""} onChange={e => updateComponentTerm(idx, tIdx, 'dueDate', e.target.value)} className="w-full bg-zinc-50 border-none rounded-lg h-8 px-2 text-[10px] font-bold text-red-500 focus:ring-1 focus:ring-brand" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900">Fee Management</h2>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Configure fees for each grade for the academic year.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-zinc-200">
                        <span className="text-xs font-bold text-zinc-400 uppercase">Academic Year</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent font-bold text-zinc-900 outline-none text-sm"
                        >
                            {academicYears.length > 0 ? (
                                academicYears.map(year => (
                                    <option key={year.id} value={year.name}>{year.name}</option>
                                ))
                            ) : (
                                <>
                                    <option>2023-24</option>
                                    <option>2024-25</option>
                                    <option>2025-26</option>
                                    <option>2026-27</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {grades.map(grade => {
                    const structure = gradeFeeMap.get(grade);
                    const totalAmount = structure
                        ? structure.components.reduce((sum: number, c: any) => sum + c.amount, 0)
                        : 0;

                    return (
                        <div
                            key={grade}
                            onClick={() => handleEditGradeFees(grade)}
                            className={cn(
                                "group rounded-[24px] p-6 border cursor-pointer hover:-translate-y-1 transition-all duration-300 relative overflow-hidden",
                                structure
                                    ? "bg-white border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl"
                                    : "bg-zinc-50 border-dashed border-zinc-200 hover:border-brand/30 hover:bg-white"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-black text-zinc-900">{grade}</h3>
                                {structure ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Plus className="h-5 w-5 text-zinc-300 group-hover:text-brand transition-colors" />
                                )}
                            </div>

                            {structure ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Fees</p>
                                        <p className="text-2xl font-black text-zinc-900">
                                            {getCurrencySymbol(currency)}{totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {structure.components.slice(0, 3).map((c: any, i: number) => (
                                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">
                                                {c.name}
                                            </span>
                                        ))}
                                        {structure.components.length > 3 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-md">+{structure.components.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-zinc-400 group-hover:text-brand transition-colors">Configure Fees</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {grades.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-zinc-400 font-medium">No grades found. Create classes with standard naming (e.g., "Grade 1 - A").</p>
                </div>
            )}
        </div>
    );
}
