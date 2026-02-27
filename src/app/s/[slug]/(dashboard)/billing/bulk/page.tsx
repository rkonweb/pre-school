"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, FileStack, Users, Calendar, DollarSign, Type, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBulkBillingInitData, generateBulkInvoicesAction } from "@/app/actions/billing-bulk-actions";
import { getFeeStructuresForBillingAction, generateStructureInvoicesAction } from "@/app/actions/fee-generation-actions";
import { toast } from "sonner";
import { useSidebar } from "@/context/SidebarContext";

export default function BulkInvoicePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [structures, setStructures] = useState<any[]>([]);
    const { currency } = useSidebar();
    const [isLoading, setIsLoading] = useState(true);

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [billingMode, setBillingMode] = useState<"STRUCTURED" | "CUSTOM">("STRUCTURED");
    const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

    // Custom Form Mode Stats
    const [formData, setFormData] = useState({
        title: `Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        amount: "",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0] // +10 days
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [successCount, setSuccessCount] = useState(0);

    useEffect(() => {
        loadInitData();
    }, [slug]);

    async function loadInitData() {
        setIsLoading(true);
        const [initRes, structRes] = await Promise.all([
            getBulkBillingInitData(slug),
            getFeeStructuresForBillingAction(slug)
        ]);

        if (initRes.success) setClassrooms(initRes.classrooms || []);
        if (structRes.success) {
            setStructures(structRes.structures || []);
            if (structRes.structures && structRes.structures.length > 0) {
                setSelectedStructureId(structRes.structures[0].id);
            }
        }
        setIsLoading(false);
    }

    const handleGenerate = async () => {
        if (!selectedClass) {
            toast.error("Please select a class");
            return;
        }

        setIsGenerating(true);
        let res;

        if (billingMode === "STRUCTURED") {
            if (!selectedStructureId || !formData.dueDate) {
                toast.error("Please select a template and due date.");
                setIsGenerating(false);
                return;
            }
            res = await generateStructureInvoicesAction(slug, selectedClass, selectedStructureId, formData.dueDate);
        } else {
            if (!formData.amount || !formData.title || !formData.dueDate) {
                toast.error("Please fill in all details");
                setIsGenerating(false);
                return;
            }
            res = await generateBulkInvoicesAction(slug, selectedClass, {
                title: formData.title,
                amount: Number(formData.amount),
                dueDate: formData.dueDate
            });
        }

        if (res.success) {
            setSuccessCount(res.count || 0);
            setIsDone(true);
            toast.success(res.message || `Generated ${res.count} invoices successfully!`);
        } else {
            toast.error(res.error || "Failed to generate invoices");
        }
        setIsGenerating(false);
    };

    const selectedClassData = classrooms.find(c => c.id === selectedClass);
    const selectedStructureData = structures.find(s => s.id === selectedStructureId);

    const calculateStructureTotal = (struct: any) => {
        if (!struct || !struct.components) return 0;
        return struct.components.reduce((sum: number, comp: any) => sum + (comp.amount || 0), 0);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/s/${slug}/billing`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Bulk Generate Invoices</h1>
                    <p className="text-sm text-zinc-500">Create fees and invoices for entire classes based on templates.</p>
                </div>
            </div>

            {!isDone ? (
                <div className="space-y-6">
                    {/* Class Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 ml-1">1. Target Classroom</label>
                        {isLoading ? (
                            <div className="h-32 rounded-2xl bg-zinc-100 animate-pulse" />
                        ) : classrooms.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                                <p className="text-zinc-500">No classes found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {classrooms.map((cls) => (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClass(cls.id)}
                                        className={cn(
                                            "flex flex-col items-start rounded-2xl border p-5 text-left transition-all",
                                            selectedClass === cls.id
                                                ? "border-brand bg-brand/5 ring-1 ring-brand"
                                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                        )}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-lg",
                                                selectedClass === cls.id ? "bg-brand text-white" : "bg-zinc-100 text-zinc-500"
                                            )}>
                                                <Users className="h-4 w-4" />
                                            </div>
                                            {selectedClass === cls.id && <Check className="h-4 w-4 text-brand" />}
                                        </div>
                                        <h3 className="mt-3 font-bold text-zinc-900 dark:text-zinc-50">{cls.name}</h3>
                                        <p className="mt-1 text-xs text-zinc-500">{cls._count?.students || 0} enrolled students</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 ml-1">2. Billing Mode</label>
                        <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setBillingMode("STRUCTURED")}
                                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", billingMode === "STRUCTURED" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500")}
                            >
                                <Layers className="w-4 h-4 inline-block mr-2" />
                                From Template
                            </button>
                            <button
                                onClick={() => setBillingMode("CUSTOM")}
                                className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", billingMode === "CUSTOM" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500")}
                            >
                                <Type className="w-4 h-4 inline-block mr-2" />
                                Custom Amount
                            </button>
                        </div>
                    </div>

                    {/* Invoice Configuration */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 ml-1">3. Invoice Configuration</label>
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-6">

                            {billingMode === "STRUCTURED" ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Select Fee Template</label>
                                        <select
                                            value={selectedStructureId || ""}
                                            onChange={(e) => setSelectedStructureId(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-200 h-10 text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none px-3 bg-white"
                                        >
                                            <option value="" disabled>Select a template...</option>
                                            {structures.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedStructureData && (
                                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Included Components</p>
                                            {selectedStructureData.components?.map((c: any) => (
                                                <div key={c.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-zinc-700">{c.name} {c.isOptional && <span className="text-xs text-brand ml-1">(Optional)</span>}</span>
                                                    <span className="font-bold">{currency}{c.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-base mt-2">
                                                <span className="font-bold text-zinc-900">Total Per Student</span>
                                                <span className="font-black text-brand">{currency}{calculateStructureTotal(selectedStructureData).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Custom Fee Title</label>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
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
                                                type="number"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                                                placeholder="0.00"
                                                title="Fee Amount"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shared Due Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Invoice Due Date</label>
                                <div className="relative max-w-[50%]">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
                                        title="Due Date"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-start gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-dashed">
                                <FileStack className="mt-0.5 h-5 w-5 text-brand shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900">Summary</h4>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        You are about to generate <strong className="text-zinc-900">
                                            {billingMode === "STRUCTURED" ?
                                                (selectedClassData?._count?.students || 0) * (selectedStructureData?.components?.length || 0) :
                                                (selectedClassData?._count?.students || 0)
                                            } fee records
                                        </strong> for <strong className="text-zinc-900">{selectedClassData?.name || "selected class"}</strong>.
                                        <br />
                                        Overall Value Flow: <strong className="text-zinc-900">{currency} {
                                            billingMode === "STRUCTURED" ?
                                                (calculateStructureTotal(selectedStructureData) * (selectedClassData?._count?.students || 0)).toLocaleString() :
                                                (Number(formData.amount || 0) * (selectedClassData?._count?.students || 0)).toLocaleString()
                                        }</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                                <Link href={`/s/${slug}/billing`} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 px-4">Cancel</Link>
                                <button
                                    disabled={!selectedClass || isGenerating || (billingMode === "CUSTOM" && !formData.amount)}
                                    onClick={handleGenerate}
                                    className="rounded-xl bg-brand px-8 py-2.5 text-sm font-bold text-[var(--secondary-color)] transition-colors hover:brightness-110 disabled:opacity-50 shadow-md shadow-brand/20 disabled:shadow-none"
                                >
                                    {isGenerating ? "Generating..." : "Generate Invoices"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-zinc-200 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                        <Check className="h-10 w-10" />
                    </div>
                    <h2 className="mt-6 text-3xl font-black text-zinc-900">Success!</h2>
                    <p className="mt-2 text-zinc-500 font-medium max-w-md">
                        {successCount} fee records have been successfully generated for <span className="text-zinc-900 font-bold">{selectedClassData?.name}</span>.
                    </p>
                    <div className="mt-10 flex gap-3">
                        <button
                            onClick={() => { setIsDone(false); setSelectedClass(null); }}
                            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-800 transition-colors"
                        >
                            Generate More
                        </button>
                        <Link
                            href={`/s/${slug}/billing`}
                            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-[var(--secondary-color)] shadow-md shadow-brand/20"
                        >
                            <Copy className="h-4 w-4" />
                            Return to Billing & Invoices
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
