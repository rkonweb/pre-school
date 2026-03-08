"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Check, Copy, FileStack, Users, Calendar, DollarSign,
    Type, Layers, Loader2, AlertCircle, ChevronRight, User
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBulkBillingInitData, generateBulkInvoicesAction, getClassStudentsAction } from "@/app/actions/billing-bulk-actions";
import { getFeeStructuresForBillingAction, generateStructureInvoicesAction } from "@/app/actions/fee-generation-actions";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import { useSidebar } from "@/context/SidebarContext";

export default function BulkInvoicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const { currency } = useSidebar();

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [structures, setStructures] = useState<any[]>([]);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [billingMode, setBillingMode] = useState<"STRUCTURED" | "CUSTOM">("STRUCTURED");
    const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: `Term Fee - ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
        amount: "",
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [successResult, setSuccessResult] = useState<{ count: number; message: string } | null>(null);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const [initRes, structRes] = await Promise.all([
                getBulkBillingInitData(slug),
                getFeeStructuresForBillingAction(slug),
            ]);
            if (initRes.success) setClassrooms(initRes.classrooms || []);
            if (structRes.success) {
                setStructures(structRes.structures || []);
                if (structRes.structures?.length) setSelectedStructureId(structRes.structures[0].id);
            }
            setIsLoading(false);
        })();
    }, [slug]);

    const loadStudents = useCallback(async (classId: string) => {
        setIsLoadingStudents(true);
        setClassStudents([]);
        const res = await getClassStudentsAction(slug, classId);
        if (res.success) setClassStudents(res.students || []);
        else toast.error(res.error || "Failed to load students");
        setIsLoadingStudents(false);
    }, [slug]);

    const handleSelectClass = (classId: string) => {
        setSelectedClass(classId);
        loadStudents(classId);
    };

    const handleGenerate = async () => {
        if (!selectedClass) { toast.error("Please select a class"); return; }
        setIsGenerating(true);
        let res: any;
        const academicYearId = getCookie(`academic_year_${slug}`) || undefined;

        if (billingMode === "STRUCTURED") {
            if (!selectedStructureId) { toast.error("Please select a fee template"); setIsGenerating(false); return; }
            if (!formData.dueDate) { toast.error("Please set a due date"); setIsGenerating(false); return; }
            res = await generateStructureInvoicesAction(slug, selectedClass, selectedStructureId, formData.dueDate, academicYearId);
        } else {
            if (!formData.amount || !formData.title || !formData.dueDate) {
                toast.error("Please fill all required fields"); setIsGenerating(false); return;
            }
            res = await generateBulkInvoicesAction(slug, selectedClass, {
                title: formData.title, amount: Number(formData.amount), dueDate: formData.dueDate,
            }, academicYearId);
        }
        setIsGenerating(false);
        if (res.success) {
            setSuccessResult({ count: res.count || 0, message: res.message || `Generated ${res.count} invoices!` });
            setIsDone(true);
            toast.success(res.message || "Invoices generated!");
        } else {
            toast.error(res.error || "Failed to generate invoices");
        }
    };

    const selectedClassData = classrooms.find(c => c.id === selectedClass);
    const selectedStructureData = structures.find(s => s.id === selectedStructureId);

    const filteredStructures = useMemo(() => {
        if (!selectedClass) return [];
        return structures.filter(s => {
            try {
                const ids = JSON.parse(s.classIds || "[]");
                return ids.includes(selectedClass);
            } catch (e) {
                return false;
            }
        });
    }, [structures, selectedClass]);

    // Reset selected structure if it's not in filtered list
    useEffect(() => {
        if (selectedClass && filteredStructures.length > 0) {
            if (!selectedStructureId || !filteredStructures.find(s => s.id === selectedStructureId)) {
                setSelectedStructureId(filteredStructures[0].id);
            }
        } else if (selectedClass && filteredStructures.length === 0) {
            setSelectedStructureId(null);
        }
    }, [filteredStructures, selectedClass, selectedStructureId]);

    const structureTotal = selectedStructureData?.components?.reduce((s: number, c: any) => s + (c.amount || 0), 0) || 0;
    const canGenerate = !!selectedClass && !isGenerating &&
        (billingMode === "CUSTOM" ? (!!formData.amount && !!formData.title) : !!selectedStructureId) &&
        !!formData.dueDate;
    const expectedFees = billingMode === "STRUCTURED"
        ? classStudents.length * (selectedStructureData?.components?.length || 0)
        : classStudents.length;
    const expectedValue = billingMode === "STRUCTURED"
        ? structureTotal * classStudents.length
        : Number(formData.amount || 0) * classStudents.length;

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/s/${slug}/billing`} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Bulk Generate Invoices</h1>
                    <p className="text-sm text-zinc-500">Create fees for entire classes in one click.</p>
                </div>
            </div>

            {isDone ? (
                /* ── Success Screen ── */
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-zinc-200 bg-white py-20 text-center shadow-sm">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                        <Check className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900">Success!</h2>
                    <p className="mt-3 text-zinc-500 font-medium max-w-md">{successResult?.message}</p>
                    <p className="mt-1 text-sm text-zinc-400">Class: <strong className="text-zinc-700">{selectedClassData?.name}</strong></p>
                    <div className="mt-10 flex gap-3">
                        <button
                            onClick={() => { setIsDone(false); setSelectedClass(null); setClassStudents([]); setSuccessResult(null); }}
                            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-colors"
                        >
                            Generate More
                        </button>
                        <Link
                            href={`/s/${slug}/billing`}
                            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-[var(--secondary-color)] shadow-md shadow-brand/20"
                        >
                            <Copy className="h-4 w-4" />
                            View Billing
                        </Link>
                    </div>
                </div>
            ) : (
                /* ── Main Form ── */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left column: Steps ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1 — Class Selection */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">1</span>
                                Target Classroom
                            </label>
                            {isLoading ? (
                                <div className="h-32 rounded-2xl bg-zinc-100 animate-pulse" />
                            ) : classrooms.length === 0 ? (
                                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                                    <p className="text-zinc-500 font-semibold">No classrooms found.</p>
                                    <Link href={`/s/${slug}/academics/classrooms`} className="text-xs text-brand font-bold hover:underline mt-2 inline-block">+ Create Classroom →</Link>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {classrooms.map((cls) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => handleSelectClass(cls.id)}
                                            className={cn(
                                                "flex flex-col items-start rounded-2xl border p-4 text-left transition-all",
                                                selectedClass === cls.id
                                                    ? "border-brand bg-brand/5 ring-2 ring-brand/30 shadow-md"
                                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", selectedClass === cls.id ? "bg-brand text-[var(--secondary-color)]" : "bg-zinc-100 text-zinc-500")}>
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                {selectedClass === cls.id && <Check className="h-4 w-4 text-brand" />}
                                            </div>
                                            <h3 className="mt-3 font-bold text-zinc-900">{cls.name}</h3>
                                            <p className="mt-0.5 text-xs text-zinc-500 font-medium">{cls._count?.students || 0} active students</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Steps 2 & 3 — only shown once a class is chosen */}
                        {!selectedClass ? (
                            <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium py-2 ml-1">
                                <span className="text-lg">←</span>
                                Select a classroom above to continue
                            </div>
                        ) : (
                            <>
                                {/* Step 2 — Billing Mode */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">2</span>
                                        Billing Mode
                                    </label>
                                    <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
                                        <button
                                            onClick={() => setBillingMode("STRUCTURED")}
                                            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", billingMode === "STRUCTURED" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700")}
                                        >
                                            <Layers className="w-4 h-4 inline-block mr-2" />
                                            From Template
                                        </button>
                                        <button
                                            onClick={() => setBillingMode("CUSTOM")}
                                            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", billingMode === "CUSTOM" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700")}
                                        >
                                            <Type className="w-4 h-4 inline-block mr-2" />
                                            Custom Amount
                                        </button>
                                    </div>
                                </div>

                                {/* Step 3 — Invoice Config */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">3</span>
                                        Invoice Configuration
                                        <span className="ml-1 text-brand font-bold">— {selectedClassData?.name}</span>
                                    </label>
                                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">

                                        {billingMode === "STRUCTURED" ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-bold uppercase text-zinc-500">Select Fee Template</label>
                                                        <Link href={`/s/${slug}/settings/fees`} className="text-xs font-bold text-brand hover:underline">+ Create Template</Link>
                                                    </div>
                                                    {filteredStructures.length === 0 ? (
                                                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                                                            <AlertCircle className="h-8 w-8 text-zinc-300" />
                                                            <p className="text-sm font-semibold text-zinc-500">No fee templates found for this grade.</p>
                                                            <Link href={`/s/${slug}/settings/fees`} className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-[var(--secondary-color)] hover:brightness-110 transition-all">
                                                                Go to Fee Configuration →
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={selectedStructureId || ""}
                                                            onChange={e => setSelectedStructureId(e.target.value)}
                                                            className="w-full rounded-xl border border-zinc-200 h-10 text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none px-3 bg-white"
                                                            title="Select Fee Template"
                                                        >
                                                            {filteredStructures.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name} — {s.academicYear}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                                {selectedStructureData && (
                                                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Components</p>
                                                        {selectedStructureData.components?.map((c: any) => (
                                                            <div key={c.id} className="flex justify-between items-center text-sm">
                                                                <span className="text-zinc-700 font-medium">
                                                                    {c.name}
                                                                    {c.isOptional && <span className="text-[10px] text-brand ml-1 bg-brand/10 px-1.5 py-0.5 rounded-full">Optional</span>}
                                                                </span>
                                                                <span className="font-bold">{currency}{c.amount.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        ))}
                                                        <div className="pt-2 border-t border-zinc-200 flex justify-between items-center font-black">
                                                            <span className="text-zinc-900">Total Per Student</span>
                                                            <span className="text-brand">{currency}{structureTotal.toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-zinc-500">Fee Title</label>
                                                    <div className="relative">
                                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                        <input
                                                            value={formData.title}
                                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                            className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand outline-none"
                                                            placeholder="e.g. Field Trip Fee"
                                                            title="Fee Title"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-zinc-500">Amount ({currency})</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                        <input
                                                            type="number" min="0"
                                                            value={formData.amount}
                                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                            className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand outline-none"
                                                            placeholder="0.00"
                                                            title="Fee Amount"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Due Date — shared */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-zinc-500">Invoice Due Date</label>
                                            <div className="relative max-w-xs">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <input
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand outline-none"
                                                    title="Due Date"
                                                />
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="flex items-start gap-3 bg-zinc-50 p-4 rounded-xl border border-dashed border-zinc-200">
                                            <FileStack className="mt-0.5 h-5 w-5 text-brand shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-bold text-zinc-900">Summary</p>
                                                <p className="mt-1 text-zinc-500">
                                                    Will create <strong className="text-zinc-900">{expectedFees} fee records</strong> for{" "}
                                                    <strong className="text-zinc-900">{selectedClassData?.name}</strong>.
                                                    {" "}Total value:{" "}
                                                    <strong className="text-zinc-900">{currency}{expectedValue.toLocaleString('en-IN')}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
                                            <Link href={`/s/${slug}/billing`} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 px-4">Cancel</Link>
                                            <button
                                                disabled={!canGenerate}
                                                onClick={handleGenerate}
                                                className="flex items-center gap-2 rounded-xl bg-brand px-8 py-2.5 text-sm font-bold text-[var(--secondary-color)] transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand/20"
                                            >
                                                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {isGenerating ? "Generating..." : "Generate Invoices"}
                                                {!isGenerating && <ChevronRight className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Right column: Student Preview ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                                <p className="text-xs font-black text-zinc-700 uppercase tracking-wider">Student Preview</p>
                                {classStudents.length > 0 && (
                                    <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                                        {classStudents.length} students
                                    </span>
                                )}
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {!selectedClass ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                                        <Users className="h-8 w-8 text-zinc-200" />
                                        <p className="text-xs text-zinc-400 font-medium">Select a class to preview students</p>
                                    </div>
                                ) : isLoadingStudents ? (
                                    <div className="flex items-center justify-center py-12 gap-2">
                                        <Loader2 className="h-5 w-5 text-brand animate-spin" />
                                        <p className="text-xs text-zinc-500 font-medium">Loading students...</p>
                                    </div>
                                ) : classStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
                                        <AlertCircle className="h-8 w-8 text-amber-400" />
                                        <p className="text-sm font-semibold text-zinc-600">No active students</p>
                                        <p className="text-xs text-zinc-400">This class has no active enrolled students.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-zinc-50">
                                        {classStudents.map(s => (
                                            <li key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                                                <div className="h-7 w-7 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                                    <User className="h-4 w-4 text-brand" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-zinc-800 truncate">{s.firstName} {s.lastName}</p>
                                                    <p className="text-[10px] text-zinc-400 font-mono">{s.admissionNumber}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
