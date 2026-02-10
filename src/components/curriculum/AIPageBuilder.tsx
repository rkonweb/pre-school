"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Image as ImageIcon, FileText, Loader2, Save, RefreshCcw, X, Upload, Wand2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { generatePageAction } from "@/app/actions/ai-page-actions";
import { getSystemSettingsAction } from "@/app/actions/settings-actions";
import { RichTextEditor } from "@/components/curriculum/RichTextEditor";
import { cn } from "@/lib/utils";

interface AIPageBuilderProps {
    onSave: (html: string) => void;
    initialContent?: string;
    isSaving?: boolean;
}

export default function AIPageBuilder({ onSave, initialContent = "", isSaving = false }: AIPageBuilderProps) {
    const [step, setStep] = useState<"input" | "generating" | "editing">(initialContent ? "editing" : "input");
    const [rawText, setRawText] = useState("");
    const [generatedHTML, setGeneratedHTML] = useState(initialContent);
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

            const res = await generatePageAction(rawText, images, provider);

            if (res.success && res.data) {
                setGeneratedHTML(res.data);
                setStep("editing");
                toast.success("Page generated successfully!");
            } else {
                throw new Error(res.error || "Generation failed");
            }
        } catch (error: any) {
            console.error("Architect Error:", error);
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


    const handleReset = () => {
        if (generatedHTML) {
            // Strip HTML tags for raw input
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = generatedHTML;
            const textContent = tempDiv.innerText || tempDiv.textContent || "";
            setRawText(textContent);
        }
        setStep("input");
    };

    return (
        <div className="w-full h-full mx-auto p-4 font-sans">
            <AnimatePresence mode="wait">
                {step === "input" && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-full flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-3 pb-2 border-b border-zinc-100">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Wand2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-zinc-900">Content Generator</h1>
                                <p className="text-xs text-zinc-500">Transform raw notes into structured curriculum.</p>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                            {/* Text Input */}
                            <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                <div className="p-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>Source Material</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Markdown supported</span>
                                </div>
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="Paste your lesson plans, notes, or activity details here..."
                                    className="flex-1 w-full p-4 resize-none outline-none text-sm text-zinc-800 leading-relaxed placeholder:text-zinc-300"
                                />
                            </div>

                            {/* Sidebar: Images & Actions */}
                            <div className="flex flex-col gap-4">
                                <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            <span>Visual References</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400">{images.length} images</span>
                                    </div>

                                    <div className="p-4 flex-1 overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-2">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-100 group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex flex-col items-center justify-center cursor-pointer transition-all gap-1 group">
                                                <Upload className="h-5 w-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                                                <span className="text-[9px] font-medium text-zinc-400 group-hover:text-indigo-600">Upload</span>
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={!rawText.trim() || isGenerating}
                                    className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >

                                    <Sparkles className="h-4 w-4" />
                                    Magic Formatting
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === "generating" && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent animate-spin-slow" />
                            <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-zinc-900">Designing Layout</h3>
                            <p className="text-sm text-zinc-500">Analyzing structure and formatting content...</p>
                        </div>
                        <div className="w-64 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 8, ease: "linear" }}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}

                {step === "editing" && (
                    <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-zinc-900">Editing Mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCcw className="h-3 w-3" />
                                    Edit Source
                                </button>
                                <button
                                    onClick={() => onSave(generatedHTML)}
                                    disabled={isSaving}
                                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-70"
                                >
                                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden relative">
                            <RichTextEditor
                                content={generatedHTML}
                                onChange={setGeneratedHTML}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
