"use client";

import { useEffect, useState } from "react";
import {
    getAllBlogPostsAction,
    getBlogPageContentAction,
    upsertBlogSectionAction
} from "@/app/actions/cms-actions";
import {
    Eye, Edit2, Save, Plus, ExternalLink, Newspaper, Layout, X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
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
    const [activeTab, setActiveTab] = useState<"posts" | "layout">("posts");
    const [posts, setPosts] = useState<any[]>([]);
    const [sections, setSections] = useState<BlogSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [postsData, sectionsData] = await Promise.all([
            getAllBlogPostsAction(),
            getBlogPageContentAction()
        ]);
        setPosts(postsData);
        setSections(sectionsData);
        setLoading(false);
    };

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
                </div>
            </div>

            {activeTab === "posts" ? (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg">All Articles</h2>
                        <Link href="/admin/cms/blog/new" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center gap-2">
                            <Plus className="h-4 w-4" /> New Post
                        </Link>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">No posts found.</td>
                                </tr>
                            ) : (
                                posts.map((post: any) => (
                                    <tr key={post.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-medium text-slate-900">
                                            {post.title}
                                            <div className="text-xs text-slate-400 font-mono mt-1">{post.slug}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">{post.author.firstName} {post.author.lastName}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-black uppercase tracking-wider ${post.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {post.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 font-bold">{format(new Date(post.createdAt), 'MMM d, yyyy')}</td>
                                        <td className="p-4 text-right">
                                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 hover:bg-slate-100 rounded-lg inline-block text-slate-400 hover:text-blue-600 transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
