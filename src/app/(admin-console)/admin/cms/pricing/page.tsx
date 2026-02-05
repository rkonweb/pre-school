"use client";

import { useEffect, useState } from "react";
import {
    getPricingPageContentAction,
    upsertPricingSectionAction,
    togglePricingSectionAction
} from "@/app/actions/cms-actions";
import {
    Eye, EyeOff, Edit2, Save, X, Plus, Trash2,
    Sparkles, HelpCircle, CreditCard, Layout, Search
} from "lucide-react";
import { toast } from "sonner";
import ContentEditor from "./content-editor";

export const dynamic = "force-dynamic";

interface PricingSection {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string;
    isEnabled: boolean;
    sortOrder: number;
}

const SECTION_TEMPLATES = [
    {
        key: "hero",
        name: "Hero Section",
        icon: Sparkles,
        defaultTitle: "Transparent Pricing for Every School",
        defaultSubtitle: "Whether you are a small daycare or a multi-campus institution, we have a plan that fits.",
        defaultContent: JSON.stringify({
            headline: "Transparent Pricing <span class='text-[#FF9F99]'>for Every School</span>",
            description: "Whether you are a small daycare or a multi-campus institution, we have a plan that fits your needs perfectly.",
            badge: "No hidden fees. Cancel anytime.",
            badgeIcon: "Star"
        }, null, 2)
    },
    {
        key: "plans",
        name: "Pricing Plans Layout",
        icon: CreditCard,
        defaultTitle: "Pricing Cards",
        defaultSubtitle: "Layout settings for the pricing grid",
        defaultContent: JSON.stringify({
            showPopularBadge: true,
            popularBadgeText: "Most Popular",
            billingToggle: true
        }, null, 2)
    },
    {
        key: "comparison",
        name: "Feature Comparison",
        icon: Layout,
        defaultTitle: "Comprehensive Comparison",
        defaultSubtitle: "Detailed breakdown table",
        defaultContent: JSON.stringify({
            title: "Comprehensive Comparison",
            description: "Detailed breakdown of what's included in each plan so you can make an informed decision.",
            showTable: true
        }, null, 2)
    },
    {
        key: "faq",
        name: "FAQ Section",
        icon: HelpCircle,
        defaultTitle: "Frequently Asked Questions",
        defaultSubtitle: "Common pre-sales questions",
        defaultContent: JSON.stringify({
            title: "Frequently Asked Questions",
            questions: [
                { "q": "Can I upgrade my plan later?", "a": "Yes, you can upgrade or downgrade your plan at any time." },
                { "q": "Do you offer a free trial?", "a": "Absolutely! You can start with our Free subscription." },
                { "q": "What happens if I exceed my student limit?", "a": "We will notify you when you approach your limit." },
                { "q": "Is my data secure?", "a": "Security is our top priority. We use industry-standard encryption." }
            ]
        }, null, 2)
    },
    {
        key: "seo",
        name: "SEO Meta Tags",
        icon: Search,
        defaultTitle: "Search Engine Optimization",
        defaultSubtitle: "Manage title, description, and social share image",
        defaultContent: JSON.stringify({
            metaTitle: "Pricing | Pre-School Management Software",
            metaDescription: "Transparent pricing for every school size.",
            ogImage: ""
        }, null, 2)
    }
];

export default function PricingPageCMS() {
    const [sections, setSections] = useState<PricingSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        sectionKey: "",
        title: "",
        subtitle: "",
        content: "",
        sortOrder: 0
    });
    const [viewMode, setViewMode] = useState<"visual" | "json">("visual");

    useEffect(() => { loadSections(); }, []);

    const loadSections = async () => {
        setLoading(true);
        try {
            // Race against 15s timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 25000)
            );

            const data = await Promise.race([
                getPricingPageContentAction(),
                timeoutPromise
            ]) as PricingSection[];

            setSections(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sections. Connection timed out or database error.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: PricingSection) => {
        setEditingSection(section.id);
        setFormData({
            sectionKey: section.sectionKey,
            title: section.title || "",
            subtitle: section.subtitle || "",
            content: section.content,
            sortOrder: section.sortOrder
        });
    };

    const handleAddNew = (template: typeof SECTION_TEMPLATES[0]) => {
        setEditingSection("new");
        setFormData({
            sectionKey: template.key,
            title: template.defaultTitle,
            subtitle: template.defaultSubtitle,
            content: template.defaultContent,
            sortOrder: sections.length
        });
    };

    const handleSave = async () => {
        const result = await upsertPricingSectionAction(formData);
        if (result.success) {
            toast.success("Section saved successfully!");
            setEditingSection(null);
            loadSections();
        } else {
            toast.error("Failed to save section");
        }
    };

    const handleToggle = async (id: string, isEnabled: boolean) => {
        const result = await togglePricingSectionAction(id, !isEnabled);
        if (result.success) {
            toast.success(`Section ${!isEnabled ? "enabled" : "disabled"}`);
            loadSections();
        } else {
            toast.error("Failed to toggle section");
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold">Loading Pricing CMS...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Pricing Page CMS</h1>
                <p className="text-slate-600">Manage hero, FAQ, and layout settings.</p>
            </div>

            {/* Templates */}
            <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" /> Add Section
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SECTION_TEMPLATES.map(template => {
                        const exists = sections.some(s => s.sectionKey === template.key);
                        const Icon = template.icon;
                        return (
                            <button
                                key={template.key}
                                onClick={() => !exists && handleAddNew(template)}
                                disabled={exists}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${exists ? "opacity-50 cursor-not-allowed bg-slate-50" : "bg-white hover:border-green-400 hover:shadow-lg hover:-translate-y-1"
                                    }`}
                            >
                                <Icon className="h-8 w-8 mb-2 text-green-600" />
                                <span className="font-bold text-sm text-slate-900">{template.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Existing Sections */}
            <div className="space-y-4">
                {sections.map(section => (
                    <div key={section.id} className={`bg-white rounded-2xl border-2 ${section.isEnabled ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                        {editingSection === section.id ? (
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-xl">Editing: {section.sectionKey}</h3>
                                    <button onClick={() => setEditingSection(null)}><X className="h-5 w-5" /></button>
                                </div>
                                <input
                                    className="w-full p-3 border rounded-xl font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Title"
                                />
                                <input
                                    className="w-full p-3 border rounded-xl"
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="Subtitle"
                                />
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700">Content</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setViewMode("visual")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                Visual
                                            </button>
                                            <button
                                                onClick={() => setViewMode("json")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                JSON
                                            </button>
                                        </div>
                                    </div>
                                    {viewMode === "visual" ? (
                                        <ContentEditor
                                            sectionKey={formData.sectionKey}
                                            initialContent={formData.content}
                                            onChange={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                                        />
                                    ) : (
                                        <textarea
                                            className="w-full p-3 border rounded-xl font-mono text-sm h-64"
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"><Save className="inline mr-2 h-4 w-4" /> Save</button>
                                    <button onClick={() => setEditingSection(null)} className="px-6 border py-3 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{section.title || section.sectionKey}</h3>
                                    <p className="text-sm text-slate-500 mb-3">{section.subtitle}</p>
                                    <div className="mt-2">
                                        <SectionPreview section={section} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleToggle(section.id, section.isEnabled)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        {section.isEnabled ? <Eye className="text-green-600" /> : <EyeOff className="text-slate-400" />}
                                    </button>
                                    <button onClick={() => handleEdit(section)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <Edit2 className="text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* New Section Modal */}
            {editingSection === "new" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4">
                        <h3 className="text-2xl font-bold">Add New Section</h3>
                        <input className="w-full p-3 border rounded-xl bg-slate-50" value={formData.sectionKey} disabled />
                        <input className="w-full p-3 border rounded-xl font-bold" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Title" />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Content</label>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode("visual")}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Visual
                                    </button>
                                    <button
                                        onClick={() => setViewMode("json")}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-green-600" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        JSON
                                    </button>
                                </div>
                            </div>
                            {viewMode === "visual" ? (
                                <ContentEditor
                                    sectionKey={formData.sectionKey}
                                    initialContent={formData.content}
                                    onChange={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                                />
                            ) : (
                                <textarea
                                    className="w-full p-3 border rounded-xl font-mono text-sm h-64"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Create</button>
                            <button onClick={() => setEditingSection(null)} className="flex-1 border py-3 rounded-xl font-bold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionPreview({ section }: { section: PricingSection }) {
    try {
        const data = JSON.parse(section.content);

        if (section.sectionKey === 'hero') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Hero</span>
                    <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: data.headline || "" }} />
                </div>
            );
        }

        if (section.sectionKey === 'plans') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Pricing Plans Settings</span>
                    <div className="text-xs text-slate-500 flex gap-2">
                        {data.showPopularBadge && <span>• Badge: {data.popularBadgeText}</span>}
                        {data.billingToggle && <span>• Monthly/Yearly Toggle</span>}
                    </div>
                </div>
            );
        }

        if (section.sectionKey === 'comparison') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-900">Feature Comparison</div>
                    <div className="text-xs text-slate-500">{data.showTable ? "Table Visible" : "Table Hidden"}</div>
                </div>
            );
        }

        if (section.sectionKey === 'faq') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">FAQ List</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        {data.questions?.length || 0} Questions
                    </span>
                </div>
            );
        }

        return <div className="text-slate-400 italic text-sm">Preview not available</div>;
    } catch (e) {
        return <div className="text-red-400 text-xs bg-red-50 p-2 rounded">Invalid JSON content</div>;
    }
}
