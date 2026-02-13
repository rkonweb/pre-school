
"use client";

import { useEffect, useState } from "react";
import {
    getTrainingPageAction,
    addTrainingAttachmentAction,
    deleteTrainingAttachmentAction,
    saveTrainingPageAction
} from "@/app/actions/training-actions";
import { toast } from "sonner";
import { Loader2, Trash2, FileText, Upload, Download, Eye, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/ui/modal/ModalContext";
import { Progress } from "@/components/ui/progress";

interface SimpleDocumentUploaderProps {
    pageId: string;
}

export default function SimpleDocumentUploader({ pageId }: SimpleDocumentUploaderProps) {
    const [attachments, setAttachments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [pageTitle, setPageTitle] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const { openConfirmationModal } = useModal();

    // Load initial data
    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);
            const res = await getTrainingPageAction(pageId);
            if (res.success && res.data) {
                setPageTitle(res.data.title);
                setAttachments(res.data.attachments || []);
            } else {
                toast.error("Failed to load document info");
            }
            setLoading(false);
        };
        loadPage();
    }, [pageId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.type !== "application/pdf") {
            openConfirmationModal({
                title: "Invalid File Type",
                message: "Only PDF files are allowed. Please select a valid PDF document.",
                variant: "danger",
                confirmText: "Close",
                cancelText: " ",
                onConfirm: () => { }
            });
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            openConfirmationModal({
                title: "Upload Failed",
                message: "The file you selected exceeds the maximum upload limit of 10MB. Please select a smaller file.",
                variant: "danger",
                confirmText: "Close",
                cancelText: " ", // Empty to hide or minimal
                onConfirm: () => { }
            });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("pageId", pageId);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/admin/training/upload");

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (res.success) {
                            setAttachments(prev => [res.data, ...prev]);

                            // 2. Auto-update content to reference this file
                            const descriptionHtml = `<p>Document: <strong>${file.name}</strong> uploaded on ${new Date().toLocaleDateString()}</p>`;
                            await saveTrainingPageAction(pageId, descriptionHtml);

                            toast.success("Document uploaded successfully");
                        } else {
                            toast.error(res.error || "Failed to upload");
                        }
                    } catch (e) {
                        toast.error("Invalid server response");
                    }
                } else {
                    toast.error("Upload failed");
                }
                setUploading(false); // Reset uploading state
                setUploadProgress(0);
            };

            xhr.onerror = () => {
                toast.error("Upload network error");
                setUploading(false); // Reset on error
                setUploadProgress(0);
            };

            xhr.send(formData);

        } catch (error) {
            toast.error("Error initiating upload");
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = (id: string) => {
        openConfirmationModal({
            title: "Delete Document",
            message: "Are you sure you want to delete this document? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                const res = await deleteTrainingAttachmentAction(id);
                if (res.success) {
                    setAttachments(prev => prev.filter(a => a.id !== id));
                    toast.success("Document deleted");
                } else {
                    toast.error("Failed to delete document");
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50/50">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 px-8 py-6">
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">{pageTitle}</h1>
                <p className="text-sm text-zinc-500">Manage documents for this section. Upload PDF files that will be visible to schools.</p>
            </div>

            {/* Content Container */}
            <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">

                {/* Upload Area */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 py-12 px-4 hover:bg-brand/5 hover:border-brand/30 transition-all group">
                        <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-zinc-900">Upload PDF Document</h3>
                            <p className="text-sm text-zinc-500">Drag and drop or click to browse</p>
                        </div>

                        {uploading && (
                            <div className="w-full max-w-xs space-y-2">
                                <Progress value={uploadProgress} className="h-2 bg-zinc-100" indicatorClassName="bg-brand" />
                                <p className="text-xs text-zinc-500 font-medium">{Math.round(uploadProgress)}% uploaded</p>
                            </div>
                        )}

                        <label className={cn(
                            "mt-4 px-6 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 cursor-pointer active:scale-95",
                            uploading && "opacity-50 pointer-events-none"
                        )}>
                            {uploading ? "Uploading..." : "Select PDF File"}
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                        <p className="text-xs text-zinc-400 mt-2">Maximum file size: 10MB</p>
                    </div>
                </div>

                {/* File List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-zinc-400" />
                        Uploaded Documents
                    </h3>

                    {attachments.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 border-dashed">
                            <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                            <p className="text-zinc-400">No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {attachments.map((file) => (
                                <div key={file.id} className="group bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4 hover:shadow-md transition-all">
                                    <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-zinc-900 truncate">{file.name}</h4>
                                        <p className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                                            <span>•</span>
                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium text-[10px] uppercase">{file.type?.split('/')[1] || 'FILE'}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="p-2 text-zinc-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                                            title="View / Download"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
