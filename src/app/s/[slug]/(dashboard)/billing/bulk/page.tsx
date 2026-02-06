"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, FileStack, Users, Calendar, DollarSign, Type } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBulkBillingInitData, generateBulkInvoicesAction } from "@/app/actions/billing-bulk-actions";
import { toast } from "sonner";

export default function BulkInvoicePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [currency, setCurrency] = useState("USD");
    const [isLoading, setIsLoading] = useState(true);

    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [successCount, setSuccessCount] = useState(0);

    // Form Stats
    const [formData, setFormData] = useState({
        title: `Tuition Fee - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        amount: "",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0] // +10 days
    });

    useEffect(() => {
        loadInitData();
    }, [slug]);

    async function loadInitData() {
        const res = await getBulkBillingInitData(slug);
        if (res.success) {
            setClassrooms(res.classrooms || []);
            setCurrency(res.currency || "USD");
        }
        setIsLoading(false);
    }

    const handleGenerate = async () => {
        if (!selectedClass || !formData.amount || !formData.title || !formData.dueDate) {
            toast.error("Please fill in all details");
            return;
        }

        setIsGenerating(true);
        const res = await generateBulkInvoicesAction(slug, selectedClass, {
            title: formData.title,
            amount: Number(formData.amount),
            dueDate: formData.dueDate
        });

        if (res.success) {
            setSuccessCount(res.count || 0);
            setIsDone(true);
            toast.success(`Generated ${res.count} invoices successfully!`);
        } else {
            toast.error(res.error || "Failed to generate invoices");
        }
        setIsGenerating(false);
    };

    const selectedClassData = classrooms.find(c => c.id === selectedClass);

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
                    <p className="text-sm text-zinc-500">Create fees and invoices for entire classes at once.</p>
                </div>
            </div>

            {!isDone ? (
                <div className="space-y-6">
                    {/* Class Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 ml-1">1. Select Class</label>
                        {isLoading ? (
                            <div className="h-32 rounded-2xl bg-zinc-100 animate-pulse" />
                        ) : classrooms.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                                <p className="text-zinc-500">No classes found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {classrooms.map((cls) => (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClass(cls.id)}
                                        className={cn(
                                            "flex flex-col items-start rounded-2xl border p-6 text-left transition-all",
                                            selectedClass === cls.id
                                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 dark:border-blue-500/50 dark:bg-blue-900/20"
                                                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
                                        )}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                                selectedClass === cls.id ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
                                            )}>
                                                <Users className="h-5 w-5" />
                                            </div>
                                            {selectedClass === cls.id && <Check className="h-5 w-5 text-blue-600" />}
                                        </div>
                                        <h3 className="mt-4 font-bold text-zinc-900 dark:text-zinc-50">{cls.name}</h3>
                                        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                                            <span>{cls._count?.students || 0} Students</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Invoice Configuration */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 ml-1">2. Invoice Details</label>
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Fee Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="e.g. Term 1 Fee"
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
                                            className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Due Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full rounded-xl border border-zinc-200 pl-10 h-10 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-dashed">
                                <FileStack className="mt-0.5 h-5 w-5 text-blue-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900">Summary</h4>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        You are about to generate <strong className="text-zinc-900">{selectedClassData?._count?.students || 0} invoices</strong> for <strong className="text-zinc-900">{selectedClassData?.name || "selected class"}</strong>.
                                        Total value: <strong className="text-zinc-900">{currency} {Number(formData.amount || 0) * (selectedClassData?._count?.students || 0)}</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                                <Link href={`/s/${slug}/billing`} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 px-4">Cancel</Link>
                                <button
                                    disabled={!selectedClass || isGenerating || !formData.amount}
                                    onClick={handleGenerate}
                                    className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 hover:shadow-lg disabled:hover:shadow-none bg-gradient-to-r from-blue-600 to-indigo-600"
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
                        {successCount} invoices have been successfully generated for <span className="text-zinc-900 font-bold">{selectedClassData?.name}</span>.
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
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 shadow-lg shadow-zinc-200"
                        >
                            <Copy className="h-4 w-4" />
                            View Invoices
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
