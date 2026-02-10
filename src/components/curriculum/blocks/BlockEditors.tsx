"use client";

import { useState } from "react";
import {
    FileText,
    Image as ImageIcon,
    Users,
    Package,
    CheckSquare,
    FileUp,
    Clock,
    Plus,
    X,
    Upload,
    AlertCircle,
    GripVertical,
    Trash2,
    Loader2,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "../RichTextEditor";
import { toast } from "sonner";
import type {
    Block,
    TextBlock,
    ImageBlock,
    ContentBlock,
    InstructionsBlock,
    MaterialsBlock,
    ChecklistBlock,
    WorksheetBlock,
    TimetableBlock
} from "@/types/curriculum-blocks";

// ============================================================================
// TEXT BLOCK EDITOR
// ============================================================================

export function TextBlockEditor({
    block,
    onChange
}: {
    block: TextBlock;
    onChange: (data: any) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#2D9CB8]/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-[#2D9CB8]" />
                </div>
                <div>
                    <h4 className="font-bold text-[#0C3449] text-lg">Text Content</h4>
                    <p className="text-sm text-zinc-500">Add formatted text with highlighting</p>
                </div>
            </div>

            <RichTextEditor
                content={block.data.content || ""}
                onChange={(content) => onChange({ ...block.data, content })}
                placeholder="Start typing your content..."
            />
        </div>
    );
}

// ============================================================================
// IMAGE BLOCK EDITOR
// ============================================================================

// ============================================================================
// IMAGE BLOCK EDITOR
// ============================================================================

// ============================================================================
// CONTENT BLOCK EDITOR (Unified Text + Image)
// ============================================================================

export function ContentBlockEditor({
    block,
    onChange
}: {
    block: ContentBlock;
    onChange: (data: any) => void;
}) {
    const [uploading, setUploading] = useState(false);

    // Reuse compression logic
    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1920;
                    const maxHeight = 1080;
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Compression failed'));
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploading(true);
        try {
            const newImages = await Promise.all(
                files.map(async (file) => {
                    const compressedBlob = await compressImage(file);
                    const base64 = await blobToBase64(compressedBlob);
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            contentType: 'image/jpeg',
                            folder: 'curriculum',
                        }),
                    });
                    if (!response.ok) throw new Error('Upload failed');
                    const data = await response.json();
                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        url: data.url,
                        caption: "",
                        alt: file.name
                    };
                })
            );
            onChange({
                ...block.data,
                images: [...(block.data.images || []), ...newImages]
            });
            toast.success("Images uploaded successfully");
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (id: string) => {
        onChange({
            ...block.data,
            images: (block.data.images || []).filter(img => img.id !== id)
        });
    };

    const updateCaption = (id: string, caption: string) => {
        onChange({
            ...block.data,
            images: (block.data.images || []).map(img =>
                img.id === id ? { ...img, caption } : img
            )
        });
    };

    return (
        <div className="group/content relative">
            {/* Rich Text Editor - Seamless */}
            <div className="">
                <RichTextEditor
                    content={block.data.content || ""}
                    onChange={(content) => onChange({ ...block.data, content })}
                    placeholder="Type content here..."
                />
            </div>

            {/* Image Gallery & Uploader */}
            <div className={cn(
                "mt-2 transition-all duration-300",
                (block.data.images || []).length === 0 ? "opacity-0 group-hover/content:opacity-100 h-0 group-hover/content:h-auto overflow-hidden" : "opacity-100"
            )}>
                {/* Image Grid */}
                {(block.data.images || []).length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        {(block.data.images || []).map((image) => (
                            <div key={image.id} className="group/img relative bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200">
                                <div className="aspect-video relative">
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-2 right-2 h-6 w-6 rounded-md bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={image.caption || ""}
                                    onChange={(e) => updateCaption(image.id, e.target.value)}
                                    placeholder="Caption..."
                                    className="w-full text-xs bg-transparent p-2 outline-none focus:bg-white transition-colors placeholder:text-zinc-300"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Subtle Uploader Trigger */}
                <div className="flex items-center gap-4">
                    <label className={cn(
                        "cursor-pointer flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-[#2D9CB8] transition-colors py-1 px-3 rounded-full hover:bg-[#2D9CB8]/5 border border-transparent hover:border-[#2D9CB8]/20 w-fit",
                        uploading && "opacity-50 cursor-wait"
                    )}>
                        {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <ImageIcon className="h-3 w-3" />
                        )}
                        <span>{uploading ? "Uploading..." : "Add Content Image"}</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

// Keep generic ImageBlockEditor for ref backward compatibility but hide in UI if needed
export function ImageBlockEditor({
    block,
    onChange
}: {
    block: ImageBlock;
    onChange: (data: any) => void;
}) {
    const [uploading, setUploading] = useState(false);

    const compressImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if needed (HD max)
                    const maxWidth = 1920;
                    const maxHeight = 1080;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Compression failed'));
                        },
                        'image/jpeg',
                        0.8 // 80% quality
                    );
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);

        try {
            const newImages = await Promise.all(
                files.map(async (file) => {
                    // 1. Compress
                    const compressedBlob = await compressImage(file);

                    // 2. Upload to API
                    const base64 = await blobToBase64(compressedBlob);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            contentType: 'image/jpeg',
                            folder: 'curriculum',
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const data = await response.json();

                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        url: data.url, // Cloud URL or Compressed Base64
                        caption: "",
                        alt: file.name
                    };
                })
            );

            onChange({
                ...block.data,
                images: [...(block.data.images || []), ...newImages]
            });
        } catch (error) {
            console.error("Image upload error:", error);
            // Fallback: toast error?
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (id: string) => {
        onChange({
            ...block.data,
            images: block.data.images.filter(img => img.id !== id)
        });
    };

    const updateCaption = (id: string, caption: string) => {
        onChange({
            ...block.data,
            images: block.data.images.map(img =>
                img.id === id ? { ...img, caption } : img
            )
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#9D6BFF]/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-[#9D6BFF]" />
                </div>
                <div>
                    <h4 className="font-bold text-[#0C3449] text-lg">Image Gallery</h4>
                    <p className="text-sm text-zinc-500">Upload and manage images</p>
                </div>
            </div>

            {/* Upload Area */}
            <div className="relative group">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />
                <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-[#2D9CB8] hover:bg-[#2D9CB8]/5 transition-all">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 border-4 border-[#2D9CB8] border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-bold text-[#2D9CB8]">Compressing & Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 text-zinc-400 mb-3" />
                            <p className="text-sm font-bold text-zinc-600">
                                Click or drag images here
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">PNG, JPG, GIF (Max 10MB)</p>
                        </>
                    )}
                </div>
            </div>

            {/* Image Grid */}
            {/* Image Grid */}
            {(block.data.images || []).length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {(block.data.images || []).map((image) => (
                        <div key={image.id} className="group relative bg-zinc-50 rounded-2xl overflow-hidden border-2 border-zinc-200">
                            <div className="aspect-video relative">
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeImage(image.id)}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-3">
                                <input
                                    type="text"
                                    value={image.caption || ""}
                                    onChange={(e) => updateCaption(image.id, e.target.value)}
                                    placeholder="Add caption..."
                                    className="w-full text-sm bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// INSTRUCTIONS BLOCK EDITOR
// ============================================================================

export function InstructionsBlockEditor({
    block,
    onChange
}: {
    block: InstructionsBlock;
    onChange: (data: any) => void;
}) {
    const addStep = () => {
        onChange({
            ...block.data,
            steps: [
                ...(block.data.steps || []),
                {
                    id: Math.random().toString(36).substr(2, 9),
                    text: "",
                    isImportant: false
                }
            ]
        });
    };

    const updateStep = (id: string, text: string) => {
        onChange({
            ...block.data,
            steps: block.data.steps.map(step =>
                step.id === id ? { ...step, text } : step
            )
        });
    };

    const toggleImportant = (id: string) => {
        onChange({
            ...block.data,
            steps: block.data.steps.map(step =>
                step.id === id ? { ...step, isImportant: !step.isImportant } : step
            )
        });
    };

    const removeStep = (id: string) => {
        onChange({
            ...block.data,
            steps: block.data.steps.filter(step => step.id !== id)
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#A8FF6B]/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#10b981]" />
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={block.data.title || ""}
                        onChange={(e) => onChange({ ...block.data, title: e.target.value })}
                        placeholder="Instructions Title..."
                        className="text-lg font-bold text-[#0C3449] bg-transparent border-none outline-none w-full"
                    />
                    <p className="text-sm text-zinc-500">Step-by-step guidance for teachers</p>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {(block.data.steps || []).map((step, index) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border-2 transition-all",
                            step.isImportant
                                ? "bg-[#FF8800]/5 border-[#FF8800]"
                                : "bg-zinc-50 border-zinc-200"
                        )}
                    >
                        <div className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
                            step.isImportant ? "bg-[#FF8800] text-white" : "bg-white text-zinc-600"
                        )}>
                            {index + 1}
                        </div>
                        <input
                            type="text"
                            value={step.text}
                            onChange={(e) => updateStep(step.id, e.target.value)}
                            placeholder="Enter instruction step..."
                            className="flex-1 bg-transparent border-none outline-none text-[#0C3449] font-medium"
                        />
                        <button
                            onClick={() => toggleImportant(step.id)}
                            className={cn(
                                "h-7 px-3 rounded-lg text-xs font-bold transition-all",
                                step.isImportant
                                    ? "bg-[#FF8800] text-white"
                                    : "bg-white text-zinc-500 hover:bg-zinc-100"
                            )}
                        >
                            {step.isImportant ? "Important" : "Mark"}
                        </button>
                        <button
                            onClick={() => removeStep(step.id)}
                            className="h-7 w-7 rounded-lg bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 flex items-center justify-center transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addStep}
                className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#2D9CB8] hover:bg-[#2D9CB8]/5 text-zinc-600 hover:text-[#2D9CB8] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Add Step
            </button>

            {/* Notes */}
            <div>
                <label className="block text-sm font-bold text-zinc-600 mb-2">Additional Notes</label>
                <textarea
                    value={block.data.notes || ""}
                    onChange={(e) => onChange({ ...block.data, notes: e.target.value })}
                    placeholder="Add any additional notes or tips..."
                    className="w-full h-24 bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-[#2D9CB8] resize-none"
                />
            </div>
        </div>
    );
}

// ============================================================================
// MATERIALS BLOCK EDITOR
// ============================================================================

export function MaterialsBlockEditor({
    block,
    onChange
}: {
    block: MaterialsBlock;
    onChange: (data: any) => void;
}) {
    const categories = ["stationery", "toys", "food", "craft", "other"] as const;

    const addItem = () => {
        onChange({
            ...block.data,
            items: [
                ...(block.data.items || []),
                {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "",
                    quantity: "",
                    category: "other" as const
                }
            ]
        });
    };

    const updateItem = (id: string, field: string, value: any) => {
        onChange({
            ...block.data,
            items: block.data.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        });
    };

    const removeItem = (id: string) => {
        onChange({
            ...block.data,
            items: block.data.items.filter(item => item.id !== id)
        });
    };

    const categoryColors: Record<string, string> = {
        stationery: "#2D9CB8",
        toys: "#FF6B9D",
        food: "#A8FF6B",
        craft: "#9D6BFF",
        other: "#64748B"
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#FFD46B]/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-[#FF8800]" />
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={block.data.title || ""}
                        onChange={(e) => onChange({ ...block.data, title: e.target.value })}
                        placeholder="Materials List Title..."
                        className="text-lg font-bold text-[#0C3449] bg-transparent border-none outline-none w-full"
                    />
                    <p className="text-sm text-zinc-500">Required materials and supplies</p>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {(block.data.items || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border-2 border-zinc-200">
                        <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${categoryColors[item.category]}20` }}
                        >
                            <Package className="h-4 w-4" style={{ color: categoryColors[item.category] }} />
                        </div>
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Item name..."
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm"
                        />
                        <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                            placeholder="Qty"
                            className="w-20 bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm text-center"
                        />
                        <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, "category", e.target.value)}
                            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm capitalize"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 rounded-lg bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 flex items-center justify-center transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addItem}
                className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#2D9CB8] hover:bg-[#2D9CB8]/5 text-zinc-600 hover:text-[#2D9CB8] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Add Material
            </button>
        </div>
    );
}

// ============================================================================
// CHECKLIST BLOCK EDITOR
// ============================================================================

export function ChecklistBlockEditor({
    block,
    onChange
}: {
    block: ChecklistBlock;
    onChange: (data: any) => void;
}) {
    const priorities = ["high", "medium", "low"] as const;

    const addTask = () => {
        onChange({
            ...block.data,
            tasks: [
                ...(block.data.tasks || []),
                {
                    id: Math.random().toString(36).substr(2, 9),
                    text: "",
                    priority: "medium" as const
                }
            ]
        });
    };

    const updateTask = (id: string, field: string, value: any) => {
        onChange({
            ...block.data,
            tasks: block.data.tasks.map(task =>
                task.id === id ? { ...task, [field]: value } : task
            )
        });
    };

    const removeTask = (id: string) => {
        onChange({
            ...block.data,
            tasks: block.data.tasks.filter(task => task.id !== id)
        });
    };

    const priorityColors = {
        high: "#FF6B9D",
        medium: "#FFD46B",
        low: "#A8FF6B"
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#FF6B9D]/10 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-[#FF6B9D]" />
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        value={block.data.title || ""}
                        onChange={(e) => onChange({ ...block.data, title: e.target.value })}
                        placeholder="Checklist Title..."
                        className="text-lg font-bold text-[#0C3449] bg-transparent border-none outline-none w-full"
                    />
                    <p className="text-sm text-zinc-500">Activity tasks and timeline</p>
                </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
                {(block.data.tasks || []).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border-2 border-zinc-200">
                        <div
                            className="h-6 w-6 rounded-lg border-2 flex-shrink-0"
                            style={{ borderColor: priorityColors[task.priority || "medium"] }}
                        />
                        <input
                            type="text"
                            value={task.text}
                            onChange={(e) => updateTask(task.id, "text", e.target.value)}
                            placeholder="Task description..."
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm"
                        />
                        <input
                            type="text"
                            value={task.duration || ""}
                            onChange={(e) => updateTask(task.id, "duration", e.target.value)}
                            placeholder="15 min"
                            className="w-24 bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm text-center"
                        />
                        <select
                            value={task.priority || "medium"}
                            onChange={(e) => updateTask(task.id, "priority", e.target.value)}
                            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-[#2D9CB8] text-sm capitalize"
                        >
                            {priorities.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => removeTask(task.id)}
                            className="h-8 w-8 rounded-lg bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 flex items-center justify-center transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addTask}
                className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#2D9CB8] hover:bg-[#2D9CB8]/5 text-zinc-600 hover:text-[#2D9CB8] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Add Task
            </button>
        </div>
    );
}

// ============================================================================
// TIMETABLE BLOCK EDITOR
// ============================================================================

export function TimetableBlockEditor({
    block,
    onChange
}: {
    block: TimetableBlock;
    onChange: (data: any) => void;
}) {
    const addSlot = () => {
        onChange({
            ...block.data,
            schedule: [
                ...(block.data.schedule || []),
                {
                    id: Math.random().toString(36).substr(2, 9),
                    startTime: "",
                    endTime: "",
                    activity: "",
                    color: "#2D9CB8"
                }
            ]
        });
    };

    const updateSlot = (id: string, field: string, value: any) => {
        onChange({
            ...block.data,
            schedule: block.data.schedule.map(slot =>
                slot.id === id ? { ...slot, [field]: value } : slot
            )
        });
    };

    const removeSlot = (id: string) => {
        onChange({
            ...block.data,
            schedule: block.data.schedule.filter(slot => slot.id !== id)
        });
    };

    const activityColors = [
        "#2D9CB8", "#FF8800", "#9D6BFF", "#FF6B9D", "#A8FF6B", "#FFD46B"
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[#6B7BFF]/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[#6B7BFF]" />
                </div>
                <div>
                    <h4 className="font-bold text-[#0C3449] text-lg">Daily Timetable</h4>
                    <p className="text-sm text-zinc-500">Schedule and activities</p>
                </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
                {(block.data.schedule || []).map((slot) => (
                    <div key={slot.id} className="group relative bg-white rounded-2xl p-2 border border-zinc-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
                        {/* Color Indicator Bar */}
                        <div
                            className="w-1.5 h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: slot.color || "#2D9CB8" }}
                        />

                        {/* Time Range */}
                        <div className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-100">
                            <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-bold text-zinc-600 w-16 text-center"
                            />
                            <span className="text-zinc-300">→</span>
                            <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-bold text-zinc-600 w-16 text-center"
                            />
                        </div>

                        {/* Activity Name */}
                        <input
                            type="text"
                            value={slot.activity}
                            onChange={(e) => updateSlot(slot.id, "activity", e.target.value)}
                            placeholder="Activity name..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[#0C3449] placeholder:text-zinc-300"
                        />

                        {/* Color Swatches */}
                        <div className="flex gap-1.5 mr-2">
                            {activityColors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateSlot(slot.id, "color", color)}
                                    className={cn(
                                        "h-6 w-6 rounded-lg transition-all",
                                        slot.color === color
                                            ? "ring-2 ring-offset-2 ring-zinc-200 scale-110"
                                            : "hover:scale-110 hover:opacity-80"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* Delete Action */}
                        <button
                            onClick={() => removeSlot(slot.id)}
                            className="h-8 w-8 rounded-full text-zinc-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={addSlot}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-[#2D9CB8] hover:bg-[#2D9CB8]/5 text-zinc-400 hover:text-[#2D9CB8] font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
                <Plus className="h-4 w-4" />
                Add Time Slot
            </button>
        </div>
    );
}
