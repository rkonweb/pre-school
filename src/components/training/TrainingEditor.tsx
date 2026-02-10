"use client";

import { useEffect, useState } from "react";
import AIPageBuilder from "@/components/curriculum/AIPageBuilder";

import {
    getTrainingPageAction,
    saveTrainingPageAction,
    addTrainingAttachmentAction,
    deleteTrainingAttachmentAction
} from "@/app/actions/training-actions";
import { toast } from "sonner";
import { Loader2, Paperclip, X, FileText, Trash2, Upload } from "lucide-react";

interface TrainingEditorProps {
    pageId: string;
}

export function TrainingEditor({ pageId }: TrainingEditorProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageTitle, setPageTitle] = useState("");


    const [attachments, setAttachments] = useState<any[]>([]);
    const [showAttachments, setShowAttachments] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            const res = await getTrainingPageAction(pageId);
            if (res.success && res.data) {
                setContent(res.data.content || "");
                setPageTitle(res.data.title);
                setAttachments(res.data.attachments || []);
            } else {
                toast.error("Failed to load page content");
            }
            setLoading(false);
        };
        loadPage();
    }, [pageId]);

    const handleSave = async (html: string) => {
        setSaving(true);
        const res = await saveTrainingPageAction(pageId, html);
        if (res.success) {
            toast.success("Page saved");
            setContent(html); // Update local state
        } else {
            toast.error("Failed to save page");
        }
        setSaving(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;
                const res = await addTrainingAttachmentAction(pageId, file.name, base64, file.size, file.type);
                if (res.success) {
                    setAttachments(prev => [res.data, ...prev]);
                    toast.success("File attached successfully");
                } else {
                    toast.error(res.error || "Failed to upload");
                }
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error("Error reading file");
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to remove this attachment?")) return;

        const res = await deleteTrainingAttachmentAction(id);
        if (res.success) {
            setAttachments(prev => prev.filter(a => a.id !== id));
            toast.success("Attachment removed");
        } else {
            toast.error("Failed to remove attachment");
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            <div className="border-b border-zinc-100 bg-white p-4 flex items-center justify-between z-10 relative">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">{pageTitle}</h1>
                    <p className="text-xs text-zinc-400 font-medium">Training Content Editor</p>
                </div>
                <div className="flex items-center gap-4">


                    <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm group hover:scale-105 active:scale-95 ${showAttachments
                                ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200'
                                : 'bg-white border-zinc-200 text-zinc-600 hover:border-indigo-500 hover:text-indigo-600'
                            }`}
                        title="Upload files and resources"
                    >
                        <div className={`p-1 rounded-full ${showAttachments ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                            <Paperclip className="h-3.5 w-3.5" />
                        </div>
                        <span>Attach Documents</span>
                        {attachments.length > 0 && (
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] min-w-[1.2rem] text-center font-bold ${showAttachments ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-indigo-50 group-hover:text-indigo-700'
                                }`}>
                                {attachments.length}
                            </span>
                        )}
                    </button>
                    <div className="text-xs text-zinc-400 font-medium border-l border-zinc-200 pl-4">
                        {saving ? "Saving..." : "Saved"}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-50/50 relative">
                <AIPageBuilder
                    initialContent={content}
                    onSave={handleSave}
                    isSaving={saving}
                />
            </div>

            {/* Attachments Sidebar */}
            {showAttachments && (
                <div className="absolute top-[73px] right-4 w-80 bg-white shadow-2xl rounded-2xl border border-zinc-200 z-50 overflow-hidden flex flex-col max-h-[calc(100vh-100px)] animate-in slide-in-from-right-5 fade-in duration-200">
                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div>
                            <h3 className="font-bold text-zinc-900 text-sm">Attached Resources</h3>
                            <p className="text-[10px] text-zinc-500">Files available to trainees</p>
                        </div>
                        <button onClick={() => setShowAttachments(false)} className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[400px]">
                        {attachments.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400 flex flex-col items-center gap-2">
                                <FileText className="h-8 w-8 opacity-20" />
                                <p className="text-xs">No attachments yet</p>
                            </div>
                        ) : (
                            attachments.map((file) => (
                                <div key={file.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all cursor-pointer" onClick={() => window.open(file.url, '_blank')}>
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-zinc-900 truncate">{file.name}</p>
                                        <p className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteAttachment(file.id, e)}
                                        className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-zinc-100 bg-zinc-50/30">
                        <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-zinc-300 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : <Upload className="h-4 w-4 text-indigo-600" />}
                            <span className="text-xs font-bold text-zinc-600 group-hover:text-indigo-700">
                                {uploading ? "Uploading..." : "Upload Resource"}
                            </span>
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </label>
                        <p className="text-[10px] text-center text-zinc-400 mt-2">Max file size: 5MB</p>
                    </div>
                </div>
            )}
        </div>
    );
}
