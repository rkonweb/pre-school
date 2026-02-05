"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

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
                setParsed({});
                setJsonError("Invalid JSON");
            }
        }
    }, [sectionKey]);

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
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Badge Text" value={parsed.badge} onChange={(v) => updateField("badge", v)} />
                    <Input label="Badge Icon" value={parsed.badgeIcon} onChange={(v) => updateField("badgeIcon", v)} />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Headline (HTML supported)</label>
                    <input
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={parsed.headline || ""}
                        onChange={(e) => updateField("headline", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={parsed.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
        );
    }

    if (sectionKey === "highlight") {
        const features = Array.isArray(parsed.features) ? parsed.features : [];

        const addFeature = () => {
            const newFeatures = [...features, "New Highlight Feature"];
            updateField("features", newFeatures);
        };

        const removeFeature = (idx: number) => {
            const newFeatures = features.filter((_: any, i: number) => i !== idx);
            updateField("features", newFeatures);
        };

        const updateFeature = (idx: number, value: string) => {
            const newFeatures = [...features];
            newFeatures[idx] = value;
            updateField("features", newFeatures);
        };

        return (
            <div className="space-y-4">
                <Input label="Badge" value={parsed.badge} onChange={(v) => updateField("badge", v)} />
                <Input label="Title" value={parsed.title} onChange={(v) => updateField("title", v)} />
                <Input label="Description" value={parsed.description} onChange={(v) => updateField("description", v)} />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Background Color" value={parsed.backgroundColor} onChange={(v) => updateField("backgroundColor", v)} type="color" />
                    <Input label="Accent Color" value={parsed.accentColor} onChange={(v) => updateField("accentColor", v)} type="color" />
                </div>

                <div className="border p-4 rounded-xl bg-slate-50">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Highlight Points</label>
                    <div className="space-y-2">
                        {features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                    value={feature}
                                    onChange={(e) => updateFeature(idx, e.target.value)}
                                />
                                <button onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addFeature} className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline">
                            <Plus className="h-4 w-4" /> Add Item
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (sectionKey === "features") {
        const features = Array.isArray(parsed.features) ? parsed.features : [];

        const addFeature = () => {
            const newFeatures = [...features, { title: "New Feature", description: "", icon: "Star", bgColor: "#E0F2FE", textColor: "text-blue-700" }];
            updateField("features", newFeatures);
        };

        const removeFeature = (idx: number) => {
            const newFeatures = features.filter((_: any, i: number) => i !== idx);
            updateField("features", newFeatures);
        };

        const updateFeatureItem = (idx: number, key: string, value: any) => {
            const newFeatures = [...features];
            newFeatures[idx] = { ...newFeatures[idx], [key]: value };
            updateField("features", newFeatures);
        };

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Feature Cards</label>
                    {features.map((feature: any, idx: number) => (
                        <div key={idx} className="border p-4 rounded-xl bg-slate-50 relative group">
                            <button onClick={() => removeFeature(idx)} className="absolute top-2 right-2 p-2 hover:bg-red-100 rounded-full text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Title" value={feature.title} onChange={(v) => updateFeatureItem(idx, "title", v)} />
                                <Input label="Icon" value={feature.icon} onChange={(v) => updateFeatureItem(idx, "icon", v)} />
                                <Input label="Background Color (Hex)" value={feature.bgColor} onChange={(v) => updateFeatureItem(idx, "bgColor", v)} />
                                <Input label="Text Color (Tailwind class)" value={feature.textColor} onChange={(v) => updateFeatureItem(idx, "textColor", v)} />
                                <div className="col-span-2">
                                    <Input label="Description" value={feature.description} onChange={(v) => updateFeatureItem(idx, "description", v)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addFeature} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-purple-50 flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add Feature Card
                    </button>
                </div>

                <div className="border-t pt-6">
                    <h4 className="font-bold text-lg text-slate-900 mb-4">CTA Card (Bottom)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="CTA Title" value={parsed.ctaCard?.title} onChange={(v) => updateNestedField("ctaCard", "title", v)} />
                        <Input label="Button Text" value={parsed.ctaCard?.buttonText} onChange={(v) => updateNestedField("ctaCard", "buttonText", v)} />
                        <div className="col-span-2">
                            <Input label="Description" value={parsed.ctaCard?.description} onChange={(v) => updateNestedField("ctaCard", "description", v)} />
                        </div>
                        <div className="col-span-2">
                            <Input label="Button Link" value={parsed.ctaCard?.buttonLink} onChange={(v) => updateNestedField("ctaCard", "buttonLink", v)} />
                        </div>
                    </div>
                </div>
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
