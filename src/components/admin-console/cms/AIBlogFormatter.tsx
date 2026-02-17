"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Loader2, Save, RefreshCcw, Wand2, ArrowLeft, Image as ImageIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { generateBlogContentAction, generateImageAction } from "@/app/actions/ai-page-actions";
import { getSystemSettingsAction } from "@/app/actions/settings-actions";
import { RichTextEditor } from "@/components/curriculum/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AIBlogFormatterProps {
    onSave: (html: string, imageUrl?: string) => void;
    onCancel: () => void;
    initialContent?: string;
}

export function AIBlogFormatter({ onSave, onCancel, initialContent = "" }: AIBlogFormatterProps) {
    const [step, setStep] = useState<"input" | "generating" | "preview">("input");
    const [rawText, setRawText] = useState("");
    const [generatedHTML, setGeneratedHTML] = useState("");
    const [generatedImageUrl, setGeneratedImageUrl] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!rawText.trim()) {
            toast.error("Please provide some content first.");
            return;
        }

        setIsGenerating(true);
        setStep("generating");

        try {
            const settingsRes = await getSystemSettingsAction();
            let provider: 'google' | 'openai' = 'openai';

            if (settingsRes.success && settingsRes.data?.integrationsConfig) {
                try {
                    const config = JSON.parse(settingsRes.data.integrationsConfig);
                    provider = config.defaultProvider || 'openai';
                } catch (e) { }
            }

            const res = await generateBlogContentAction(rawText, images, provider);

            if (res.success && res.data) {
                setGeneratedHTML(res.data);

                // Auto-generate a cover image based on the title found in the content
                try {
                    // Extract title from <h1> if present
                    const titleMatch = res.data.match(/<h1>(.*?)<\/h1>/);
                    const promptTitle = titleMatch ? titleMatch[1] : rawText.substring(0, 50);
                    const imgRes = await generateImageAction(promptTitle);
                    if (imgRes.success && imgRes.url) {
                        setGeneratedImageUrl(imgRes.url);
                    }
                } catch (e) {
                    console.error("AI Image Generation Error:", e);
                }

                setStep("preview");
                toast.success("Content formatted successfully!");
            } else {
                throw new Error(res.error || "Generation failed");
            }
        } catch (error: any) {
            console.error("AI Error:", error);
            toast.error(error.message);
            setStep("input");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                setImages(prev => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <Wand2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">AI Magic Formatter</h3>
                        <p className="text-xs text-slate-500">Transform raw text into a blog post.</p>
                    </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Close
                </Button>
            </div>

            <div className="flex-1 p-6 relative">
                {/* @ts-ignore */}
                <AnimatePresence mode="wait">
                    {step === "input" && (
                        /* @ts-ignore */
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full flex flex-col gap-6"
                        >
                            <div className="grid lg:grid-cols-3 gap-6 h-full">
                                <div className="lg:col-span-2 flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Raw Content / Notes
                                    </label>
                                    <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste your unformatted draft, notes, or brain dump here..."
                                        className="flex-1 w-full p-4 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-0 resize-none text-sm leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-xl border-2 border-slate-100 p-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                                            Reference Images (Optional)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 h-5 w-5 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50 flex flex-col items-center justify-center cursor-pointer transition-colors gap-1">
                                                <Upload className="h-5 w-5 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-400">UPLOAD</span>
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                            Upload images if you want the AI to analyze them for context (they won't be inserted into the text automatically).
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={!rawText.trim() || isGenerating}
                                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Magic Format
                                    </Button>

                                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-xs leading-relaxed">
                                        <strong>Pro Tip:</strong> You can paste rough notes or a wall of text. The AI will structure it with headings, lists, and proper HTML formatting.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "generating" && (
                        /* @ts-ignore */
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                                <div className="h-20 w-20 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 border-2 border-purple-100">
                                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Formatting Your Content</h3>
                                <p className="text-slate-500">Applying structure, enhancing readability, and optimizing for SEO...</p>
                            </div>
                        </motion.div>
                    )}

                    {step === "preview" && (
                        /* @ts-ignore */
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("input")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Input
                                </Button>
                                <Button type="button" onClick={() => onSave(generatedHTML, generatedImageUrl)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                                    <Save className="h-4 w-4 mr-2" />
                                    Apply Content & Image
                                </Button>
                            </div>

                            <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-0">
                                <div className="lg:col-span-3 border-2 border-slate-100 rounded-xl overflow-hidden bg-white">
                                    <RichTextEditor
                                        content={generatedHTML}
                                        onChange={setGeneratedHTML}
                                    />
                                </div>
                                <div className="space-y-4 overflow-y-auto pr-2">
                                    <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-4">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Recommended Cover</h4>
                                        {generatedImageUrl ? (
                                            <div className="space-y-3">
                                                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={generatedImageUrl} className="w-full h-full object-cover" />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-slate-500 text-[10px] font-bold uppercase"
                                                    onClick={async () => {
                                                        const titleMatch = generatedHTML.match(/<h1>(.*?)<\/h1>/);
                                                        const promptTitle = titleMatch ? titleMatch[1] : rawText.substring(0, 50);
                                                        setGeneratedImageUrl("");
                                                        const res = await generateImageAction(promptTitle);
                                                        if (res.success && res.url) setGeneratedImageUrl(res.url);
                                                    }}
                                                >
                                                    <RefreshCcw className="h-3 w-3 mr-2" />
                                                    Regenerate Image
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 bg-white">
                                                <Loader2 className="h-4 w-4 animate-spin font-bold" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">AI Generating...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-medium leading-relaxed">
                                        <Sparkles className="h-3 w-3 mb-2" />
                                        I've analyzed your content and generated a professional cover image. Clicking <strong>Apply</strong> will set both the content and cover image.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
