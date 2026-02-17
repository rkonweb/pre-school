"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    ChevronRight,
    User,
    CreditCard,
    Clock
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Conversation {
    id: string;
    title: string;
    type: "TEACHER" | "ACCOUNTS" | "ADMIN";
    studentId: string;
    studentName: string;
    lastMessage: string | null;
    lastMessageTime: string | Date | null;
    unreadCount: number;
    avatar?: string;
}

interface ChatListProps {
    conversations: Conversation[];
    slug: string;
}

export const ChatList: React.FC<ChatListProps> = ({ conversations, slug }) => {
    return (
        <div className="space-y-4 px-6 pb-32">
            {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Messages Yet</h3>
                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto mt-2">
                        Start a conversation with your child's teacher or the school office.
                    </p>
                </div>
            ) : (
                conversations.map((conv, idx) => (
                    <Link
                        key={conv.id}
                        href={`/${slug}/parent/mobile/chat/${conv.id}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden group"
                        >
                            {/* Unread Accent */}
                            {conv.unreadCount > 0 && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-summer-teal" />
                            )}

                            {/* Avatar/Icon Container */}
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center relative shrink-0",
                                conv.type === 'TEACHER' ? "bg-teal-50 text-teal-600" :
                                    conv.type === 'ACCOUNTS' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {conv.type === 'TEACHER' ? <User className="w-7 h-7" /> :
                                    conv.type === 'ACCOUNTS' ? <CreditCard className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}

                                {conv.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-slate-800 text-[15px] truncate pr-4">
                                        {conv.title}
                                    </h4>
                                    {conv.lastMessageTime && (
                                        <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap pt-0.5">
                                            {format(new Date(conv.lastMessageTime), "h:mm a")}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded-md">
                                        {conv.studentName}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-sm truncate",
                                    conv.unreadCount > 0 ? "text-slate-900 font-bold" : "text-slate-400 font-medium"
                                )}>
                                    {conv.lastMessage || "No messages yet. Tap to start."}
                                </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                        </motion.div>
                    </Link>
                ))
            )}
        </div>
    );
};
