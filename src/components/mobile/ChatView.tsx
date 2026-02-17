"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    Smile,
    ChevronLeft,
    MoreVertical,
    Check,
    CheckCheck,
    Loader2
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
        <div className="flex flex-col h-screen bg-[#F8FAFC] max-w-md mx-auto shadow-2xl relative overflow-hidden font-sans">

            {/* 1. Glass Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">{title}</h1>
                        <p className="text-[10px] font-bold text-summer-teal uppercase tracking-widest mt-1">{subtitle}</p>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-95 transition-transform">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* 2. Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-16 h-16 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-3xl">👋</div>
                        <p className="text-sm font-bold text-slate-400">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderType === "PARENT";
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id || idx}
                                className={cn(
                                    "flex flex-col",
                                    isMe ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[85%] px-5 py-3.5 rounded-[24px] shadow-sm relative",
                                    isMe
                                        ? "bg-summer-teal text-white rounded-tr-none"
                                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                )}>
                                    <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>

                                    <div className={cn(
                                        "flex items-center gap-1.5 mt-1.5",
                                        isMe ? "justify-end" : "justify-start"
                                    )}>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider",
                                            isMe ? "text-white/60" : "text-slate-300"
                                        )}>
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                        {isMe && (
                                            msg.isRead ? (
                                                <CheckCheck className="w-3 h-3 text-white/80" />
                                            ) : (
                                                <Check className="w-3 h-3 text-white/40" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* 3. Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 pb-10">
                <div className="bg-slate-50 rounded-[28px] p-2 flex items-center gap-2 border border-slate-100 focus-within:border-summer-teal/30 focus-within:bg-white transition-all shadow-inner">
                    <button className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent py-2.5 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-300 resize-none max-h-32"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-colors">
                        <Smile className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90",
                            newMessage.trim()
                                ? "bg-summer-teal text-white shadow-teal-200"
                                : "bg-slate-200 text-white shadow-none cursor-not-allowed"
                        )}
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
