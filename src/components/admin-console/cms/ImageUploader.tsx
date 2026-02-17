"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Sparkles, X, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { generateImageAction } from "@/app/actions/ai-page-actions";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    label: string;
    description?: string;
    aiTitle?: string; // Used as prompt for AI generation
}

export function ImageUploader({ value, onChange, label, description, aiTitle }: ImageUploaderProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("contentType", file.type);
        formData.append("folder", "blog");

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({
                    file: await blobToBase64(file),
                    fileName: file.name,
                    contentType: file.type,
                    folder: "blog"
                }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (data.success) {
                onChange(data.url);
                toast.success("Image uploaded successfully!");
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiTitle) {
            toast.error("Please enter a title first to generate a relevant image.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateImageAction(aiTitle);
            if (res.success && res.url) {
                onChange(res.url);
                toast.success("AI Image generated and saved!");
            } else {
                throw new Error(res.error || "AI generation failed");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
                {description && <span className="text-[10px] font-bold text-slate-300 uppercase">{description}</span>}
            </div>

            <div className="relative group">
                {value ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner group">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="font-bold rounded-lg"
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => onChange("")}
                                className="font-bold rounded-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => !isGenerating && !isUploading && fileInputRef.current?.click()}
                        className={`
                            aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
                            ${isGenerating || isUploading ? 'bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-purple-300 hover:bg-purple-50/30'}
                        `}
                    >
                        {isGenerating || isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {isGenerating ? "AI Generating..." : "Uploading..."}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-100 transition-colors">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Click to Upload</p>
                                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isGenerating || isUploading}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isGenerating || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 border-2 font-bold text-[10px] uppercase tracking-wider"
                >
                    <Upload className="h-3 w-3 mr-2" />
                    Manually Upload
                </Button>
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isGenerating || isUploading || !aiTitle}
                    onClick={handleAIGenerate}
                    className="h-9 bg-purple-600 hover:bg-purple-700 text-white border-none font-bold text-[10px] uppercase tracking-wider shadow-sm"
                >
                    {isGenerating ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                        <Sparkles className="h-3 w-3 mr-2" />
                    )}
                    Generate with AI
                </Button>
            </div>
        </div>
    );
}
