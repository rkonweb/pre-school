"use client";

import { useEffect, useState } from "react";
import {
    getContactPageContentAction,
    upsertContactSectionAction
} from "@/app/actions/cms-actions";
import {
    Edit2, Save, X, Plus, MapPin, Mail, MessageSquare, Search
} from "lucide-react";
import { toast } from "sonner";
import ContentEditor from "./content-editor";

interface ContactSection {
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
        key: "info",
        name: "Contact Info Panel",
        icon: MapPin,
        defaultTitle: "Contact Information",
        defaultContent: JSON.stringify({
            title: "Let's start a conversation.",
            description: "Whether you're a small nursery or a large district, our Oxford-based team is here to help.",
            headquarters: {
                title: "Headquarters",
                address: "12 Innovation Way,<br />Oxford Science Park,<br />OX4 4GA, United Kingdom"
            },
            email: {
                title: "Email Us",
                addresses: [
                    "hello@bodhiboard.co.uk",
                    "support@bodhiboard.co.uk"
                ]
            }
        }, null, 2)
    },
    {
        key: "form",
        name: "Contact Form Labels",
        icon: MessageSquare,
        defaultTitle: "Form Settings",
        defaultContent: JSON.stringify({
            submitButtonText: "Send Message",
            successMessage: "Thanks! We'll be in touch."
        }, null, 2)
    },
    {
        key: "seo",
        name: "SEO Meta Tags",
        icon: Search,
        defaultTitle: "Search Engine Optimization",
        defaultSubtitle: "Manage title, description, and social share image",
        defaultContent: JSON.stringify({
            metaTitle: "Contact Us | Pre-School Management Software",
            metaDescription: "Get in touch with our team.",
            ogImage: ""
        }, null, 2)
    }
];

export default function ContactCMSPage() {
    const [sections, setSections] = useState<ContactSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        sectionKey: "",
        title: "",
        content: ""
    });
    const [viewMode, setViewMode] = useState<"visual" | "json">("visual");

    useEffect(() => { loadSections(); }, []);

    const loadSections = async () => {
        setLoading(true);
        try {
            const data = await getContactPageContentAction();
            setSections(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sections. Ensure database migrations are applied.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: ContactSection) => {
        setEditingSection(section.id);
        setFormData({
            sectionKey: section.sectionKey,
            title: section.title || "",
            content: section.content
        });
    };

    const handleAddNew = (template: typeof SECTION_TEMPLATES[0]) => {
        setEditingSection("new");
        setFormData({
            sectionKey: template.key,
            title: template.defaultTitle,
            content: template.defaultContent
        });
    };

    const handleSave = async () => {
        const result = await upsertContactSectionAction(formData);
        if (result.success) {
            toast.success("Saved successfully!");
            setEditingSection(null);
            loadSections();
        } else {
            toast.error("Failed to save");
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold">Loading Contact CMS...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Contact Page CMS</h1>
                <p className="text-slate-600">Manage contact information and form labels.</p>
            </div>

            {/* Templates */}
            <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
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
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center ${exists ? "opacity-50 cursor-not-allowed bg-slate-50" : "bg-white hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1"
                                    }`}
                            >
                                <Icon className="h-8 w-8 mb-2 text-indigo-600" />
                                <span className="font-bold text-sm text-slate-900">{template.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
                {sections.map(section => (
                    <div key={section.id} className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                        {editingSection === section.id ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-xl">Editing: {section.sectionKey}</h3>
                                    <button onClick={() => setEditingSection(null)}><X className="h-5 w-5" /></button>
                                </div>
                                <input
                                    className="w-full p-3 border rounded-xl font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Title"
                                />
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700">Content</label>
                                        <div className="flex bg-slate-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setViewMode("visual")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                Visual
                                            </button>
                                            <button
                                                onClick={() => setViewMode("json")}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
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
                                            className="w-full p-4 border rounded-xl font-mono text-sm h-64 bg-slate-50 focus:bg-white transition-colors"
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">Save Changes</button>
                                    <button onClick={() => setEditingSection(null)} className="border px-6 py-3 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">{section.sectionKey}</p>
                                    <SectionPreview section={section} />
                                </div>
                                <button onClick={() => handleEdit(section)} className="p-3 bg-slate-100 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                    <Edit2 className="h-5 w-5" />
                                </button>
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
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "visual" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Visual
                                    </button>
                                    <button
                                        onClick={() => setViewMode("json")}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === "json" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
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
                            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Create</button>
                            <button onClick={() => setEditingSection(null)} className="flex-1 border py-3 rounded-xl font-bold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionPreview({ section }: { section: ContactSection }) {
    try {
        const data = JSON.parse(section.content);

        if (section.sectionKey === 'info') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-sm font-medium text-slate-800">{data.title}</div>
                    <div className="flex gap-4 text-xs text-slate-500">
                        {data.email?.addresses && <span>• {data.email.addresses.length} Emails</span>}
                        {data.headquarters && <span>• HQ Address Configured</span>}
                    </div>
                </div>
            );
        }

        if (section.sectionKey === 'form') {
            return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-sm font-bold text-slate-900">Form Settings</div>
                    <div className="text-xs text-slate-500">Button: {data.submitButtonText}</div>
                </div>
            );
        }

        return <div className="text-slate-400 italic text-sm">Preview not available</div>;
    } catch (e) {
        return <div className="text-red-400 text-xs bg-red-50 p-2 rounded">Invalid JSON content</div>;
    }
}
