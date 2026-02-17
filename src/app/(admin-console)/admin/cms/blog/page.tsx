"use client";

import { useEffect, useState } from "react";
import {
    getAllBlogPostsAction,
    getBlogPageContentAction,
    upsertBlogSectionAction
} from "@/app/actions/cms-actions";
import {
    getBlogAutomationSettingsAction,
    updateBlogAutomationSettingsAction,
    triggerAutoBlogGenerationAction
} from "@/app/actions/blog-automation-actions";
import {
    Eye, Edit2, Save, Plus, ExternalLink, Newspaper, Layout, X, Search as SearchIcon, Filter, Trash2, Loader2, Image as ImageIcon, Sparkles, Settings as SettingsIcon, Clock
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { deleteBlogPostAction } from "@/app/actions/cms-actions";
import { BlogPost } from "@/generated/client"; // Or define interface if needed

// Types
interface BlogSection {
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
        name: "Blog Header",
        defaultTitle: "Blog Header",
        defaultContent: JSON.stringify({
            badge: "The Chalkboard",
            headline: "Insights from the <br /> <span class='text-[#FF9F99]'>academic edge.</span>",
            description: "Research-backed articles on early childhood education, school management, and pedagogy."
        }, null, 2)
    },
    {
        key: "newsletter",
        name: "Newsletter Section",
        defaultTitle: "Newsletter",
        defaultContent: JSON.stringify({
            title: "Pedagogy in your inbox.",
            subtitle: "Join 10,000+ educators receiving our weekly digest.",
            placeholder: "Enter your email",
            buttonText: "Subscribe"
        }, null, 2)
    }
];

export default function BlogCMSPage() {
    const [activeTab, setActiveTab] = useState<"posts" | "layout" | "ai">("posts");
    const [posts, setPosts] = useState<any[]>([]);
    const [sections, setSections] = useState<BlogSection[]>([]);
    const [automationSettings, setAutomationSettings] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [postsData, sectionsData, automationData] = await Promise.all([
            getAllBlogPostsAction(),
            getBlogPageContentAction(),
            getBlogAutomationSettingsAction()
        ]);
        setPosts(postsData);
        setSections(sectionsData);
        if (automationData.success) {
            setAutomationSettings(automationData.settings);
        }
        setLoading(false);
    };

    const handleUpdateAutomation = async (data: any) => {
        const res = await updateBlogAutomationSettingsAction(data);
        if (res.success) {
            setAutomationSettings(res.settings);
            toast.success("Automation settings updated");
        } else {
            toast.error(res.error || "Failed to update settings");
        }
    };

    const handleManualGenerate = async () => {
        if (!window.confirm("This will generate a new AI post based on your topics. Continue?")) return;
        setIsGenerating(true);
        const res = await triggerAutoBlogGenerationAction(true); // Forced run
        setIsGenerating(false);
        if (res.success) {
            toast.success("AI Post generated successfully!");
            loadData();
        } else {
            toast.error(res.error || "Generation failed");
        }
    };

    const handleDeletePost = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        const result = await deleteBlogPostAction(id);
        if (result.success) {
            toast.success("Post deleted");
            loadData();
        } else {
            toast.error(result.error || "Failed to delete post");
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "published" && post.isPublished) ||
            (statusFilter === "draft" && !post.isPublished);
        return matchesSearch && matchesStatus;
    });

    // --- Layout CMS Handlers ---
    const handleEditSection = (section: BlogSection) => {
        setEditingSection(section.id);
        setFormData({
            sectionKey: section.sectionKey,
            title: section.title,
            content: section.content
        });
    };

    const handleCreateSection = (template: typeof SECTION_TEMPLATES[0]) => {
        setEditingSection("new");
        setFormData({
            sectionKey: template.key,
            title: template.defaultTitle,
            content: template.defaultContent
        });
    };

    const handleSaveSection = async () => {
        const result = await upsertBlogSectionAction(formData);
        if (result.success) {
            toast.success("Saved successfully");
            setEditingSection(null);
            loadData();
        } else {
            toast.error("Failed to save");
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold">Loading Blog CMS...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Blog Management</h1>
                    <p className="text-slate-600">Manage posts and page layout.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "posts" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <Newspaper className="inline-block mr-2 h-4 w-4" /> Posts
                    </button>
                    <button
                        onClick={() => setActiveTab("layout")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "layout" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <Layout className="inline-block mr-2 h-4 w-4" /> Page Layout
                    </button>
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "ai" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <Sparkles className="inline-block mr-2 h-4 w-4" /> AI Magic
                    </button>
                </div>
            </div>

            {activeTab === "posts" ? (
                <div className="space-y-4">
                    {/* Filters Strip */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search articles by title or slug..."
                                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-purple-400 outline-none transition-all font-medium"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                ALL
                            </button>
                            <button
                                onClick={() => setStatusFilter("published")}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${statusFilter === "published" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                PUBLISHED
                            </button>
                            <button
                                onClick={() => setStatusFilter("draft")}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${statusFilter === "draft" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                DRAFTS
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-black text-slate-900 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-purple-500" />
                                {filteredPosts.length} Articles Found
                            </h2>
                            <Link href="/admin/cms/blog/new" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200">
                                <Plus className="h-4 w-4" /> New Post
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 font-black text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 pl-6 uppercase tracking-widest text-[10px]">Article Details</th>
                                        <th className="p-4 uppercase tracking-widest text-[10px]">Author</th>
                                        <th className="p-4 uppercase tracking-widest text-[10px]">Status</th>
                                        <th className="p-4 uppercase tracking-widest text-[10px]">Published</th>
                                        <th className="p-4 text-right pr-6 uppercase tracking-widest text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Newspaper className="h-10 w-10 text-slate-200" />
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching posts found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPosts.map((post: any) => (
                                            <tr key={post.id} className="hover:bg-slate-50/50 group transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden border flex-shrink-0">
                                                            {post.coverImage ? (
                                                                <img src={post.coverImage} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <ImageIcon className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 text-base leading-tight mb-1">{post.title}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                                <span className="font-mono lowercase text-purple-400">/{post.slug}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-black uppercase">
                                                            {post.author.firstName[0]}{post.author.lastName[0]}
                                                        </div>
                                                        <span className="font-bold text-slate-600">{post.author.firstName} {post.author.lastName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${post.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                        }`}>
                                                        {post.isPublished ? "Published" : "Draft"}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-400 font-bold text-xs">
                                                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : "-"}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 hover:bg-blue-50 rounded-xl inline-block text-slate-300 hover:text-blue-600 transition-all" title="View Public Post">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                        <Link href={`/admin/cms/blog/${post.slug}`} className="p-2 hover:bg-purple-50 rounded-xl inline-block text-slate-300 hover:text-purple-600 transition-all" title="Edit Content">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeletePost(post.id, post.title)}
                                                            className="p-2 hover:bg-red-50 rounded-xl inline-block text-slate-300 hover:text-red-600 transition-all"
                                                            title="Delete Article"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : activeTab === "ai" ? (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">AI Daily Automation</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Growth Engine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-2xl border border-slate-100">
                                <Switch
                                    checked={automationSettings?.isEnabled}
                                    onCheckedChange={(val) => handleUpdateAutomation({ ...automationSettings, isEnabled: val })}
                                />
                                <span className="text-xs font-black uppercase tracking-tight text-slate-500">
                                    {automationSettings?.isEnabled ? "ENABLED" : "DISABLED"}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-8">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                    <Clock className="h-3 w-3" /> Scheduled Time (Daily)
                                </label>
                                <Input
                                    type="time"
                                    value={automationSettings?.scheduledTime || "09:00"}
                                    onChange={(e) => handleUpdateAutomation({ ...automationSettings, scheduledTime: e.target.value })}
                                    className="text-xl font-bold h-14 rounded-2xl border-2 focus:border-purple-400"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">The AI will check every hour and trigger the generation at or after this time.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                    <Filter className="h-3 w-3" /> Preferred Topics
                                </label>
                                <Textarea
                                    value={automationSettings?.preferredTopics || ""}
                                    onChange={(e) => setAutomationSettings({ ...automationSettings, preferredTopics: e.target.value })}
                                    onBlur={() => handleUpdateAutomation({ ...automationSettings })}
                                    placeholder="Early Childhood Education, Montessori, School Management..."
                                    className="min-h-[120px] rounded-2xl border-2 p-4 text-sm font-medium focus:border-purple-400 resize-none"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">Comma separated keywords for the AI to pick from.</p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Run Status</div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {automationSettings?.lastRunDate ? format(new Date(automationSettings.lastRunDate), 'MMMM d, yyyy HH:mm') : "Never Triggered"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleManualGenerate}
                                        disabled={isGenerating}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        Run Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-900 rounded-2xl text-white shadow-2xl shadow-purple-500/20">
                        <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-widest mb-4">
                            <SettingsIcon className="h-4 w-4 text-purple-400" /> Pro-Tips
                        </h3>
                        <ul className="space-y-3 text-xs font-medium text-zinc-400">
                            <li className="flex items-start gap-2">
                                <div className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                Setting a specific time like 09:00 ensures fresh content every morning.
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="h-1 w-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                Explicit topics like "Montessori sensory play" yield better results than broad terms like "Education".
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Template Picker */}
                    <div className="flex gap-4">
                        {SECTION_TEMPLATES.map(t => {
                            const exists = sections.some(s => s.sectionKey === t.key);
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => !exists && handleCreateSection(t)}
                                    disabled={exists}
                                    className={`px-6 py-4 rounded-xl border-2 font-bold transition-all ${exists ? "opacity-50 cursor-not-allowed bg-slate-50" : "bg-white hover:border-purple-400 hover:shadow-lg"
                                        }`}
                                >
                                    {t.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Editors */}
                    {sections.map(section => (
                        <div key={section.id} className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                            {editingSection === section.id ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl">Editing: {section.sectionKey}</h3>
                                        <button onClick={() => setEditingSection(null)}><X className="h-5 w-5" /></button>
                                    </div>
                                    <textarea
                                        className="w-full p-4 border rounded-xl font-mono text-sm h-64 bg-slate-50 focus:bg-white transition-colors"
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleSaveSection} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700">Save Changes</button>
                                        <button onClick={() => setEditingSection(null)} className="border px-6 py-3 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.sectionKey}</p>
                                    </div>
                                    <button onClick={() => handleEditSection(section)} className="p-3 bg-slate-100 rounded-xl hover:bg-purple-100 hover:text-purple-600 transition-colors">
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New Section Editor */}
                    {editingSection === "new" && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4">
                                <h3 className="text-2xl font-bold">Add Section</h3>
                                <textarea className="w-full p-4 border rounded-xl font-mono text-sm h-64" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                                <div className="flex gap-2">
                                    <button onClick={handleSaveSection} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Create</button>
                                    <button onClick={() => setEditingSection(null)} className="flex-1 border py-3 rounded-xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
