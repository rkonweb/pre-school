"use client";

import { useState } from "react";
import { Search, Send, MessageCircle, Check, Sparkles, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAIDraftResponseAction } from "@/app/actions/admission-actions";

const MOCK_TEMPLATES = [
    { id: "t1", title: "Initial Inquiry Response", category: "INQUIRY", content: "Hi {{parentName}}, thank you for your interest in {{schoolName}}. We would love to schedule a tour for you and {{childName}}." },
    { id: "t2", title: "Tour Invitation", category: "TOUR", content: "Hello {{parentName}}, are you available for a school tour this Saturday at 10 AM? It's a great way to see our campus." },
    { id: "t3", title: "Fee Structure Details", category: "FEE", content: "Dear {{parentName}}, as requested, here are the details regarding our fee structure for the upcoming academic year..." },
    { id: "t4", title: "Follow-up: No Response", category: "FOLLOWUP", content: "Hi {{parentName}}, just checking in to see if you had any further questions about our programs." },
];

export function WhatsAppTemplates({
    leadId,
    onSelect,
    onSend
}: {
    leadId: string,
    onSelect?: (template: any) => void,
    onSend?: (template: any) => void
}) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [aiDraft, setAiDraft] = useState<string | null>(null);

    const filtered = MOCK_TEMPLATES.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    const handleAIDraft = async () => {
        const template = MOCK_TEMPLATES.find(t => t.id === selectedId);
        if (!template) return;

        setIsDrafting(true);
        const res = await getAIDraftResponseAction(leadId, template.category);
        if (res.success) {
            setAiDraft(res.draft!);
        }
        setIsDrafting(false);
    };

    const handleSelect = (t: any) => {
        setSelectedId(t.id);
        setAiDraft(null); // Reset draft on new selection
        onSelect?.(t);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <MessageCircle className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-black uppercase text-zinc-700 tracking-wide">Templates</span>
                </div>
            </div>

            <div className="p-3 border-b border-zinc-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-green-500 transition-all placeholder:text-zinc-400"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filtered.map(t => (
                    <div
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className={cn(
                            "p-3 rounded-xl cursor-pointer border transition-all hover:scale-[1.01]",
                            selectedId === t.id
                                ? "bg-green-50 border-green-200 shadow-sm"
                                : "bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-100"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <h4 className={cn("text-xs font-bold", selectedId === t.id ? "text-green-800" : "text-zinc-700")}>{t.title}</h4>
                            {selectedId === t.id && <Check className="h-3 w-3 text-green-600" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                            {selectedId === t.id && aiDraft ? aiDraft : t.content}
                        </p>
                    </div>
                ))}
            </div>

            {selectedId && (
                <div className="p-3 border-t border-zinc-100 bg-zinc-50 space-y-2">
                    {!aiDraft ? (
                        <Button
                            onClick={handleAIDraft}
                            disabled={isDrafting}
                            variant="outline"
                            className="w-full h-9 border-brand/20 bg-brand/5 text-brand hover:bg-brand/10 text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            {isDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Personalize with AI
                        </Button>
                    ) : (
                        <Button
                            onClick={handleAIDraft}
                            disabled={isDrafting}
                            variant="ghost"
                            className="w-full h-8 text-[10px] font-black uppercase tracking-widest gap-2 text-zinc-400 hover:text-brand"
                        >
                            <RotateCcw className="h-3 w-3" /> Regenerate
                        </Button>
                    )}

                    <Button
                        onClick={() => {
                            const t = MOCK_TEMPLATES.find(x => x.id === selectedId);
                            if (t && onSend) onSend({ ...t, content: aiDraft || t.content });
                        }}
                        className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-green-600/20"
                    >
                        <Send className="h-3 w-3" /> Send WhatsApp
                    </Button>
                </div>
            )}
        </div>
    );
}
