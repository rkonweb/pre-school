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
    Info,
    Check
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PollOption {
    id: string;
    text: string;
}

interface PollResponse {
    id: string;
    userId: string;
    optionId: string;
}

interface Poll {
    id: string;
    question: string;
    options: string; // JSON string in DB
    responses: PollResponse[];
}

interface Message {
    id: string;
    content: string;
    type?: "TEXT" | "POLL" | "IMAGE" | "FILE" | "BROADCAST";
    senderType: "PARENT" | "STAFF";
    senderId?: string | null;
    senderName: string;
    createdAt: string | Date;
    isRead: boolean;
    status: "SENT" | "FLAGGED" | "REJECTED";
    isFlagged?: boolean;
    deliveryStatus?: string;
    flaggedReason?: string | null;
    poll?: Poll | null;
}

interface ChatViewProps {
    conversationId: string;
    userId?: string;
    title: string;
    subtitle: string;
    messages: Message[];
    onSendMessage: (content: string) => Promise<void>;
    onVote?: (pollId: string, optionId: string) => Promise<void>;
    onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
    userId,
    title,
    subtitle,
    messages,
    onSendMessage,
    onVote,
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
            // Reset height of textarea
            const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
            if (textarea) textarea.style.height = 'auto';
        } finally {
            setIsSending(false);
        }
    };

    const renderPoll = (poll: Poll) => {
        const options: PollOption[] = JSON.parse(poll.options);
        const totalVotes = poll.responses.length;
        const userVote = poll.responses.find(r => r.userId === userId);

        return (
            <div className="mt-2 space-y-3 bg-white/50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter italic">Poll Question</h3>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{poll.question}</p>
                <div className="space-y-2 mt-2">
                    {options.map((opt) => {
                        const votes = poll.responses.filter(r => r.optionId === opt.id).length;
                        const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        const isSelected = userVote?.optionId === opt.id;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => onVote?.(poll.id, opt.id)}
                                className={cn(
                                    "w-full text-left relative overflow-hidden rounded-xl border transition-all h-10 group",
                                    isSelected
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white/30 dark:bg-zinc-900/30"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 transition-all duration-1000",
                                        isSelected ? "bg-indigo-500/20" : "bg-zinc-200/20 dark:bg-zinc-700/20"
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                                <div className="absolute inset-0 px-3 flex items-center justify-between">
                                    <span className={cn(
                                        "text-[11px] font-bold truncate pr-8",
                                        isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        {opt.text}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {isSelected && <Check className="w-3 h-3 text-indigo-500" />}
                                        <span className="text-[10px] font-black text-zinc-400">{Math.round(percent)}%</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">{totalVotes} Total Votes</p>
            </div>
        );
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
                                    msg.status === "REJECTED"
                                        ? "bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 italic"
                                        : msg.status === "FLAGGED"
                                            ? "bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100"
                                            : isMe
                                                ? "bg-indigo-500 text-white rounded-tr-sm"
                                                : "bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-100 rounded-tl-sm border border-zinc-200/50 dark:border-zinc-800/50"
                                )}>
                                    {msg.status === "FLAGGED" && (
                                        <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                {isMe ? "Sent - Flagged for Review" : "Policy Violation"}
                                            </span>
                                        </div>
                                    )}

                                    {msg.status === "REJECTED" && (
                                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                            <ShieldAlert className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Blocked</span>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {msg.type === "POLL" && msg.poll ? (
                                            renderPoll(msg.poll)
                                        ) : (
                                            <p className={cn(
                                                "text-[14px] leading-relaxed font-medium",
                                                (msg.status === "FLAGGED" && !isMe) || msg.status === "REJECTED" ? "opacity-60 italic" : ""
                                            )}>
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>

                                    {msg.status === "FLAGGED" && msg.flaggedReason && isMe && (
                                        <p className="mt-2 text-[10px] text-rose-600/80 dark:text-rose-400/80 border-t border-rose-200/50 dark:border-rose-800/50 pt-2 font-medium">
                                            AI Alert: {msg.flaggedReason}
                                        </p>
                                    )}

                                    <div className={cn(
                                        "flex items-center gap-1.5 mt-2",
                                        isMe ? "justify-end" : "justify-start"
                                    )}>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider",
                                            msg.status === "FLAGGED" ? "text-rose-500/60" : isMe ? "text-white/60" : "text-zinc-400"
                                        )}>
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                        {isMe && msg.status === "SENT" && (
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
                        id="chat-input"
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
