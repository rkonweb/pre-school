"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import MediaUploader from "@/components/upload/MediaUploader";

interface ContentEditorProps {
    sectionKey: string;
    initialContent: string;
    onChange: (newContent: string) => void;
}

export default function ContentEditor({ sectionKey, initialContent, onChange }: ContentEditorProps) {
    const [parsed, setParsed] = useState<any>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        if (initialContent) {
            try {
                setParsed(JSON.parse(initialContent));
                setJsonError(null);
            } catch (e) {
                setParsed({}); // Fallback
                setJsonError("Invalid JSON content");
            }
        }
    }, [sectionKey]); // Reset when section changes. We ignore initialContent changes to avoid overwriting edits if parent updates.

    const updateField = (key: string, value: any) => {
        const newData = { ...parsed, [key]: value };
        setParsed(newData);
        onChange(JSON.stringify(newData, null, 2));
    };

    const updateNestedField = (parent: string, key: string, value: any) => {
        const newData = {
            ...parsed,
            [parent]: {
                ...(parsed[parent] || {}),
                [key]: value
            }
        };
        setParsed(newData);
        onChange(JSON.stringify(newData, null, 2));
    };

    if (!parsed) return <div>Loading editor...</div>;

    if (sectionKey === "hero") {
        return (
            <div className="space-y-6">
                <div className="border p-4 rounded-xl bg-slate-50 space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 border-b pb-2">Header Image (Full Width Banner)</h4>

                    {parsed.headerImage ? (
                        <div className="relative rounded-xl overflow-hidden group">
                            <img src={parsed.headerImage} alt="Header Banner" className="w-full h-48 object-cover" />
                            <button
                                onClick={() => updateField("headerImage", "")}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                Current Banner
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-slate-500 mb-3">Upload a high-quality landscape image (1920x1080 recommended)</p>
                            <MediaUploader
                                type="PHOTO"
                                onUploadComplete={(url) => updateField("headerImage", url)}
                            />
                        </div>
                    )}
                </div>

                <Input label="Badge Text" value={parsed.badge} onChange={(v) => updateField("badge", v)} placeholder="e.g. LOVED BY 500+ SCHOOLS" />

                <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Headline (supports HTML)</label>
                    <input
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={parsed.headline || ""}
                        onChange={(e) => updateField("headline", e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Tip: Use &lt;span&gt;word&lt;/span&gt; for color highlighting.</p>
                </div>

                <Input label="Subheadline" value={parsed.subheadline} onChange={(v) => updateField("subheadline", v)} />

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50">
                    <h4 className="col-span-2 font-bold text-sm text-slate-900 border-b pb-2">Primary Button</h4>
                    <Input label="Text" value={parsed.primaryCTA?.text} onChange={(v) => updateNestedField("primaryCTA", "text", v)} />
                    <Input label="Link" value={parsed.primaryCTA?.link} onChange={(v) => updateNestedField("primaryCTA", "link", v)} />
                </div>

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50">
                    <h4 className="col-span-2 font-bold text-sm text-slate-900 border-b pb-2">Secondary Button</h4>
                    <Input label="Text" value={parsed.secondaryCTA?.text} onChange={(v) => updateNestedField("secondaryCTA", "text", v)} />
                    <Input label="Link" value={parsed.secondaryCTA?.link} onChange={(v) => updateNestedField("secondaryCTA", "link", v)} />
                </div>

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50">
                    <h4 className="col-span-2 font-bold text-sm text-slate-900 border-b pb-2">Social Proof</h4>
                    <Input label="Rating (Number)" type="number" value={parsed.socialProof?.rating} onChange={(v) => updateNestedField("socialProof", "rating", Number(v))} />
                    <Input label="Text" value={parsed.socialProof?.text} onChange={(v) => updateNestedField("socialProof", "text", v)} />
                </div>
            </div>
        );
    }

    if (sectionKey === "features") {
        const features = Array.isArray(parsed.features) ? parsed.features : [];

        const addFeature = () => {
            const newFeatures = [...features, { title: "New Feature", description: "", icon: "Star", color: "#E0F2FE" }];
            updateField("features", newFeatures);
        };

        const removeFeature = (idx: number) => {
            const newFeatures = features.filter((_: any, i: number) => i !== idx);
            updateField("features", newFeatures);
        };

        const updateFeature = (idx: number, key: string, value: any) => {
            const newFeatures = [...features];
            newFeatures[idx] = { ...newFeatures[idx], [key]: value };
            updateField("features", newFeatures);
        };

        return (
            <div className="space-y-4">
                {features.map((feature: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-xl bg-slate-50 relative group">
                        <button onClick={() => removeFeature(idx)} className="absolute top-2 right-2 p-2 hover:bg-red-100 rounded-full text-red-500">
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <h4 className="font-bold text-sm text-slate-900 mb-3">Feature #{idx + 1}</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Title" value={feature.title} onChange={(v) => updateFeature(idx, "title", v)} />
                            <Input label="Icon Name (Lucide)" value={feature.icon} onChange={(v) => updateFeature(idx, "icon", v)} />
                            <div className="col-span-2">
                                <Input label="Description" value={feature.description} onChange={(v) => updateFeature(idx, "description", v)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Color (Hex)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={feature.color || "#ffffff"} onChange={(e) => updateFeature(idx, "color", e.target.value)} className="h-10 w-10 p-0 border rounded" />
                                    <input type="text" value={feature.color} onChange={(e) => updateFeature(idx, "color", e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={addFeature} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add Feature
                </button>
            </div>
        );
    }

    if (sectionKey === "cta") {
        return (
            <div className="space-y-4">
                <Input label="Headline" value={parsed.headline} onChange={(v) => updateField("headline", v)} />
                <Input label="Subheadline" value={parsed.subheadline} onChange={(v) => updateField("subheadline", v)} />

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50">
                    <h4 className="col-span-2 font-bold text-sm text-slate-900 border-b pb-2">Main Button</h4>
                    <Input label="Button Text" value={parsed.buttonText} onChange={(v) => updateField("buttonText", v)} />
                    <Input label="Button Link" value={parsed.buttonLink} onChange={(v) => updateField("buttonLink", v)} />
                </div>
            </div>
        );
    }

    if (sectionKey === "pricing") {
        return (
            <div className="space-y-4">
                <Input label="Badge Text" value={parsed.badge} onChange={(v) => updateField("badge", v)} />
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="showPlans"
                        checked={parsed.showPlans}
                        onChange={(e) => updateField("showPlans", e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showPlans" className="font-bold text-slate-700">Show Plans Table</label>
                </div>
            </div>
        );
    }

    if (sectionKey === "seo") {
        return (
            <div className="space-y-4">
                <Input label="Meta Title" value={parsed.metaTitle} onChange={(v) => updateField("metaTitle", v)} placeholder="Browser Tab Title" />

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
                    <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={parsed.metaDescription || ""}
                        onChange={(e) => updateField("metaDescription", e.target.value)}
                        placeholder="Short summary for search engines"
                    />
                </div>

                <Input label="Share Image URL (OG Image)" value={parsed.ogImage} onChange={(v) => updateField("ogImage", v)} placeholder="https://..." />
            </div>
        );
    }

    return (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <p className="text-sm">No visual editor available for this section type. Please use the Raw JSON mode.</p>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string, value: any, onChange: (v: string) => void, placeholder?: string, type?: string }) {
    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
            <input
                type={type}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
