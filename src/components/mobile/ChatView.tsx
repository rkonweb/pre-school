"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    Smile,
    ChevronLeft,
    MoreVertical,
    CheckCheck,
    Loader2,
    ShieldAlert,
    Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    senderType: "PARENT" | "STAFF";
    senderName: string;
    createdAt: string | Date;
    isRead: boolean;
    isFlagged?: boolean;
    deliveryStatus?: string;
    flaggedReason?: string | null;
}

interface ChatViewProps {
    conversationId: string;
    title: string;
    subtitle: string;
    messages: Message[];
    onSendMessage: (content: string) => Promise<void>;
    onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
    title,
    subtitle,
    messages,
    onSendMessage,
    onBack
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(newMessage.trim());
            setNewMessage("");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto relative overflow-hidden font-sans">

            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-rose-500/5 to-transparent pointer-events-none" />

            {/* 1. Premium Header */}
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        title="Go back"
                        className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center active:scale-95 transition-all text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none italic uppercase">{title}</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1.5">{subtitle}</p>
                    </div>
                </div>
                <button title="More options" className="w-10 h-10 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center justify-center active:scale-95 transition-all">
                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                </button>
            </div>

            {/* 2. Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl mb-6 flex items-center justify-center text-4xl shadow-inner border border-zinc-200 dark:border-zinc-700">👋</div>
                        <p className="text-sm font-bold text-zinc-400">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderType === "PARENT";

                        // If it's flagged and I'm the parent, I shouldn't see it (if from teacher) or I should see a warning (if from me)
                        // Actually, let's render it as a completely blurred/masked block if !isMe so they know a message was attempted but blocked.
                        // Or if we want to completely hide it, we can return null as before. The prompt asks to "Mask the chats from the parents and Teachers chat box".
                        // So let's render a masked placeholder instead of returning null.
                        // if (msg.isFlagged && !isMe) {
                        //     return null; 
                        // }

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id || idx}
                                className={cn(
                                    "flex flex-col relative",
                                    isMe ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[85%] px-5 py-3.5 rounded-[24px] shadow-sm relative group backdrop-blur-md transition-all",
                                    msg.isFlagged
                                        ? "bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100" // Flagged Me Styling
                                        : isMe
                                            ? "bg-indigo-500 text-white rounded-tr-sm"
                                            : "bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-100 rounded-tl-sm border border-zinc-200/50 dark:border-zinc-800/50"
                                )}>
                                    {msg.isFlagged && (
                                        <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {isMe ? "Message Blocked" : "Message Censored"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Content Masking Logic */}
                                    {msg.isFlagged && !isMe ? (
                                        <div className="text-[14px] leading-relaxed font-medium text-rose-900/40 dark:text-rose-100/40 italic flex items-center gap-2">
                                            <span className="blur-sm select-none">This message was blocked</span>
                                        </div>
                                    ) : (
                                        <p className="text-[14px] leading-relaxed font-medium">{msg.content}</p>
                                    )}

                                    {msg.isFlagged && msg.flaggedReason && isMe && (
                                        <p className="mt-2 text-[10px] text-rose-600/80 dark:text-rose-400/80 border-t border-rose-200/50 dark:border-rose-800/50 pt-2 font-medium">
                                            {msg.flaggedReason}
                                        </p>
                                    )}

                                    <div className={cn(
                                        "flex items-center gap-1.5 mt-2",
                                        isMe ? "justify-end" : "justify-start"
                                    )}>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider",
                                            msg.isFlagged ? "text-rose-500/60" : isMe ? "text-white/60" : "text-zinc-400"
                                        )}>
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                        {isMe && !msg.isFlagged && (
                                            msg.isRead ? (
                                                <CheckCheck className="w-3.5 h-3.5 text-white/80" />
                                            ) : (
                                                <Check className="w-3.5 h-3.5 text-white/40" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* 3. Premium Input Area */}
            <div className="p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50 pb-8 relative z-50">

                {/* Policy Note */}
                <div className="flex items-center justify-center gap-1.5 mb-3 opacity-60">
                    <Info className="h-3 w-3 text-zinc-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Messages are monitored for policy violations</span>
                </div>

                <div className="bg-zinc-100/80 dark:bg-zinc-900/80 rounded-3xl p-1.5 flex items-end gap-2 border border-zinc-200/50 dark:border-zinc-800/50 focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all shadow-sm">
                    <button title="Attach file" className="w-10 h-10 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors shrink-0 mb-1">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                        rows={1}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            // Auto-grow
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent py-3.5 text-sm font-medium outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none max-h-32 custom-scrollbar"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                                e.currentTarget.style.height = 'auto'; // reset height
                            }
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        title="Send message"
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 mb-0.5",
                            newMessage.trim()
                                ? "bg-indigo-500 text-white shadow-indigo-500/20 hover:bg-indigo-400"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 shadow-none cursor-not-allowed"
                        )}
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-0.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
