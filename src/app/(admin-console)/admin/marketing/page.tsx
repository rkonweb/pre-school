"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    Layers,
    Image as ImageIcon,
    FileText,
    MessageSquare,
    MoreVertical,
    Eye,
    EyeOff,
    Trash2,
    Settings,
    Star,
    Sparkles,
    ChevronRight,
    SearchX,
    X,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getMarketingTemplatesAction,
    toggleMarketingTemplateStatusAction,
    deleteMarketingTemplateAction,
    getMarketingAttributesAction,
    createMarketingAttributeAction,
    deleteMarketingAttributeAction
} from "@/app/actions/marketing-actions";
import { toast } from "sonner";
import Link from "next/link";

import { MarketingThumbnail } from "@/components/admin-console/MarketingThumbnail";
import { StatCard } from "@/components/dashboard/StatCard";

export default function MarketingAdminPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeType, setActiveType] = useState("ALL");
    const [activeCategory, setActiveCategory] = useState("ALL");

    // Dynamic Attributes State
    const [formats, setFormats] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeType, activeCategory]);

    async function loadData() {
        setIsLoading(true);
        const [tplRes, fmtRes, catRes] = await Promise.all([
            getMarketingTemplatesAction(activeType, activeCategory),
            getMarketingAttributesAction("FORMAT"),
            getMarketingAttributesAction("CATEGORY")
        ]);

        if (tplRes.success) setTemplates(tplRes.data || []);
        else toast.error(tplRes.error || "Failed to load templates");

        if (fmtRes.success) setFormats(fmtRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);

        setIsLoading(false);
    }

    // Refresh only attributes (e.g. after add/delete)
    async function refreshAttributes() {
        const [fmtRes, catRes] = await Promise.all([
            getMarketingAttributesAction("FORMAT"),
            getMarketingAttributesAction("CATEGORY")
        ]);
        if (fmtRes.success) setFormats(fmtRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
    }

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Merge default "ALL" with dynamic lists
    const displayFormats = [{ id: "ALL", name: "All Formats" }, ...formats];
    const displayCategories = [{ id: "ALL", name: "All Categories" }, ...categories];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Marketing Architect</h2>
                    <p className="text-zinc-500 font-medium">Manage and deploy high-conversion marketing assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsManageModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-700 border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        Manage Attributes
                    </button>
                    <Link
                        href="/admin/marketing/new"
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Create Template
                    </Link>
                </div>
            </div>

            {/* Dynamic Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                    title="Total Assets"
                    value={templates.length.toString()}
                    icon={Layers}
                    color="blue"
                />
                <StatCard
                    title="Active Templates"
                    value={templates.filter(t => t.isActive).length.toString()}
                    icon={Sparkles}
                    color="purple"
                />
                <StatCard
                    title="Ready Formats"
                    value={formats.length.toString()}
                    icon={Tag}
                    color="green"
                />
                <StatCard
                    title="Categories"
                    value={categories.length.toString()}
                    icon={Filter}
                    color="zinc"
                />
            </div>

            {/* Filters & Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                        {displayFormats.map((format) => {
                            const val = format.name === "All Formats" ? "ALL" : format.name;
                            const isActive = activeType === val;
                            return (
                                <button
                                    key={format.id}
                                    onClick={() => setActiveType(val)}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                        isActive ? "bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50"
                                    )}
                                >
                                    {format.name.replace("All ", "")}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search templates by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <Filter className="h-4 w-4 ml-2 text-zinc-400" />
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="bg-transparent text-xs font-bold text-zinc-600 outline-none cursor-pointer py-1 px-2"
                        >
                            {displayCategories.map(c => <option key={c.id} value={c.name === "All Categories" ? "ALL" : c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <main className="w-full">

                {/* Templates Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className="aspect-[3/4] rounded-[2rem] bg-zinc-100 animate-pulse" />
                        ))}
                    </div>
                ) : filteredTemplates.length > 0 ? (
                    <div className="columns-1 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                        {filteredTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} onRefresh={loadData} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 border border-zinc-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                            <SearchX className="h-10 w-10 text-zinc-200" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">No Templates Found</h3>
                        <p className="text-sm text-zinc-400 max-w-xs mt-2">Try adjusting your filters or create a new template to get started.</p>
                    </div>
                )}
            </main>

            {/* Manage Attributes Modal */}
            {isManageModalOpen && (
                <ManageAttributesModal
                    onClose={() => setIsManageModalOpen(false)}
                    formats={formats}
                    categories={categories}
                    onUpdate={refreshAttributes}
                />
            )}
        </div>
    );
}

function TemplateCard({ template, onRefresh }: { template: any, onRefresh: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const zones = template.config ? JSON.parse(template.config) : [];

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this template?")) return;
        setIsDeleting(true);
        const res = await deleteMarketingTemplateAction(template.id);
        if (res.success) {
            toast.success("Template deleted");
            onRefresh();
        } else {
            toast.error(res.error || "Delete failed");
        }
        setIsDeleting(false);
    }

    async function toggleStatus() {
        const res = await toggleMarketingTemplateStatusAction(template.id, !template.isActive);
        if (res.success) {
            toast.success(`Template ${template.isActive ? 'deactivated' : 'activated'}`);
            onRefresh();
        }
    }

    return (
        <div className="group relative bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 break-inside-avoid mb-6">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
                <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
                    template.isActive
                        ? "bg-emerald-50/90 text-emerald-600 border-emerald-200/50 shadow-sm"
                        : "bg-zinc-100/90 text-zinc-400 border-zinc-200/50"
                )}>
                    {template.isActive ? "Live" : "Draft"}
                </span>
            </div>

            {/* Preview Image */}
            <div className="bg-zinc-50 relative overflow-hidden">
                <MarketingThumbnail
                    imageUrl={template.baseImageUrl}
                    zones={zones}
                    className="w-full h-auto object-contain"
                />

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-30 backdrop-blur-[2px]">
                    <Link
                        href={`/admin/marketing/${template.id}`}
                        className="h-10 w-10 rounded-xl bg-white text-zinc-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                        title="Edit Template"
                    >
                        <Settings className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={toggleStatus}
                        className="h-10 w-10 rounded-xl bg-white text-zinc-900 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                        title={template.isActive ? "Deactivate" : "Activate"}
                    >
                        {template.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-10 w-10 rounded-xl bg-white text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-5">
                <div>
                    <h4 className="text-sm font-bold text-zinc-900 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">{template.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Tag className="h-3 w-3 text-zinc-400" />
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{template.category || "General"}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ManageAttributesModal({ onClose, formats, categories, onUpdate }: { onClose: () => void, formats: any[], categories: any[], onUpdate: () => void }) {
    const [activeTab, setActiveTab] = useState<"FORMAT" | "CATEGORY">("CATEGORY");
    const [newItemName, setNewItemName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleAdd() {
        if (!newItemName.trim()) return;
        setIsSubmitting(true);
        const res = await createMarketingAttributeAction(activeTab, newItemName.trim());
        if (res.success) {
            toast.success("Added successfully");
            setNewItemName("");
            onUpdate();
        } else {
            toast.error("Failed to add");
        }
        setIsSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this attribute?")) return;
        const res = await deleteMarketingAttributeAction(id);
        if (res.success) {
            toast.success("Deleted successfully");
            onUpdate();
        } else {
            toast.error("Failed to delete");
        }
    }

    const items = activeTab === "FORMAT" ? formats : categories;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900">Manage Attributes</h3>
                        <p className="text-xs text-zinc-500 font-medium">Configure template formats and categories.</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-100 rounded-2xl mb-6">
                    {(["CATEGORY", "FORMAT"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all",
                                activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            {tab === "CATEGORY" ? "Categories" : "Formats"}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                                <Tag className="h-6 w-6 text-zinc-200" />
                            </div>
                            <p className="text-sm text-zinc-400 font-medium italic">No items found.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                                <span className="text-sm font-bold text-zinc-700">{item.name}</span>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add New */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder={`New ${activeTab === "CATEGORY" ? "Category" : "Format"} Name...`}
                        className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={isSubmitting || !newItemName.trim()}
                        className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

