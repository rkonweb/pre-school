"use client";

import { useEffect, useState } from "react";
import {
    getHomepageContentAction,
    upsertHomepageSectionAction,
    deleteHomepageSectionAction,
    toggleHomepageSectionAction
} from "@/app/actions/cms-actions";
import {
    Eye, EyeOff, Edit2, Trash2, Plus, Save, X,
    Home, Sparkles, Grid3x3, DollarSign, Megaphone, Search
} from "lucide-react";
import { toast } from "sonner";
import ContentEditor from "./content-editor";

export const dynamic = "force-dynamic";

interface HomepageSection {
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
        icon: Home,
        defaultTitle: "The happiest way to run your preschool",
        defaultSubtitle: "Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.",
        defaultContent: JSON.stringify({
            badge: "LOVED BY 500+ SCHOOLS",
            headline: "The <span>happiest</span> way to run your preschool.",
            subheadline: "Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.",
            primaryCTA: { text: "Start My Free Trial", link: "/signup" },
            secondaryCTA: { text: "See How It Works", link: "/demo" },
            socialProof: { rating: 4.9, text: "from happy educators" }
        }, null, 2)
    },
    {
        key: "features",
        name: "Features Section",
        icon: Grid3x3,
        defaultTitle: "Sweet solutions for sticky problems",
        defaultSubtitle: "Say goodbye to paper piles and hello to peace of mind.",
        defaultContent: JSON.stringify({
            features: [
                {
                    title: "The Daily Guide",
                    description: "Like a gentle hand guiding you through the day. Ratios, compliance, and billing checked automatically.",
                    color: "#B6E9F0",
                    icon: "BookOpen"
                },
                {
                    title: "Parent Joy",
                    description: "Beautiful digital diaries, photos, and updates that make parents feel connected and happy.",
                    color: "#FFD2CF",
                    icon: "Heart"
                },
                {
                    title: "Smart Billing",
                    description: "Invoices that send themselves. Get paid on time without the awkward conversations.",
                    color: "#D8F2C9",
                    icon: "CreditCard"
                }
            ]
        }, null, 2)
    },
    {
        key: "pricing",
        name: "Pricing Section",
        icon: DollarSign,
        defaultTitle: "Invest in extra recess",
        defaultSubtitle: "Clear plans that grow with your little learners.",
        defaultContent: JSON.stringify({
            badge: "Simple Pricing",
            showPlans: true,
            plansFromDatabase: true
        }, null, 2)
    },
    {
        key: "cta",
        name: "Call to Action",
        icon: Megaphone,
        defaultTitle: "Ready to play?",
        defaultSubtitle: "Join the community of educators who are making preschool management a breeze.",
        defaultContent: JSON.stringify({
            buttonText: "Start Your Free Trial",
            buttonLink: "/signup",
            features: ["No credit card required", "Cancel anytime"]
        }, null, 2)
    },
    {
        key: "seo",
        name: "SEO Meta Tags",
        icon: Search,
        defaultTitle: "Search Engine Optimization",
        defaultSubtitle: "Manage title, description, and social share image",
        defaultContent: JSON.stringify({
            metaTitle: "Pre-School Management Software",
            metaDescription: "The happiest way to run your preschool.",
            ogImage: ""
        }, null, 2)
    }
];

export default function HomepageCMSPage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
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

    useEffect(() => {
        loadSections();
    }, []);

    const loadSections = async () => {
        setLoading(true);
        try {
            // Race against 15s timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 25000)
            );

            const data = await Promise.race([
                getHomepageContentAction(),
                timeoutPromise
            ]) as HomepageSection[]; // Cast because race returns unknown type union

            setSections(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sections. Connection timed out or database error.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: HomepageSection) => {
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
        const result = await upsertHomepageSectionAction(formData);
        if (result.success) {
            toast.success("Section saved successfully!");
            setEditingSection(null);
            loadSections();
        } else {
            toast.error(result.error || "Failed to save section");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this section?")) return;
        const result = await deleteHomepageSectionAction(id);
        if (result.success) {
            toast.success("Section deleted successfully!");
            loadSections();
        } else {
            toast.error(result.error || "Failed to delete section");
        }
    };

    const handleToggle = async (id: string, isEnabled: boolean) => {
        const result = await toggleHomepageSectionAction(id, !isEnabled);
        if (result.success) {
            toast.success(`Section ${!isEnabled ? "enabled" : "disabled"}`);
            loadSections();
        } else {
            toast.error(result.error || "Failed to toggle section");
        }
    };

    const getSectionIcon = (key: string) => {
        const template = SECTION_TEMPLATES.find(t => t.key === key);
        return template?.icon || Sparkles;
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Homepage Content Manager</h1>
                <p className="text-slate-600">Manage all sections of your marketing homepage</p>
            </div>

            {/* Add New Section Templates */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Section
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SECTION_TEMPLATES.map(template => {
                        const Icon = template.icon;
                        const exists = sections.some(s => s.sectionKey === template.key);
                        return (
                            <button
                                key={template.key}
                                onClick={() => !exists && handleAddNew(template)}
                                disabled={exists}
                                className={`p-4 rounded-xl border-2 transition-all ${exists
                                    ? "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
                                    : "bg-white border-blue-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                                    }`}
                            >
                                <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                <div className="font-bold text-sm text-slate-900">{template.name}</div>
                                {exists && <div className="text-xs text-slate-500 mt-1">Already added</div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Existing Sections */}
            <div className="space-y-4">
                {sections.map(section => {
                    const Icon = getSectionIcon(section.sectionKey);
                    const isEditing = editingSection === section.id;

                    return (
                        <div
                            key={section.id}
                            className={`bg-white rounded-2xl border-2 transition-all ${section.isEnabled ? "border-slate-200" : "border-slate-100 opacity-60"
                                }`}
                        >
                            {isEditing ? (
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <Icon className="h-6 w-6 text-blue-600" />
                                            Editing: {section.sectionKey}
                                        </h3>
                                        <button
                                            onClick={() => setEditingSection(null)}
                                            className="p-2 hover:bg-slate-100 rounded-lg"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Content
                                            </label>
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setViewMode("visual")}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                                >
                                                    Visual Editor
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("json")}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                                >
                                                    Raw JSON
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
                                                value={formData.content}
                                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                                rows={12}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                            />
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save className="h-5 w-5" />
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditingSection(null)}
                                            className="px-6 py-3 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                                <h3 className="text-xl font-bold text-slate-900">
                                                    {section.title || section.sectionKey}
                                                </h3>
                                                {!section.isEnabled && (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                                        Disabled
                                                    </span>
                                                )}
                                            </div>
                                            {section.subtitle && (
                                                <p className="text-slate-600 mb-3">{section.subtitle}</p>
                                            )}
                                            <div className="mt-4">
                                                <SectionPreview section={section} />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleToggle(section.id, section.isEnabled)}
                                                className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
                                                title={section.isEnabled ? "Disable" : "Enable"}
                                            >
                                                {section.isEnabled ? (
                                                    <Eye className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <EyeOff className="h-5 w-5 text-slate-400" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(section)}
                                                className="p-3 hover:bg-blue-50 rounded-xl transition-colors"
                                            >
                                                <Edit2 className="h-5 w-5 text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(section.id)}
                                                className="p-3 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {sections.length === 0 && (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No sections yet</h3>
                        <p className="text-slate-600">Add your first section using the templates above</p>
                    </div>
                )}
            </div>

            {/* Edit Modal for New Section */}
            {editingSection === "new" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Add New Section</h3>
                            <button
                                onClick={() => setEditingSection(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Section Key</label>
                                <input
                                    type="text"
                                    value={formData.sectionKey}
                                    disabled
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-slate-700">
                                        Content
                                    </label>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode("visual")}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            Visual Editor
                                        </button>
                                        <button
                                            onClick={() => setViewMode("json")}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            Raw JSON
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
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        rows={12}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    />
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    Create Section
                                </button>
                                <button
                                    onClick={() => setEditingSection(null)}
                                    className="px-6 py-3 border-2 border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionPreview({ section }: { section: HomepageSection }) {
    try {
        const data = JSON.parse(section.content);

        if (section.sectionKey === 'hero') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Hero</span>
                    <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: data.headline || "" }} />
                </div>
            );
        }

        if (section.sectionKey === 'features') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Features Grid</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                        {data.features?.length || 0} Items
                    </span>
                </div>
            );
        }

        if (section.sectionKey === 'pricing') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-900">Pricing Section</div>
                    {data.badge && <div className="text-xs text-slate-500">Badge: {data.badge}</div>}
                    <div className="text-xs text-slate-500">{data.showPlans ? "Showing Database Plans" : "Plans Hidden"}</div>
                </div>
            );
        }

        if (section.sectionKey === 'cta') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-900">Call to Action</div>
                    <div className="text-xs text-slate-500">Button: {data.buttonText}</div>
                </div>
            );
        }

        return <div className="text-slate-400 italic text-sm">Preview not available</div>;
    } catch (e) {
        return <div className="text-red-400 text-xs bg-red-50 p-2 rounded">Invalid JSON content</div>;
    }
}
