"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadToSubfolderAction, deleteFileAction } from "@/app/actions/upload-actions";

interface FileUploadProps {
    value: string;
    onUpload: (url: string) => void;
    schoolSlug: string;
    mainFolder: string;
    subFolder: string;
    label?: string;
    onUploadingStateChange?: (isUploading: boolean) => void;
    allowedTypes?: string[];
    maxSizeMB?: number;
}

export function FileUpload({
    value,
    onUpload,
    schoolSlug,
    mainFolder,
    subFolder,
    label,
    onUploadingStateChange,
    allowedTypes,
    maxSizeMB = 10
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onUploadingStateChange?.(uploading);
    }, [uploading, onUploadingStateChange]);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (allowedTypes && !allowedTypes.includes(file.type)) {
            toast.error("Invalid file type");
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size exceeds ${maxSizeMB}MB`);
            return;
        }

        if (!subFolder) {
            toast.error("Required identifying information missing (e.g. registration number)");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadToSubfolderAction(formData, schoolSlug, mainFolder, subFolder);

            if (res.success && (res as any).url) {
                // Cleanup: Delete old file if it existed
                if (value) {
                    await deleteFileAction(value, schoolSlug);
                }
                onUpload((res as any).url);
                toast.success("File uploaded successfully");
            } else {
                toast.error((res as any).error || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error uploading file");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleDelete = async () => {
        if (!value) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this file from Google Drive?");
        if (!confirmDelete) return;

        setUploading(true);
        try {
            const res = await deleteFileAction(value, schoolSlug);
            if (res.success) {
                onUpload("");
                toast.success("File deleted from Google Drive");
            } else {
                toast.error(res.error || "Delete failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting file");
        } finally {
            setUploading(false);
        }
    };

    if (value) {
        const displayFileName = label || (value.includes('drive.google.com') ? 'Document Attachment' : value.split('/').pop());

        return (
            <div className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-sm text-zinc-600 truncate">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    </div>
                    <span className="truncate max-w-[200px] font-medium">{displayFileName}</span>
                </div>
                <div className="flex items-center gap-1">
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors"
                    >
                        View
                    </a>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={uploading}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => !uploading && inputRef.current?.click()}
            className={`
                relative h-10 px-4 rounded-xl border border-dashed border-zinc-300 
                flex items-center justify-center gap-2 cursor-pointer 
                hover:border-zinc-400 hover:bg-zinc-50 transition-all
                ${uploading ? "opacity-50 cursor-not-allowed bg-zinc-50" : ""}
            `}
        >
            <input
                type="file"
                className="hidden"
                ref={inputRef}
                onChange={handleFile}
                disabled={uploading}
            />
            {uploading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-400">Uploading...</span>
                </>
            ) : (
                <>
                    <Upload className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-500">Upload {label || "Document"}</span>
                </>
            )}
        </div>
    );
}
