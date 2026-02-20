"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Layers,
    Image as ImageIcon,
    FileText,
    MessageSquare,
    Download,
    Share2,
    Calendar,
    Sparkles,
    SearchX,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getMarketingTemplatesAction,
    getMarketingAttributesAction
} from "@/app/actions/marketing-actions";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketingThumbnail } from "@/components/admin-console/MarketingThumbnail";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function SchoolMarketingPage() {
    const params = useParams();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeType, setActiveType] = useState("ALL");
    const [activeCategory, setActiveCategory] = useState("ALL");

    // Dynamic Attributes
    const [formats, setFormats] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

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

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) && t.isActive
    );

    const displayFormats = [{ id: "ALL", name: "All Formats" }, ...formats];
    const displayCategories = [{ id: "ALL", name: "All Categories" }, ...categories];
    const slug = params.slug as string;

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        Marketing Studio
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">
                        Create and share high-impact assets for {slug}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 px-6 bg-brand-soft text-brand rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-brand/10">
                        <Sparkles className="h-4 w-4" />
                        Smart Branding Active
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Templates" value={templates.filter(t => t.isActive).length.toString()} subValue="Ready to use" icon={Layers} color="brand" />
                <StatCard title="Active Categories" value={categories.length.toString()} subValue="Across all formats" icon={Filter} color="purple" />
                <StatCard title="Print Ready" value={templates.filter(t => t.type === 'Print').length.toString()} subValue="High-res assets" icon={Download} color="orange" />
                <StatCard title="Digital Assets" value={templates.filter(t => t.type !== 'Print').length.toString()} subValue="Social & Digital" icon={Share2} color="green" />
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col gap-6">
                <div className="flex overflow-x-auto gap-2 pb-px border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
                    {displayFormats.map((format) => {
                        const val = format.name === "All Formats" ? "ALL" : format.name;
                        const isActive = activeType === val;
                        return (
                            <button
                                key={format.id}
                                onClick={() => setActiveType(val)}
                                className={cn(
                                    "px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2",
                                    isActive ? "text-brand border-brand" : "text-zinc-500 border-transparent hover:text-zinc-700"
                                )}
                            >
                                {format.name}
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-black">
                                    {val === "ALL" ? templates.length : templates.filter(t => t.type === val).length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl dark:border-zinc-800 dark:bg-zinc-950">
                        <Filter className="h-4 w-4 text-zinc-400" />
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest text-zinc-500 outline-none cursor-pointer min-w-[120px]"
                        >
                            {displayCategories.map(c => <option key={c.id} value={c.name === "All Categories" ? "ALL" : c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Templates Grid Card */}
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden min-h-[500px]">
                    <div className="p-8">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="aspect-[3/4] rounded-[2.5rem] bg-zinc-50 border border-zinc-100 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
                                {filteredTemplates.map((template) => (
                                    <SchoolTemplateCard key={template.id} template={template} slug={slug} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-24 px-8">
                                <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
                                    <SearchX className="h-10 w-10 text-zinc-200" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">No assets found</h3>
                                <p className="text-sm text-zinc-400 max-w-xs mt-2">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SchoolTemplateCard({ template, slug }: { template: any, slug: string }) {
    const zones = template.config ? JSON.parse(template.config) : [];

    return (
        <div className="group relative bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-brand/20 hover:-translate-y-2">
            <div className="bg-zinc-50 relative overflow-hidden">
                <MarketingThumbnail
                    imageUrl={template.baseImageUrl}
                    zones={zones}
                    className="w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-brand/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-30 p-8 text-center translate-y-4 group-hover:translate-y-0">
                    <Sparkles className="h-8 w-8 text-[var(--secondary-color)]/50 mb-4" />
                    <p className="text-[var(--secondary-color)] font-black uppercase text-xs tracking-widest mb-6">Professional <br />Marketing Asset</p>
                    <Link
                        href={`/s/${slug}/marketing/customize/${template.id}`}
                        className="px-8 py-3 bg-white text-brand rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all transform hover:scale-105 shadow-xl active:scale-95"
                    >
                        Customize Now
                    </Link>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tighter line-clamp-1">{template.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{template.category}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

