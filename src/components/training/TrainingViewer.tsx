"use client";

import { useEffect, useState } from "react";
import { getTrainingPageAction } from "@/app/actions/training-actions";
import { RichTextEditor } from "@/components/curriculum/RichTextEditor";
import { Loader2, Paperclip, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface TrainingViewerProps {
    pageId: string;
}

export function TrainingViewer({ pageId }: TrainingViewerProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [pageTitle, setPageTitle] = useState("");
    const [attachments, setAttachments] = useState<any[]>([]);

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

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            <div className="border-b border-zinc-100 bg-white p-6 flex items-center justify-between z-10 relative">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-sm text-zinc-500 font-medium">Training Module</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-50/30 relative flex flex-col lg:flex-row">
                {/* Main Content */}
                <div className="flex-1 min-h-0 p-8">
                    <RichTextEditor
                        content={content}
                        readOnly={true}
                    />
                </div>

                {/* Attachments Sidebar (Right) */}
                {attachments.length > 0 && (
                    <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 bg-white flex flex-col">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                Resources
                            </h3>
                        </div>
                        <div className="p-3 space-y-2 overflow-y-auto">
                            {attachments.map((file) => (
                                <div
                                    key={file.id}
                                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-all cursor-pointer"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB</span>
                                            <span className="text-[10px] text-zinc-300">•</span>
                                            <span className="text-[10px] text-zinc-500">{new Date(file.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-zinc-300 group-hover:text-indigo-600 transition-colors">
                                        <Download className="h-4 w-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
