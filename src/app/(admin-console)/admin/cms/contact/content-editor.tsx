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

    if (sectionKey === "info") {
        const emails = parsed.email?.addresses || [];

        const addEmail = () => {
            const newEmails = [...emails, "new@example.com"];
            updateNestedField("email", "addresses", newEmails);
        };

        const removeEmail = (idx: number) => {
            const newEmails = emails.filter((_: any, i: number) => i !== idx);
            updateNestedField("email", "addresses", newEmails);
        };

        const updateEmail = (idx: number, value: string) => {
            const newEmails = [...emails];
            newEmails[idx] = value;
            updateNestedField("email", "addresses", newEmails);
        };

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2">General Info</h4>
                    <Input label="Section Title" value={parsed.title} onChange={(v) => updateField("title", v)} />
                    <Input label="Description" value={parsed.description} onChange={(v) => updateField("description", v)} />
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2">Headquarters</h4>
                    <Input label="HQ Title" value={parsed.headquarters?.title} onChange={(v) => updateNestedField("headquarters", "title", v)} />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Address (HTML supported)</label>
                        <textarea
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            value={parsed.headquarters?.address || ""}
                            onChange={(e) => updateNestedField("headquarters", "address", e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2">Email Contacts</h4>
                    <Input label="Email Title" value={parsed.email?.title} onChange={(v) => updateNestedField("email", "title", v)} />
                    <div className="space-y-2">
                        {emails.map((email: string, idx: number) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                    value={email}
                                    onChange={(e) => updateEmail(idx, e.target.value)}
                                />
                                <button onClick={() => removeEmail(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button onClick={addEmail} className="text-sm text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                            <Plus className="h-4 w-4" /> Add Email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (sectionKey === "form") {
        return (
            <div className="space-y-4">
                <Input label="Submit Button Text" value={parsed.submitButtonText} onChange={(v) => updateField("submitButtonText", v)} />
                <Input label="Success Message" value={parsed.successMessage} onChange={(v) => updateField("successMessage", v)} />
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
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" // Indigo focus
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" // Indigo focus for contact
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
