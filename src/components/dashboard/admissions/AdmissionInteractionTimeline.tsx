"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    MessageSquare,
    Phone,
    Mail,
    ShieldCheck,
    Send,
    Clock,
    User,
    Bot,
    ChevronRight,
    LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addAdmissionInteractionAction } from "@/app/actions/admission-actions";
import { toast } from "sonner";

interface Interaction {
    id: string;
    type: string;
    content: string;
    createdAt: Date;
    staffId?: string | null;
    staff?: {
        name: string;
        image?: string | null;
    } | null;
}

interface AdmissionInteractionTimelineProps {
    admissionId: string;
    slug: string;
    interactions: Interaction[];
    onInteractionAdded?: () => void;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
    AUTOMATION: { icon: Bot, color: "bg-blue-50 text-blue-600 border-blue-100", label: "AI System" },
    STAFF_NOTE: { icon: MessageSquare, color: "bg-brand/5 text-brand border-brand/10", label: "Staff Note" },
    CALL: { icon: Phone, color: "bg-orange-50 text-orange-600 border-orange-100", label: "Call" },
    EMAIL: { icon: Mail, color: "bg-purple-50 text-purple-600 border-purple-100", label: "Email" },
    WHATSAPP: { icon: Send, color: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "WhatsApp" },
};

export function AdmissionInteractionTimeline({
    admissionId,
    slug,
    interactions,
    onInteractionAdded
}: AdmissionInteractionTimelineProps) {
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedType, setSelectedType] = useState("STAFF_NOTE");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const res = await addAdmissionInteractionAction(slug, admissionId, {
            type: selectedType,
            content: note.trim()
        });

        if (res.success) {
            setNote("");
            onInteractionAdded?.();
            toast.success("Interaction logged");
        } else {
            toast.error(res.error || "Failed to log interaction");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                        <Clock className="h-5 w-5 text-[var(--secondary-color)]" />
                    </div>
                    <div>
                        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900">Interaction History</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">Timeline of engagement</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar min-h-[400px]">
                {interactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 opacity-50 py-10">
                        <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-bold">No interactions recorded yet</p>
                    </div>
                ) : (
                    interactions.map((item) => {
                        const config = typeConfig[item.type] || typeConfig.STAFF_NOTE;
                        const Icon = config.icon;
                        const isSystem = item.type === 'AUTOMATION';

                        return (
                            <div key={item.id} className={cn(
                                "flex gap-4 group",
                                isSystem ? "flex-row" : "flex-row-reverse"
                            )}>
                                {/* Avatar/Icon */}
                                <div className="flex-shrink-0">
                                    {isSystem ? (
                                        <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center ring-4 ring-white shadow-sm", config.color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-xl bg-zinc-100 border-2 border-white overflow-hidden flex items-center justify-center ring-4 ring-white shadow-sm">
                                            {item.staff?.image ? (
                                                <img src={item.staff.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-zinc-400" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Content Bubble */}
                                <div className={cn(
                                    "flex flex-col max-w-[80%]",
                                    isSystem ? "items-start" : "items-end"
                                )}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            {isSystem ? config.label : (item.staff?.name || "Staff")}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                        <span className="text-[10px] font-bold text-zinc-400">
                                            {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                        </span>
                                    </div>

                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm font-medium shadow-sm transition-all border",
                                        isSystem
                                            ? "bg-white text-zinc-600 border-zinc-100 rounded-tl-none group-hover:border-zinc-200"
                                            : "bg-brand text-[var(--secondary-color)] border-brand shadow-brand/10 rounded-tr-none hover:brightness-110"
                                    )}>
                                        {item.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {Object.entries(typeConfig).filter(([type]) => type !== 'AUTOMATION').map(([type, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={cn(
                                        "flex-shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                        selectedType === type
                                            ? "bg-brand border-brand text-[var(--secondary-color)] shadow-md"
                                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Type a manual note or interaction detail..."
                            className="w-full bg-white border-zinc-200 rounded-2xl p-4 pr-14 text-sm font-medium focus:ring-2 focus:ring-brand outline-none transition-all min-h-[100px] resize-none border-2"
                        />
                        <button
                            type="submit"
                            disabled={!note.trim() || isSubmitting}
                            className="absolute bottom-4 right-4 h-10 w-10 bg-brand text-[var(--secondary-color)] rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
