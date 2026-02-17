"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Utensils,
    Moon,
    Sun,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    Paperclip,
    User,
    Star,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { acknowledgeDiaryEntryAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";

export type ActivityType = "DIARY" | "ATTENDANCE" | "HOMEWORK";

interface ActivityCardProps {
    id: string;
    type: ActivityType;
    category?: string;
    title: string;
    content?: string;
    timestamp: string | Date;
    author?: string;
    attachments?: string[];
    metadata?: {
        status?: string;
        priority?: 'URGENT' | 'HIGH' | 'NORMAL';
        requiresAck?: boolean;
        isAcknowledged?: boolean;
        dueDate?: string | Date;
        isSubmitted?: boolean;
    };
    studentId?: string;
    slug: string;
    index: number;
}

export const ActivityCard = ({
    id,
    type,
    category,
    title,
    content,
    timestamp,
    author,
    attachments = [],
    metadata,
    studentId,
    slug,
    index
}: ActivityCardProps) => {
    const [isAcknowledgeLoading, setIsAcknowledgeLoading] = React.useState(false);
    const date = new Date(timestamp);

    // Elegant theme mapping with High Contrast
    const getTheme = () => {
        switch (type) {
            case "DIARY":
                if (category === "MEAL") return { color: "text-orange-600", border: "border-orange-100", bg: "bg-orange-50", icon: <Utensils className="w-4 h-4" /> };
                if (category === "NAP") return { color: "text-purple-600", border: "border-purple-100", bg: "bg-purple-50", icon: <Moon className="w-4 h-4" /> };
                return { color: "text-pink-600", border: "border-pink-100", bg: "bg-pink-50", icon: <Sun className="w-4 h-4" /> };
            case "ATTENDANCE":
                const isPresent = metadata?.status === "PRESENT";
                return {
                    color: isPresent ? "text-emerald-700" : "text-rose-700",
                    border: isPresent ? "border-emerald-100" : "border-rose-100",
                    bg: isPresent ? "bg-emerald-50" : "bg-rose-50",
                    icon: isPresent ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                };
            case "HOMEWORK":
                return { color: "text-indigo-600", border: "border-indigo-100", bg: "bg-indigo-50", icon: <BookOpen className="w-4 h-4" /> };
            default:
                return { color: "text-slate-600", border: "border-slate-100", bg: "bg-slate-50", icon: <Star className="w-4 h-4" /> };
        }
    };

    const theme = getTheme();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="relative pl-8 pb-8 last:pb-0"
        >
            {/* Elegant Timeline Line & Dot */}
            <div className="absolute left-[9px] top-6 bottom-0 w-px bg-slate-200" />
            <div className={cn(
                "absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center",
                theme.bg
            )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", theme.color.replace('text-', 'bg-'))} />
            </div>

            {/* Card Content */}
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-xl active:scale-[0.99] group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme.bg, theme.color)}>
                            {theme.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-[15px] leading-tight">{title}</h3>
                                {metadata?.priority === 'URGENT' && (
                                    <span className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        URGENT
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", theme.bg, theme.color)}>
                                    {category || type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(date, "h:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {content && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-[52px]">
                        {content}
                    </p>
                )}

                {type === "DIARY" && metadata?.requiresAck && !metadata?.isAcknowledged && (
                    <div className="ml-[52px] mb-4">
                        <button
                            disabled={isAcknowledgeLoading}
                            className="w-full bg-summer-navy text-white text-xs font-black py-3 rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            onClick={async () => {
                                if (!studentId) return;
                                setIsAcknowledgeLoading(true);
                                try {
                                    const res = await acknowledgeDiaryEntryAction(slug, id, studentId);
                                    if (res.success) {
                                        toast.success("Successfully acknowledged");
                                    } else {
                                        toast.error(res.error || "Failed to acknowledge");
                                    }
                                } catch (error) {
                                    toast.error("Something went wrong");
                                } finally {
                                    setIsAcknowledgeLoading(false);
                                }
                            }}
                        >
                            {isAcknowledgeLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-summer-teal" />
                            )}
                            ACKNOWLEDGE RECEIPT
                        </button>
                    </div>
                )}

                {type === "DIARY" && metadata?.isAcknowledged && (
                    <div className="ml-[52px] mb-4 flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Acknowledged by you</span>
                    </div>
                )}

                {/* Metadata / Homework Status */}
                {type === "HOMEWORK" && metadata?.dueDate && (
                    <div className="ml-[52px] bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600">Due: {format(new Date(metadata.dueDate), "MMM do")}</span>
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
                            metadata.isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                            {metadata.isSubmitted ? "Submitted" : "Pending"}
                        </span>
                    </div>
                )}

                {/* Attachments with Thumbnails */}
                {attachments.length > 0 && (
                    <div className="ml-[52px] flex flex-wrap gap-2 mb-3">
                        {attachments.map((url, i) => {
                            const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                            return (
                                <div key={i} className="relative group">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden transition-transform active:scale-95">
                                        {isImage ? (
                                            <img src={url} alt="attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <Paperclip className="w-5 h-5" />
                                        )}
                                    </div>
                                    {isImage && (
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <Eye className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="ml-[52px] pt-3 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                            {author || "School Admin"}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
