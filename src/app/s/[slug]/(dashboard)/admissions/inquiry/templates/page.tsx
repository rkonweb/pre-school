"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    MessageCircle,
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Copy,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Code,
    Languages,
    ChevronLeft,
    Tag,
    AlertCircle,
    Check,
    X,
    Save,
    Variable
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getWhatsAppTemplatesAction,
    toggleWhatsAppTemplateAction,
    saveWhatsAppTemplateAction,
    deleteWhatsAppTemplateAction
} from "@/app/actions/whatsapp-template-actions";
import { toast } from "sonner";
import Link from "next/link";

const CATEGORIES = ["ADMISSION", "TOUR", "PAYMENT", "VALUE", "NURTURE", "REENGAGEMENT"];
const LANGUAGES = ["EN", "HI", "AR", "ES", "FR"];
const SCORE_BANDS = ["HOT", "WARM", "COOL", "COLD"];

export default function TemplateLibraryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Modal State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, [slug]);

    async function loadTemplates() {
        setIsLoading(true);
        const res = await getWhatsAppTemplatesAction(slug);
        if (res.success) setTemplates(res.templates || []);
        setIsLoading(false);
    }

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.body.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || t.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchTerm, selectedCategory]);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await toggleWhatsAppTemplateAction(slug, id, !currentStatus);
        if (res.success) {
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
            toast.success(`Template ${!currentStatus ? 'Activated' : 'Paused'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This template will be permanently removed.")) return;
        const res = await deleteWhatsAppTemplateAction(slug, id);
        if (res.success) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Template deleted");
        }
    };

    const handleOpenEditor = (template?: any) => {
        if (template) {
            setEditingTemplate({
                ...template,
                scoreBands: JSON.parse(template.scoreBands || "[]"),
                variables: JSON.parse(template.variables || "[]")
            });
        } else {
            setEditingTemplate({
                name: "",
                category: "ADMISSION",
                language: "EN",
                body: "",
                scoreBands: ["HOT", "WARM"],
                variables: [],
                isActive: true
            });
        }
        setIsEditorOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                            Communication Templates
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        AI-Ready WhatsApp Messaging Library
                    </p>
                </div>
                <button
                    onClick={() => handleOpenEditor()}
                    className="h-11 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-900/10 hover:bg-brand transition-all"
                >
                    <Plus className="h-4 w-4" />
                    New Template
                </button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        !selectedCategory ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                    )}
                >
                    All Types
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            selectedCategory === cat ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 rounded-[20px] border-zinc-200 bg-white pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand/20 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-6 px-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-zinc-900 leading-none">{templates.filter(t => t.isActive).length}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Active</span>
                    </div>
                    <div className="h-8 w-px bg-zinc-100" />
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-zinc-400 leading-none">{templates.filter(t => !t.isActive).length}</span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Drafts</span>
                    </div>
                </div>
            </div>

            {/* Template Grid */}
            {isLoading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-zinc-100">
                    <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-200 mb-6">
                        <MessageCircle className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">No templates matched your search</p>
                    <button
                        onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}
                        className="mt-4 text-xs font-black uppercase text-brand underline underline-offset-4"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="group flex flex-col rounded-[40px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 hover:border-brand/30 hover:shadow-brand/5 transition-all relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-xl bg-zinc-50 border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:bg-brand/5 group-hover:text-brand group-hover:border-brand/10 transition-colors">
                                        {template.category}
                                    </span>
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        {JSON.parse(template.scoreBands || "[]").map((band: string) => (
                                            <div key={band} title={band} className={cn(
                                                "h-5 w-5 rounded-full border-2 border-white text-[7px] font-black flex items-center justify-center uppercase",
                                                band === 'HOT' ? 'bg-red-500 text-white' : band === 'WARM' ? 'bg-orange-400 text-white' : band === 'COOL' ? 'bg-blue-400 text-white' : 'bg-zinc-400 text-white'
                                            )}>
                                                {band[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEditor(template)}
                                        className="h-8 w-8 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-brand"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="h-8 w-8 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-black text-zinc-900 mb-3 truncate group-hover:text-brand transition-colors">{template.name}</h3>
                                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-6">
                                    <p className="text-xs text-zinc-500 line-clamp-4 font-medium leading-relaxed italic">
                                        "{template.body}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Languages className="h-3 w-3" />
                                        {template.language}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Variable className="h-3 w-3" />
                                        {JSON.parse(template.variables || "[]").length} Vars
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(template.id, template.isActive)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        template.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                                    )}
                                >
                                    {template.isActive ? 'Active' : 'Draft'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Template Editor Modal */}
            {isEditorOpen && (
                <TemplateEditorModal
                    slug={slug}
                    template={editingTemplate}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={(newTemplate) => {
                        if (editingTemplate.id) {
                            setTemplates(prev => prev.map(t => t.id === newTemplate.id ? newTemplate : t));
                        } else {
                            setTemplates(prev => [newTemplate, ...prev]);
                        }
                        setIsEditorOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function TemplateEditorModal({ slug, template, onClose, onSave }: any) {
    const [formData, setFormData] = useState(template);
    const [isSaving, setIsSaving] = useState(false);

    // Live variable detection
    useEffect(() => {
        const regex = /{{(.*?)}}/g;
        const found = [];
        let match;
        while ((match = regex.exec(formData.body)) !== null) {
            found.push(match[1]);
        }
        const uniqueVars = Array.from(new Set(found));
        setFormData(prev => ({ ...prev, variables: uniqueVars }));
    }, [formData.body]);

    const handleSave = async () => {
        if (!formData.name || !formData.body) {
            toast.error("Please fill Name and Body");
            return;
        }
        setIsSaving(true);
        const res = await saveWhatsAppTemplateAction(slug, formData);
        if (res.success) {
            onSave(res.template);
            toast.success("Template Saved");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">
                            {template.id ? 'Edit Template' : 'New Template'}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Design your WhatsApp communication</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Basic Info */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Template Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Tour Confirmation"
                                className="w-full h-12 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-sm font-bold focus:ring-2 focus:ring-brand/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-12 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-sm font-bold focus:ring-2 focus:ring-brand/20 outline-none uppercase"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Language & Body */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Message Body</label>
                            <div className="flex items-center gap-2">
                                <Languages className="h-3 w-3 text-zinc-400" />
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="text-[10px] font-black uppercase bg-transparent outline-none text-zinc-600"
                                >
                                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="relative">
                            <textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                rows={6}
                                placeholder="Hi {{parentName}}, thank you for your inquiry..."
                                className="w-full rounded-3xl border-zinc-200 bg-zinc-50 p-6 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-brand/20 outline-none resize-none"
                            />
                            <div className="absolute top-4 right-4 text-[8px] font-black uppercase bg-zinc-200 text-zinc-600 px-2 py-1 rounded-lg">
                                Use {"{{variable}}"} syntax
                            </div>
                        </div>

                        {/* Variables Detected */}
                        {formData.variables.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.variables.map((v: string) => (
                                    <span key={v} className="px-2 py-1 rounded-lg bg-brand/5 border border-brand/10 text-[9px] font-black uppercase tracking-widest text-brand flex items-center gap-1.5 shadow-sm">
                                        <Variable className="h-2.5 w-2.5" />
                                        {v}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Score Band Configuration */}
                    <div className="space-y-4 pt-4 border-t border-zinc-50">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Apply to Score Bands</label>
                        <div className="flex gap-4">
                            {SCORE_BANDS.map(band => {
                                const isActive = formData.scoreBands.includes(band);
                                return (
                                    <button
                                        key={band}
                                        onClick={() => {
                                            const next = isActive ? formData.scoreBands.filter((b: string) => b !== band) : [...formData.scoreBands, band];
                                            setFormData({ ...formData, scoreBands: next });
                                        }}
                                        className={cn(
                                            "flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                            isActive
                                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/20"
                                                : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                                        )}
                                    >
                                        {band}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={cn(
                                "h-6 w-11 rounded-full flex items-center px-1 transition-all",
                                formData.isActive ? "bg-green-500" : "bg-zinc-300"
                            )}
                        >
                            <div className={cn("h-4 w-4 bg-white rounded-full transition-all shadow-sm", formData.isActive ? "translate-x-5" : "")} />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            {formData.isActive ? 'Active Mode' : 'Draft Mode'}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-900/10 hover:bg-brand transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Persist Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
