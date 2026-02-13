"use client";

import { useState, useEffect } from "react";
import {
    Save,
    ArrowLeft,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMarketingTemplateAction, updateMarketingTemplateAction, getMarketingAttributesAction } from "@/app/actions/marketing-actions";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { MarketingDesigner } from "@/components/admin-console/MarketingDesigner";

/* ─── Page Component ──────────────────────────────────────────── */

export default function MarketingEditTemplatePage() {
    const router = useRouter();
    const { id } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        type: "",
        category: "",
        baseImageUrl: "",
        previewUrl: "",
        config: "[]"
    });

    const [zones, setZones] = useState<any[]>([]);
    const [formats, setFormats] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        const [tplRes, fmtRes, catRes] = await Promise.all([
            getMarketingTemplateAction(id as string),
            getMarketingAttributesAction("FORMAT"),
            getMarketingAttributesAction("CATEGORY")
        ]);

        if (fmtRes.success) setFormats(fmtRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);

        if (tplRes.success && tplRes.data) {
            setForm({
                name: tplRes.data.name,
                type: tplRes.data.type,
                category: tplRes.data.category,
                baseImageUrl: tplRes.data.baseImageUrl,
                previewUrl: tplRes.data.previewUrl || "",
                config: tplRes.data.config || "[]"
            });
            try {
                const parsedZones = JSON.parse(tplRes.data.config || "[]");
                const patchedZones = parsedZones.map((z: any) => {
                    if (!z.mockContent) {
                        const defaultMocks: Record<string, string> = {
                            'HEADLINE': 'ADMISSIONS OPEN',
                            'SUB_HEADLINE': '2025-2026 Session',
                            'CONTACT_INFO': '+1 234 567 8900',
                            'WEBSITE': 'www.myschool.edu',
                            'SCHOOL_NAME': 'Springfield Academy'
                        };
                        z.mockContent = defaultMocks[z.type] || z.label || "Text Content";
                    }
                    if (!z.style) {
                        z.style = {
                            fontFamily: 'Roboto',
                            fontSize: 5,
                            fillType: 'solid',
                            color: '#000000',
                            textAlign: 'center',
                            weight: 'bold'
                        };
                    }
                    return z;
                });
                setZones(patchedZones);
            } catch (e) {
                console.error("Failed to parse zones", e);
                setZones([]);
            }
        } else {
            toast.error("Failed to load template");
            router.push("/admin/marketing");
        }
        setIsLoading(false);
    }

    async function handleSave() {
        if (!form.name) return toast.error("Please enter a template name");

        setIsSaving(true);
        try {
            const res = await updateMarketingTemplateAction(id as string, {
                name: form.name,
                type: form.type,
                category: form.category,
                baseImageUrl: form.baseImageUrl,
                config: JSON.stringify(zones),
                previewUrl: form.previewUrl
            });

            if (res.success) {
                toast.success("Template saved!");
                router.push("/admin/marketing");
            } else {
                toast.error(res.error || "Failed to update template");
            }
        } catch (err: any) {
            console.error("handleSave error:", err);
            toast.error("Unexpected error: " + err.message);
        }
        setIsSaving(false);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const saveButton = (
        <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20",
                isSaving && "opacity-50 cursor-not-allowed"
            )}
        >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Template"}
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            <main className="flex-1 bg-zinc-50/50">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-8 py-8">
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
                        actions={saveButton}
                        backLink="/admin/marketing"
                    />
                </div>
            </main>
        </div>
    );
}
