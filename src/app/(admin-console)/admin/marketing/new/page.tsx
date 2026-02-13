"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Upload,
    ArrowLeft,
    ImageIcon,
    RefreshCw,
    CheckCircle2,
    Layers,
    Type,
    Sparkles,
    Settings,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createMarketingTemplateAction, getMarketingAttributesAction } from "@/app/actions/marketing-actions";
import { uploadFileAction } from "@/app/actions/upload-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarketingDesigner } from "@/components/admin-console/MarketingDesigner";

export default function MarketingNewTemplatePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Design

    const [form, setForm] = useState({
        name: "",
        type: "",
        category: "",
        baseImageUrl: "",
        previewUrl: "",
        config: "[]"
    });

    const [zones, setZones] = useState<any[]>([]);

    // Dynamic Attributes
    const [formats, setFormats] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        loadAttributes();
    }, []);

    async function loadAttributes() {
        const [fmtRes, catRes] = await Promise.all([
            getMarketingAttributesAction("FORMAT"),
            getMarketingAttributesAction("CATEGORY")
        ]);
        if (fmtRes.success) {
            setFormats(fmtRes.data || []);
            // Set default type if available
            if (fmtRes.data && fmtRes.data.length > 0) {
                setForm(f => ({ ...f, type: fmtRes.data[0].name }));
            }
        }
        if (catRes.success) {
            setCategories(catRes.data || []);
            // Set default category if available
            if (catRes.data && catRes.data.length > 0) {
                setForm(f => ({ ...f, category: catRes.data[0].name }));
            }
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "marketing-templates");

        const res = await uploadFileAction(formData);
        if (res.success) {
            setForm({ ...form, baseImageUrl: res.url, previewUrl: res.url });
            setStep(2);
            toast.success("Base image uploaded successfully");
        } else {
            toast.error(res.error || "Upload failed");
        }
        setIsUploading(false);
    }

    async function handleSave() {
        console.log("handleSave triggered", { form, zones });
        if (!form.name) return toast.error("Please enter a template name");
        if (!form.baseImageUrl) return toast.error("Please upload a base image first");
        if (!form.type) return toast.error("Please select a format");
        if (!form.category) return toast.error("Please select a category");

        setIsSaving(true);
        try {
            const res = await createMarketingTemplateAction({
                ...form,
                config: JSON.stringify(zones)
            });

            console.log("createMarketingTemplateAction response", res);

            if (res.success) {
                toast.success("Marketing template created successfully!");
                router.push("/admin/marketing");
            } else {
                toast.error(res.error || "Failed to create template");
            }
        } catch (err: any) {
            console.error("handleSave catch error", err);
            toast.error("Unexpected error: " + err.message);
        }
        setIsSaving(false);
    }

    const publishButton = (
        <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-zinc-900/10",
                isSaving && "opacity-50 cursor-not-allowed"
            )}
        >
            {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Publish Template
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            {/* Wizard Header - Only show in Step 1 */}
            {step === 1 && (
                <header className="bg-white border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/marketing" className="h-9 w-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="font-black text-zinc-900 leading-tight uppercase tracking-tighter">New <span className="text-indigo-600">Template</span></h1>
                            <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">ID: TEMPLATE_DRAFT</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Steps indicator */}
                        <div className="flex items-center gap-4">
                            {[
                                { num: 1, label: "Architecture" },
                                { num: 2, label: "Design" }
                            ].map((s) => (
                                <div key={s.num} className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300",
                                        step >= s.num ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-zinc-100 text-zinc-400"
                                    )}>
                                        {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
                                    </div>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors duration-300 hidden sm:block", step >= s.num ? "text-zinc-900" : "text-zinc-400")}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>
            )}

            <main className="flex-1 bg-zinc-50/50">
                {step === 1 && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 md:p-12">
                        {/* Meta Config */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Architecture</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Define the basic template structure.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label>Template Name</Label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., Summer Admissions Post"
                                        className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label>Category</Label>
                                    {categories.length > 0 ? (
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer"
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    ) : (
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                                            No categories found. <Link href="/admin/marketing" className="underline">Create Attributes</Link>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <Label>Format / Target Type</Label>
                                    {formats.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {formats.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, type: t.name })}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        form.type === t.name
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                                            : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                                                    )}
                                                >
                                                    <Layers className="h-3.5 w-3.5" />
                                                    {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                                            No formats found. <Link href="/admin/marketing" className="underline">Create Attributes</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upload Zone */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-dashed border-zinc-200 shadow-sm">
                            <div className="flex flex-col items-center justify-center text-center py-10">
                                <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                                    {isUploading ? <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" /> : <Upload className="h-10 w-10 text-indigo-400" />}
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Upload Foundation Image</h3>
                                <p className="text-sm text-zinc-400 max-w-sm mt-2 mb-8">
                                    Upload the high-resolution base image. You will define customization zones in the next step.
                                </p>

                                <label className={cn(
                                    "flex items-center gap-2 rounded-2xl px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[12px] tracking-widest transition-all cursor-pointer shadow-xl active:scale-95",
                                    isUploading && "opacity-50 pointer-events-none"
                                )}>
                                    <Plus className="h-5 w-5" />
                                    {isUploading ? "Uploading..." : "Select Master Asset"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                <p className="mt-4 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Max Size 10MB • PNG, JPG</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="px-8 py-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <MarketingDesigner
                            name={form.name}
                            onNameChange={(val) => setForm(prev => ({ ...prev, name: val }))}
                            type={form.type}
                            onTypeChange={(val) => setForm(prev => ({ ...prev, type: val }))}
                            category={form.category}
                            onCategoryChange={(val) => setForm(prev => ({ ...prev, category: val }))}
                            formats={formats}
                            categories={categories}
                            imageUrl={form.baseImageUrl}
                            zones={zones}
                            onZonesChange={setZones}
                            onPreviewUpdate={(url) => setForm(prev => ({ ...prev, previewUrl: url }))}
                            actions={publishButton}
                            onBack={() => setStep(1)}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest px-0.5">{children}</label>;
}
