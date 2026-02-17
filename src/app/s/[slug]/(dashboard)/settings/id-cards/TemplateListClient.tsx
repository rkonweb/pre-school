
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CreditCard, Loader2, Layout, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    deleteIDCardTemplateAction,
    createIDCardTemplateAction,
    resetIDCardTemplateAction,
    duplicateIDCardTemplateAction
} from "@/app/actions/id-card-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IDCardMockup } from "@/components/id-cards/IDCardMockup";

interface TemplateListClientProps {
    slug: string;
    schoolId: string;
    initialTemplates: any[];
}

const MOCK_STUDENT = {
    firstName: "Johnny",
    lastName: "Appleseed",
    admissionNumber: "2024-001",
    grade: "Grade 1-A",
    bloodGroup: "O+",
    avatar: "https://images.unsplash.com/photo-1597524419828-976722243053?q=80&w=256&h=256&fit=crop"
};

const MOCK_SCHOOL = {
    name: "Pre-School Academy",
    logo: undefined
};

export function TemplateListClient({ slug, schoolId, initialTemplates }: TemplateListClientProps) {
    const [templates, setTemplates] = useState(initialTemplates);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const router = useRouter();

    // Sync when props change (after save/refresh)
    const [prevInitial, setPrevInitial] = useState(initialTemplates);
    if (initialTemplates !== prevInitial) {
        setTemplates(initialTemplates);
        setPrevInitial(initialTemplates);
    }

    // CRITICAL: Filter to only show "Root" templates in the main grid
    // If a template has a parentTemplateId, it's an override and should NOT be a separate card
    const rootTemplates = templates.filter(t => !t.parentTemplateId);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        setDeletingId(id);
        const result = await deleteIDCardTemplateAction(id, slug);
        setDeletingId(null);

        if (result.success) {
            toast.success("Template deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete template");
        }
    };

    const handleReset = async (overrideId: string) => {
        if (!confirm("Are you sure you want to reset to the original template? This will delete your local customizations.")) return;

        setIsProcessing(overrideId);
        const result = await resetIDCardTemplateAction(overrideId, slug);
        setIsProcessing(null);

        if (result.success) {
            toast.success("Template reset to original");
            router.refresh();
        } else {
            toast.error("Failed to reset template");
        }
    };

    const handleDuplicate = async (templateId: string) => {
        setIsProcessing(templateId);
        const toastId = toast.loading("Duplicating template...");
        const result = await duplicateIDCardTemplateAction(templateId, slug);
        setIsProcessing(null);
        toast.dismiss(toastId);

        if (result.success) {
            toast.success("Template duplicated successfully");
            router.refresh();
        } else {
            toast.error("Failed to duplicate template");
        }
    };

    const handleEdit = async (template: any) => {
        if (template.isSystem && !template.schoolId) {
            const override = template.childTemplates?.[0];
            if (override) {
                router.push(`/s/${slug}/settings/id-cards/designer/${override.id}`);
            } else {
                setIsProcessing(template.id);
                const toastId = toast.loading("Creating local copy...");

                const data = {
                    name: template.name,
                    description: template.description,
                    layout: template.layout,
                    dimensions: template.dimensions,
                    orientation: template.orientation,
                    isSystem: false,
                    width: template.width,
                    height: template.height,
                    unit: template.unit,
                    bleed: template.bleed,
                    safeMargin: template.safeMargin,
                    schoolId: schoolId,
                    parentTemplateId: template.id
                };

                const result = await createIDCardTemplateAction(data, slug);
                setIsProcessing(null);
                toast.dismiss(toastId);

                if (result.success && result.data) {
                    router.push(`/s/${slug}/settings/id-cards/designer/${result.data.id}`);
                } else {
                    toast.error("Failed to create local copy");
                }
            }
        } else {
            router.push(`/s/${slug}/settings/id-cards/designer/${template.id}`);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rootTemplates.length === 0 ? (
                <div className="col-span-full py-20 border-2 border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300">
                        <CreditCard className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">No Templates Found</h3>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Get started by creating your first ID card design</p>
                    </div>
                    <Link href={`/s/${slug}/settings/id-cards/designer/new`}>
                        <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                            <Plus className="h-3.5 w-3.5 mr-2" /> Create First Template
                        </Button>
                    </Link>
                </div>
            ) : (
                rootTemplates.map(template => {
                    const isSystem = template.isSystem && !template.schoolId;
                    const override = template.childTemplates?.[0];
                    const activeTemplate = override || template;
                    const hasOverride = !!override;

                    return (
                        <div key={template.id} className="group transition-all duration-500">
                            <div className="aspect-[4/5] rounded-[2.5rem] mb-4 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500 shadow-xl shadow-zinc-200/50 group-hover:shadow-2xl group-hover:shadow-zinc-300/50">
                                <IDCardMockup
                                    template={activeTemplate}
                                    student={MOCK_STUDENT}
                                    school={MOCK_SCHOOL}
                                    className="scale-100"
                                    useDesignContent={true}
                                    side="FRONT"
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-zinc-900/10 backdrop-blur-0 group-hover:backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-12 text-center pointer-events-none group-hover:pointer-events-auto">
                                    <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-3">
                                        <Button
                                            onClick={() => handleEdit(template)}
                                            disabled={!!isProcessing}
                                            className="w-full rounded-2xl bg-white text-zinc-900 font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-50 border-none shadow-2xl py-6 disabled:opacity-50"
                                        >
                                            {isProcessing === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (hasOverride || !isSystem ? "Open Architect" : "Customize Template")}
                                        </Button>

                                        {!hasOverride && isSystem && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDuplicate(template.id)}
                                                disabled={!!isProcessing}
                                                className="w-full rounded-2xl bg-black/10 backdrop-blur text-white border-white/20 font-bold uppercase tracking-widest text-[11px] hover:bg-black/20 py-6 disabled:opacity-50"
                                            >
                                                <Copy className="h-3.5 w-3.5 mr-2" /> Create Separate Copy
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {isSystem && (
                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                        <div className="bg-indigo-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                                            System Original
                                        </div>
                                        {hasOverride && (
                                            <div className="bg-emerald-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                                Customized
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-4">
                                <div>
                                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{activeTemplate.name}</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                        {activeTemplate.orientation} • {activeTemplate.width || '85.6'}x{activeTemplate.height || '54'}mm
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(template)}
                                        disabled={!!isProcessing}
                                        title="Edit Template"
                                        className="h-9 w-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-indigo-600 border border-zinc-100 transition-all hover:bg-white hover:shadow-sm disabled:opacity-50"
                                    >
                                        {isProcessing === template.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                                    </button>

                                    <button
                                        onClick={() => handleDuplicate(activeTemplate.id)}
                                        disabled={!!isProcessing}
                                        title="Duplicate (Create copy)"
                                        className="h-9 w-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-emerald-600 border border-zinc-100 transition-all hover:bg-white hover:shadow-sm disabled:opacity-50"
                                    >
                                        {isProcessing === activeTemplate.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-4 w-4" />}
                                    </button>

                                    {hasOverride && (
                                        <button
                                            onClick={() => handleReset(override.id)}
                                            disabled={!!isProcessing}
                                            title="Reset to Original"
                                            className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-400 hover:text-amber-600 border border-amber-100 transition-all hover:bg-white hover:shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessing === override.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layout className="h-4 w-4 rotate-180" />}
                                        </button>
                                    )}

                                    {(!isSystem || hasOverride) && (
                                        <button
                                            onClick={() => handleDelete(activeTemplate.id)}
                                            disabled={deletingId === activeTemplate.id}
                                            title="Delete Template"
                                            className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 border border-rose-100 transition-all hover:bg-white hover:shadow-sm disabled:opacity-50"
                                        >
                                            {deletingId === activeTemplate.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
