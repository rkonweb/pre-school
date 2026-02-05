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

    if (!parsed) return <div>Loading editor...</div>;

    if (sectionKey === "hero") {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Badge Text" value={parsed.badge} onChange={(v) => updateField("badge", v)} />
                    <Input label="Badge Icon (Lucide)" value={parsed.badgeIcon} onChange={(v) => updateField("badgeIcon", v)} />
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-700">Headline (HTML supported)</label>
                    <input
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        value={parsed.headline || ""}
                        onChange={(e) => updateField("headline", e.target.value)}
                    />
                </div>
                <Input label="Description" value={parsed.description} onChange={(v) => updateField("description", v)} />
            </div>
        );
    }

    if (sectionKey === "plans") {
        return (
            <div className="space-y-4">
                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={parsed.showPopularBadge || false}
                            onChange={(e) => updateField("showPopularBadge", e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label className="font-bold text-slate-700">Show 'Most Popular' Badge</label>
                    </div>
                    {parsed.showPopularBadge && (
                        <Input label="Badge Text" value={parsed.popularBadgeText} onChange={(v) => updateField("popularBadgeText", v)} />
                    )}
                </div>

                <div className="p-4 border rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={parsed.billingToggle || false}
                            onChange={(e) => updateField("billingToggle", e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label className="font-bold text-slate-700">Enable Monthly/Yearly Toggle</label>
                    </div>
                </div>
            </div>
        );
    }

    if (sectionKey === "comparison") {
        return (
            <div className="space-y-4">
                <Input label="Section Title" value={parsed.title} onChange={(v) => updateField("title", v)} />
                <Input label="Description" value={parsed.description} onChange={(v) => updateField("description", v)} />
                <div className="p-4 border rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={parsed.showTable || false}
                            onChange={(e) => updateField("showTable", e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label className="font-bold text-slate-700">Show Feature Comparison Table</label>
                    </div>
                </div>
            </div>
        );
    }

    if (sectionKey === "faq") {
        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

        const addQuestion = () => {
            const newQuestions = [...questions, { q: "New Question", a: "Answer" }];
            updateField("questions", newQuestions);
        };

        const removeQuestion = (idx: number) => {
            const newQuestions = questions.filter((_: any, i: number) => i !== idx);
            updateField("questions", newQuestions);
        };

        const updateQuestion = (idx: number, key: string, value: string) => {
            const newQuestions = [...questions];
            newQuestions[idx] = { ...newQuestions[idx], [key]: value };
            updateField("questions", newQuestions);
        };

        return (
            <div className="space-y-4">
                <Input label="Section Title" value={parsed.title} onChange={(v) => updateField("title", v)} />

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Questions</label>
                    {questions.map((item: any, idx: number) => (
                        <div key={idx} className="border p-4 rounded-xl bg-slate-50 relative">
                            <button onClick={() => removeQuestion(idx)} className="absolute top-2 right-2 p-2 hover:bg-red-100 rounded-full text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="space-y-3 pr-8">
                                <Input label="Question" value={item.q} onChange={(v) => updateQuestion(idx, "q", v)} />
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Answer</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        value={item.a || ""}
                                        onChange={(e) => updateQuestion(idx, "a", e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-xl font-bold hover:bg-green-50 flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add Question
                    </button>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" // Green focus for pricing
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
