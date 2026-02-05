"use client";

import { useEffect, useState } from "react";
import {
    getFeaturesPageContentAction,
    upsertFeaturesSectionAction,
    deleteFeaturesSectionAction,
    toggleFeaturesSectionAction
} from "@/app/actions/cms-actions";
import {
    Eye, EyeOff, Edit2, Trash2, Plus, Save, X,
    Sparkles, Zap, Grid3x3, Star, Users, CreditCard, MessageCircle,
    Calendar, BookOpen, Bus, Utensils, BarChart3, Search
} from "lucide-react";
import { toast } from "sonner";
import ContentEditor from "./content-editor";

interface FeaturesSection {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string;
    isEnabled: boolean;
    sortOrder: number;
}

const ICON_OPTIONS = [
    { name: "Users", component: Users },
    { name: "CreditCard", component: CreditCard },
    { name: "MessageCircle", component: MessageCircle },
    { name: "Calendar", component: Calendar },
    { name: "BookOpen", component: BookOpen },
    { name: "Bus", component: Bus },
    { name: "Utensils", component: Utensils },
    { name: "BarChart3", component: BarChart3 },
    { name: "Sparkles", component: Sparkles },
    { name: "Zap", component: Zap },
    { name: "Star", component: Star }
];

const SECTION_TEMPLATES = [
    {
        key: "hero",
        name: "Hero Section",
        icon: Sparkles,
        defaultTitle: "Everything you need to Excel",
        defaultSubtitle: "A comprehensive suite of tools designed to handle the complexities of modern early education management, so you can focus on the children.",
        defaultContent: JSON.stringify({
            badge: "Powering over 500+ preschools globally",
            badgeIcon: "Zap",
            headline: "Everything you need to <span class='text-[#FF9F99]'>Excel.</span>",
            description: "A comprehensive suite of tools designed to handle the complexities of modern early education management, so you can focus on the children."
        }, null, 2)
    },
    {
        key: "highlight",
        name: "Highlight Feature",
        icon: Star,
        defaultTitle: "Step-by-Step Curriculum Guide",
        defaultSubtitle: "Stop guessing what to teach. Our interactive curriculum planner maps out daily activities, milestones, and learning goals for every age group.",
        defaultContent: JSON.stringify({
            badge: "Signature Feature",
            title: "Step-by-Step Curriculum Guide",
            description: "Stop guessing what to teach. Our interactive curriculum planner maps out daily activities, milestones, and learning goals for every age group.",
            features: [
                "Age-appropriate lesson plans pre-loaded",
                "Resource materials and printable worksheets",
                "Progress tracking against state standards",
                "Teacher observation logs"
            ],
            backgroundColor: "#B6E9F0",
            accentColor: "#BDF0D8"
        }, null, 2)
    },
    {
        key: "features",
        name: "Feature Cards",
        icon: Grid3x3,
        defaultTitle: "All Features",
        defaultSubtitle: "Complete feature set",
        defaultContent: JSON.stringify({
            features: [
                {
                    icon: "Users",
                    bgColor: "#B6E9F0",
                    textColor: "text-cyan-700",
                    title: "Admissions Management",
                    description: "Streamline the entire enrollment process from inquiry to onboarding. Digital forms, document uploads, and automated status updates."
                },
                {
                    icon: "Calendar",
                    bgColor: "#FFD2CF",
                    textColor: "text-rose-700",
                    title: "Smart Attendance",
                    description: "One-tap attendance for students and staff. Geo-fencing support, leave management, and instant notifications to parents."
                },
                {
                    icon: "CreditCard",
                    bgColor: "#D8F2C9",
                    textColor: "text-emerald-700",
                    title: "Fee Billing & Invoicing",
                    description: "Automated recurring invoices, online payment integration, and overdue reminders. Never miss a payment again."
                },
                {
                    icon: "MessageCircle",
                    bgColor: "#FFE2C2",
                    textColor: "text-orange-700",
                    title: "Parent Communication",
                    description: "A dedicated parent app for daily reports, photos, event calendars, and two-way messaging with teachers."
                },
                {
                    icon: "BookOpen",
                    bgColor: "#EDF7CB",
                    textColor: "text-lime-700",
                    title: "Curriculum Planning",
                    description: "Design and track lesson plans, syllabus progress, and student assessments. Align with educational standards effortlessly."
                },
                {
                    icon: "Bus",
                    bgColor: "#FCEBC7",
                    textColor: "text-amber-700",
                    title: "Transport Tracking",
                    description: "Real-time bus tracking for parents and admins. Route optimization and safe pickup/drop-off verification."
                },
                {
                    icon: "Utensils",
                    bgColor: "#BDF0D8",
                    textColor: "text-teal-700",
                    title: "Meal Management",
                    description: "Plan weekly menus, track student allergies, and manage inventory for your school kitchen."
                },
                {
                    icon: "BarChart3",
                    bgColor: "#B6E9F0",
                    textColor: "text-blue-700",
                    title: "Analytics & Reports",
                    description: "Deep insights into admission trends, revenue health, and academic performance. Exportable reports for board meetings."
                }
            ],
            ctaCard: {
                title: "And so much more...",
                description: "Explore the full potential of your preschool management with a personalized walkthrough.",
                buttonText: "Book a Demo",
                buttonLink: "/demo"
            }
        }, null, 2)
    },
    {
        key: "seo",
        name: "SEO Meta Tags",
        icon: Search,
        defaultTitle: "Search Engine Optimization",
        defaultSubtitle: "Manage title, description, and social share image",
        defaultContent: JSON.stringify({
            metaTitle: "Features | Pre-School Management Software",
            metaDescription: "Explore our comprehensive suite of features.",
            ogImage: ""
        }, null, 2)
    }
];

export default function FeaturesPageCMS() {
    const [sections, setSections] = useState<FeaturesSection[]>([]);
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
            const data = await getFeaturesPageContentAction();
            setSections(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sections. Ensure database migrations are applied.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: FeaturesSection) => {
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
        const result = await upsertFeaturesSectionAction(formData);
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
        const result = await deleteFeaturesSectionAction(id);
        if (result.success) {
            toast.success("Section deleted successfully!");
            loadSections();
        } else {
            toast.error(result.error || "Failed to delete section");
        }
    };

    const handleToggle = async (id: string, isEnabled: boolean) => {
        const result = await toggleFeaturesSectionAction(id, !isEnabled);
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
                <h1 className="text-3xl font-black text-slate-900 mb-2">Features Page CMS</h1>
                <p className="text-slate-600">Manage hero, highlight section, and all feature cards</p>
            </div>

            {/* Add New Section Templates */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Section
                </h2>
                <div className="grid grid-cols-3 gap-4">
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
                                    : "bg-white border-purple-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1"
                                    }`}
                            >
                                <Icon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
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
                                            <Icon className="h-6 w-6 text-purple-600" />
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
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700"}`}
                                                >
                                                    Visual Editor
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("json")}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700"}`}
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
                                                rows={16}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                            />
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
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
                                                <Icon className="h-6 w-6 text-purple-600" />
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
                                                className="p-3 hover:bg-purple-50 rounded-xl transition-colors"
                                            >
                                                <Edit2 className="h-5 w-5 text-purple-600" />
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
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
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
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            Visual Editor
                                        </button>
                                        <button
                                            onClick={() => setViewMode("json")}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-purple-600" : "text-slate-500 hover:text-slate-700"}`}
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
                                        rows={16}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                                    />
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
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

function SectionPreview({ section }: { section: FeaturesSection }) {
    try {
        const data = JSON.parse(section.content);

        if (section.sectionKey === 'hero') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex gap-2 items-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Hero</span>
                        {data.badge && <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border">{data.badge}</span>}
                    </div>
                    <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: data.headline || "" }} />
                    <div className="text-xs text-slate-500 line-clamp-1">{data.description}</div>
                </div>
            );
        }

        if (section.sectionKey === 'highlight') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-bold text-slate-900">{data.title}</div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{data.description}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                            {data.features?.length || 0} Points
                        </span>
                    </div>
                </div>
            );
        }

        if (section.sectionKey === 'features') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-900">Feature Cards Grid</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                            {data.features?.length || 0} Cards
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.features?.slice(0, 4).map((f: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border rounded shadow-sm max-w-[150px]">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                <span className="text-xs font-medium text-slate-700 truncate">{f.title}</span>
                            </div>
                        ))}
                        {(data.features?.length || 0) > 4 && (
                            <span className="text-xs text-slate-400 flex items-center px-1">+{data.features.length - 4} more</span>
                        )}
                    </div>
                    {data.ctaCard && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">CTA Card:</span>
                            <span className="text-xs text-slate-700 truncate">{data.ctaCard.title}</span>
                        </div>
                    )}
                </div>
            );
        }

        return <div className="text-slate-400 italic text-sm">Preview not available</div>;
    } catch (e) {
        return <div className="text-red-400 text-xs bg-red-50 p-2 rounded">Invalid JSON content</div>;
    }
}
