"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/curriculum/RichTextEditor";
import { AIBlogFormatter } from "@/components/admin-console/cms/AIBlogFormatter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Globe, Image as ImageIcon, Search, Tag, Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/admin-console/cms/ImageUploader";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<any>;
    title: string;
    loading?: boolean;
}

export function BlogForm({ initialData, onSubmit, title, loading: externalLoading }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",
        content: initialData?.content || "",
        coverImage: initialData?.coverImage || "",
        ogImage: initialData?.ogImage || "",
        tags: initialData?.tags || "",
        isPublished: initialData?.isPublished || false,
        metaTitle: initialData?.metaTitle || "",
        metaDescription: initialData?.metaDescription || "",
        metaKeywords: initialData?.metaKeywords || "",
    });

    useEffect(() => {
        if (initialData) {
            // Process tags if they are JSON
            let tagsStr = initialData.tags;
            try {
                const parsed = JSON.parse(initialData.tags);
                if (Array.isArray(parsed)) {
                    tagsStr = parsed.join(", ");
                }
            } catch (e) {
                // Not JSON, keep as is
            }
            setFormData({ ...initialData, tags: tagsStr });
        }
    }, [initialData]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const newSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: initialData ? prev.slug : newSlug // Only auto-update slug on create
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const tagsArray = formData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);

        const submissionData = {
            ...formData,
            tags: JSON.stringify(tagsArray)
        };

        await onSubmit(submissionData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-8 pb-20">
            <div className="flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 border-b">
                <div className="flex items-center gap-4">
                    <Link href="/admin/cms/blog">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="published-toggle" className="text-sm font-bold text-slate-500">PUBLISHED</Label>
                        <Switch
                            id="published-toggle"
                            checked={formData.isPublished}
                            onCheckedChange={(val) => setFormData({ ...formData, isPublished: val })}
                        />
                    </div>
                    <Button type="submit" disabled={loading || externalLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 rounded-xl">
                        {loading || externalLoading ? "Saving..." : "Save Post"}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold">Content Editor</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAI(!showAI)}
                                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold"
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                {showAI ? "Switch to Manual" : "AI Magic Formatter"}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {showAI ? (
                                <div className="p-6">
                                    <AIBlogFormatter
                                        onSave={(html, imageUrl) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                content: html,
                                                coverImage: imageUrl || prev.coverImage,
                                                ogImage: imageUrl || prev.ogImage
                                            }));
                                            setShowAI(false);
                                        }}
                                        onCancel={() => setShowAI(false)}
                                        initialContent={formData.content}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Post Title</Label>
                                                <span className={`text-[10px] font-bold ${formData.title.length > 55 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                    {formData.title.length} / 60
                                                </span>
                                            </div>
                                            <Input
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                placeholder="Enter a catchy title..."
                                                className="text-xl font-bold h-14 border-2 focus-visible:ring-purple-400/20"
                                                required
                                                maxLength={60}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Excerpt / Summary</Label>
                                            <Textarea
                                                value={formData.excerpt || ""}
                                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                                placeholder="A short summary for the blog listing..."
                                                className="resize-none h-24 border-2 focus-visible:ring-purple-400/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-slate-100 h-[600px]">
                                        <RichTextEditor
                                            content={formData.content}
                                            onChange={(html) => setFormData({ ...formData, content: html })}
                                            placeholder="Write your masterpiece here..."
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* SEO Section */}
                    <Card className="border-2 border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg font-bold">Search Engine Optimization</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">Meta Title</Label>
                                    <Input
                                        value={formData.metaTitle || ""}
                                        onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                        placeholder="Title seen in Google search results"
                                        className="border-2"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">Meta Description</Label>
                                    <Textarea
                                        value={formData.metaDescription || ""}
                                        onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                        placeholder="160 characters describing your post"
                                        className="border-2 resize-none h-20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">Meta Keywords</Label>
                                    <Input
                                        value={formData.metaKeywords || ""}
                                        onChange={e => setFormData({ ...formData, metaKeywords: e.target.value })}
                                        placeholder="education, preschool, learning"
                                        className="border-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">URL Slug</Label>
                                    <Input
                                        value={formData.slug || ""}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="url-friendly-slug"
                                        className="border-2 font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Media Card */}
                    <Card className="border-2 border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-teal-500" />
                            <CardTitle className="text-lg font-bold">Post Media</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-6">
                                <ImageUploader
                                    label="Cover Image"
                                    description="Main post image"
                                    value={formData.coverImage}
                                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                                    aiTitle={formData.title}
                                />

                                <ImageUploader
                                    label="OG Image"
                                    description="1200x630px Social Preview"
                                    value={formData.ogImage}
                                    onChange={(url) => setFormData({ ...formData, ogImage: url })}
                                    aiTitle={formData.title}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories and Tags */}
                    <Card className="border-2 border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center gap-2">
                            <Tag className="h-5 w-5 text-orange-500" />
                            <CardTitle className="text-lg font-bold">Tagging</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black tracking-widest text-slate-400 uppercase">Tags (Comma Separated)</Label>
                                <Input
                                    value={formData.tags || ""}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="News, Events, pedagogy"
                                    className="border-2"
                                />
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {(formData.tags || "").split(",").filter(Boolean).map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                            {t.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
