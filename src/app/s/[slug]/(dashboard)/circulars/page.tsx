"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, Plus, Eye, EyeOff, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { publishAdminCircularBySlugAction, getAdminCircularsBySlugAction, deleteCircularAction, toggleCircularPublishAction } from "@/app/actions/parent-phase2-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { Tag, Trash2 } from "lucide-react";

const CIRCULAR_TYPES = ["CIRCULAR", "NOTICE", "NEWSLETTER", "FORM"];

export default function CircularsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [circulars, setCirculars] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [form, setForm] = useState<{
        title: string;
        content: string;
        fileUrl: string;
        type: string;
        classIds: string[];
    }>({
        title: "",
        content: "",
        fileUrl: "",
        type: "CIRCULAR",
        classIds: ["all"],
    });

    useEffect(() => { loadCirculars(); }, [slug]);

    async function loadCirculars() {
        setIsLoading(true);
        try {
            const [res, classroomsRes] = await Promise.all([
                getAdminCircularsBySlugAction(slug),
                getClassroomsAction(slug),
            ]);

            if (res.success) {
                setCirculars(res.data || []);
            } else {
                toast.error(res.error || "Failed to load circulars");
            }

            if (classroomsRes.success) {
                setClassrooms(classroomsRes.data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load circulars");
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePublish() {
        if (!form.title) { toast.error("Title is required"); return; }
        setIsPublishing(true);
        try {
            const res = await publishAdminCircularBySlugAction(slug, {
                title: form.title,
                content: form.content || undefined,
                fileUrl: form.fileUrl || undefined,
                type: form.type,
                targetClassIds: form.classIds,
            });

            if (res.success) {
                toast.success("Circular published to parents!");
                setShowForm(false);
                setForm({ title: "", content: "", fileUrl: "", type: "CIRCULAR", classIds: ["all"] });
                loadCirculars();
            } else {
                toast.error(res.error || "Failed to publish");
            }
        } catch (err) {
            toast.error("Unexpected error");
        } finally {
            setIsPublishing(false);
        }
    }

    async function togglePublish(circularId: string, current: boolean) {
        try {
            const res = await toggleCircularPublishAction(circularId, current, slug);
            if (res.success) {
                toast.success(current ? "Circular unpublished" : "Circular published");
                loadCirculars();
            } else {
                toast.error(res.error || "Failed to update circular");
            }
        } catch (err) {
            toast.error("Failed to update circular");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this circular?")) return;
        try {
            const res = await deleteCircularAction(id, slug);
            if (res.success) {
                toast.success("Circular deleted");
                loadCirculars();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting circular");
        }
    }

    function handleClassToggle(classId: string) {
        if (classId === "all") {
            setForm(prev => ({ ...prev, classIds: ["all"] }));
            return;
        }

        setForm(prev => {
            const current = prev.classIds.filter(id => id !== "all");
            const newIds = current.includes(classId)
                ? current.filter(id => id !== classId)
                : [...current, classId];

            return {
                ...prev,
                classIds: newIds.length === 0 ? ["all"] : newIds,
            };
        });
    }

    const typeColor: Record<string, string> = {
        CIRCULAR: "bg-blue-100 text-blue-700",
        NOTICE: "bg-amber-100 text-amber-700",
        NEWSLETTER: "bg-green-100 text-green-700",
        FORM: "bg-purple-100 text-purple-700",
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <FileText className="h-8 w-8 text-emerald-500" />
                        Circulars & <span className="text-emerald-500">Notices</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Publish school notices, newsletters, and forms to parents.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Publish New
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-emerald-200 dark:border-emerald-900 shadow-xl p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">
                        New <span className="text-emerald-500">Publication</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Title *</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="E.g., Annual Day Notice 2025"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Type</label>
                            <div className="flex flex-wrap gap-2">
                                {CIRCULAR_TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setForm(f => ({ ...f, type: t }))}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all",
                                            form.type === t
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                                : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Content / Description</label>
                            <textarea
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                placeholder="Circular body text..."
                                rows={4}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                                <Upload className="inline h-3 w-3 mr-1" />
                                Attachment URL (optional — paste file URL)
                            </label>
                            <input
                                value={form.fileUrl}
                                onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Target Classes *</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleClassToggle("all")}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        form.classIds.includes("all")
                                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    All Classes
                                </button>
                                {classrooms.map((cls) => (
                                    <button
                                        key={cls.id}
                                        onClick={() => handleClassToggle(cls.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                            !form.classIds.includes("all") && form.classIds.includes(cls.id)
                                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}
                                    >
                                        {cls.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPublishing ? "Publishing..." : "Publish to Parents"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-4 rounded-2xl font-black uppercase text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Circulars List */}
            {isLoading ? (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            ) : circulars.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">📋</div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic">No Circulars Yet</h3>
                    <p className="text-zinc-500 text-sm mt-2">Publish your first circular to parents.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {circulars.map(c => (
                        <div key={c.id} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-6 shadow-sm hover:border-emerald-200 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                <FileText className="h-7 w-7 text-zinc-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", typeColor[c.type] || "bg-zinc-100 text-zinc-500")}>
                                        {c.type}
                                    </span>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", c.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500")}>
                                        {c.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                                <h3 className="font-black text-zinc-900 dark:text-zinc-50">{c.title}</h3>
                                {c.content && <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{c.content}</p>}
                                <div className="flex flex-wrap gap-4 mt-2 text-xs font-medium text-zinc-500">
                                    <span className="flex items-center gap-1.5">
                                        {c.publishedAt
                                            ? `Published ${new Date(c.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                                            : `Created ${new Date(c.createdAt).toLocaleDateString("en-IN")}`}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Tag className="h-3 w-3" />
                                        {(() => {
                                            try {
                                                const ids = JSON.parse(c.targetClassIds || '["all"]');
                                                if (ids.includes("all")) return "All Classes";
                                                return ids.map((id: string) => {
                                                    const cls = classrooms.find(cl => cl.id === id);
                                                    return cls ? cls.name : id;
                                                }).join(', ');
                                            } catch (e) {
                                                return "All Classes";
                                            }
                                        })()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {c.fileUrl && (
                                    <a
                                        href={c.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 hover:bg-zinc-200 transition-colors"
                                    >
                                        <Upload className="h-3 w-3" /> File
                                    </a>
                                )}
                                <button
                                    onClick={() => togglePublish(c.id, c.isPublished)}
                                    className={cn(
                                        "h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                                        c.isPublished
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-red-50 hover:text-red-500"
                                            : "bg-emerald-500 text-white hover:bg-emerald-400"
                                    )}
                                >
                                    {c.isPublished ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    title="Delete Circular"
                                    className="p-3 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors rounded-xl"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
