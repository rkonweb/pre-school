"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Bell,
    Search,
    ChevronRight,
    User,
    CreditCard,
    Megaphone
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChatList } from "./ChatList";
import { getApprovedBroadcastsAction } from "@/app/actions/parent-actions";

interface ParentChatViewProps {
    initialConversations: any[];
    slug: string;
    phone: string;
}

export const ParentChatView: React.FC<ParentChatViewProps> = ({
    initialConversations,
    slug,
    phone
}) => {
    const [activeTab, setActiveTab] = useState<"MESSAGES" | "BROADCASTS">("MESSAGES");
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadBroadcasts();
        const interval = setInterval(loadBroadcasts, 10000); // Poll broadcasts every 10s
        return () => clearInterval(interval);
    }, []);

    async function loadBroadcasts() {
        const res = await getApprovedBroadcastsAction(slug);
        if (res.success) {
            setBroadcasts(res.broadcasts);
        }
    }

    const filteredConversations = initialConversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBroadcasts = broadcasts.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header / Tabs */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm relative z-30">
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 p-1 rounded-2xl flex w-full max-w-[280px]">
                        <button
                            onClick={() => setActiveTab("MESSAGES")}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all px-4",
                                activeTab === "MESSAGES" ? "bg-white text-summer-navy shadow-sm" : "text-gray-400"
                            )}
                        >
                            Messages
                        </button>
                        <button
                            onClick={() => setActiveTab("BROADCASTS")}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all px-4 relative",
                                activeTab === "BROADCASTS" ? "bg-white text-summer-navy shadow-sm" : "text-gray-400"
                            )}
                        >
                            Broadcasts
                            {broadcasts.length > 0 && activeTab !== "BROADCASTS" && (
                                <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-lg font-black text-summer-navy tracking-tight uppercase italic underline decoration-summer-teal decoration-4 underline-offset-4">
                        {activeTab === "MESSAGES" ? "Direct Line" : "School Bulletins"}
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="bg-gray-50 rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-100 focus-within:bg-white focus-within:border-summer-teal/20 transition-all">
                        <Search className="w-5 h-5 text-gray-300" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-summer-navy placeholder:text-gray-300"
                        />
                    </div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 pt-8 overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === "MESSAGES" ? (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChatList conversations={filteredConversations} slug={slug} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="broadcasts"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 space-y-4 pb-32"
                        >
                            {filteredBroadcasts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Megaphone className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">No Bulletins</h3>
                                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto mt-2">
                                        School-wide announcements will appear here.
                                    </p>
                                </div>
                            ) : (
                                filteredBroadcasts.map((bc, idx) => (
                                    <div
                                        key={bc.id}
                                        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                            <Megaphone className="w-24 h-24 text-summer-teal" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-summer-teal/10 flex items-center justify-center text-summer-teal font-black text-xs">
                                                {bc.author?.avatar ? (
                                                    <img src={bc.author.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    bc.author?.firstName?.[0] || "S"
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-summer-navy uppercase tracking-tighter">
                                                    {bc.author?.firstName} {bc.author?.lastName}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {format(new Date(bc.createdAt), "MMM d, h:mm a")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                            <h4 className="text-md font-black text-summer-navy italic leading-snug">
                                                {bc.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                                {bc.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
