"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, Image as ImageIcon, X, Download, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Worksheet {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string; // Base64 or Drive URL
    status?: 'uploading' | 'success' | 'error';
}

interface WorksheetManagerProps {
    worksheets: Worksheet[];
    onChange: (worksheets: Worksheet[]) => void;
    onFileUpload?: (base64: string, name: string, type: string) => Promise<{ success: boolean; url?: string; error?: string }>;
}

export function WorksheetManager({ worksheets, onChange, onFileUpload }: WorksheetManagerProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: File[]) => {
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (> 5MB)`);
                continue;
            }

            const tempId = Math.random().toString(36).substr(2, 9);

            // Add to uploading set
            setUploadingFiles(prev => new Set(prev).add(tempId));

            // Optimistic local entry (will be replaced by Drive URL)
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async (e) => {
                const base64 = e.target?.result as string;

                if (onFileUpload) {
                    try {
                        const res = await onFileUpload(base64, file.name, file.type);

                        if (res.success && res.url) {
                            const worksheet: Worksheet = {
                                id: tempId,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                url: res.url,
                                status: 'success'
                            };
                            onChange([...worksheets, worksheet]);
                        } else {
                            toast.error(`Cloud upload failed for ${file.name}: ${res.error || 'Unknown error'}`);
                        }
                    } catch (err: any) {
                        toast.error(`Upload error: ${err.message}`);
                    }
                } else {
                    // Legacy Base64 fallback if no provider
                    const worksheet: Worksheet = {
                        id: tempId,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: base64,
                        status: 'success'
                    };
                    onChange([...worksheets, worksheet]);
                }

                // Clear from uploading set
                setUploadingFiles(prev => {
                    const next = new Set(prev);
                    next.delete(tempId);
                    return next;
                });
            };
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const removeWorksheet = (id: string) => {
        onChange(worksheets.filter(w => w.id !== id));
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50/50">
                        <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">Support Materials</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Synchronized with Google Drive: Curriculum &gt; Month &gt; Day</p>
                    </div>
                </div>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500",
                    isDragging
                        ? "border-indigo-400 bg-indigo-50/50 scale-[0.99]"
                        : "border-zinc-100 bg-white hover:border-indigo-200 hover:bg-zinc-50/30"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                    multiple
                    accept=".pdf,image/*"
                />

                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={cn(
                        "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                        isDragging ? "bg-indigo-600 text-white rotate-12" : "bg-zinc-900 text-white group-hover:bg-indigo-600 group-hover:-rotate-6"
                    )}>
                        <FileUp className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-black text-zinc-900 uppercase tracking-tighter italic">Drop worksheets here</p>
                        <p className="text-xs text-zinc-400 font-medium tracking-wide">Or click to browse from your computer (Max 5MB per file)</p>
                    </div>
                </div>
            </div>

            {(worksheets.length > 0 || uploadingFiles.size > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {worksheets.map((worksheet) => (
                            <motion.div
                                {...{
                                    key: worksheet.id,
                                    layout: true,
                                    initial: { opacity: 0, scale: 0.9, y: 20 },
                                    animate: { opacity: 1, scale: 1, y: 0 },
                                    exit: { opacity: 0, scale: 0.9, y: 20 },
                                    className: "group relative bg-white border border-zinc-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all ring-1 ring-black/[0.01]"
                                } as any}
                            >
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner border border-zinc-50",
                                    worksheet.type.includes('image') ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                                )}>
                                    {worksheet.type.includes('image') ? <ImageIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-zinc-900 truncate uppercase tracking-tighter">{worksheet.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formatSize(worksheet.size)}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeWorksheet(worksheet.id); }}
                                    className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}

                        {/* Show uploading placeholders */}
                        {Array.from(uploadingFiles).map(id => (
                            <motion.div
                                key={`uploading-${id}`}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="group relative bg-zinc-50/50 border border-zinc-100 border-dashed rounded-3xl p-5 flex items-center gap-4"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-zinc-200 rounded-full animate-pulse mb-2" />
                                    <div className="h-2 w-16 bg-zinc-100 rounded-full animate-pulse" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

