"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChatHistoryAction } from "@/app/actions/communication-actions";
import {
    MessageSquare,
    Search,
    Filter,
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    ShieldAlert,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminChatHistoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
    const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(true), 5000); // 5 sec realtime polling
        return () => clearInterval(interval);
    }, [slug]);

    async function loadData(silent = false) {
        if (!silent) setIsLoading(true);
        const res = await getChatHistoryAction(slug);
        if (res.success && res.data) {
            setConversations(res.data);
            setSelectedConvoId(prev => {
                if (!prev && res.data.length > 0) return res.data[0].id;
                return prev;
            });
        }
        if (!silent) setIsLoading(false);
    }

    const filteredConvos = conversations.filter(c => {
        const studentName = `${c.student.firstName} ${c.student.lastName}`.toLowerCase();
        const matchesSearch = studentName.includes(searchTerm.toLowerCase());

        // Has any flagged messages?
        const hasFlagged = c.messages.some((m: any) => m.isFlagged);
        const matchesFlagged = showOnlyFlagged ? hasFlagged : true;

        return matchesSearch && matchesFlagged;
    });

    const activeConvo = conversations.find(c => c.id === selectedConvoId);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between shrink-0">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-rose-500" />
                        Chat <span className="text-rose-500">Oversight</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Monitor Parent-Teacher communications & policy violations.</p>
                </div>

                {/* Global Stats */}
                <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 p-2 rounded-2xl backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 gap-4">
                    <div className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700/50 text-center">
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Chats</p>
                        <p className="text-xl font-bold mt-1">{conversations.length}</p>
                    </div>
                    <div className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl shadow-sm border border-rose-100 dark:border-rose-500/20 text-center">
                        <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Flagged msgs</p>
                        <p className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                            {conversations.reduce((acc, c) => acc + c.messages.filter((m: any) => m.isFlagged).length, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex overflow-hidden min-h-0">

                {/* Left Sidebar - Convo List */}
                <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
                            className={cn(
                                "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border",
                                showOnlyFlagged
                                    ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                                    : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900"
                            )}
                        >
                            <AlertTriangle className="h-3 w-3" />
                            {showOnlyFlagged ? "Showing Flagged Only" : "Filter Flagged"}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-zinc-400 animate-pulse text-sm font-medium">Scanning network...</div>
                        ) : filteredConvos.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 text-sm font-medium">No conversations found.</div>
                        ) : (
                            filteredConvos.map((convo) => {
                                const hasFlagged = convo.messages.some((m: any) => m.isFlagged);
                                const isActive = selectedConvoId === convo.id;

                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => setSelectedConvoId(convo.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all border",
                                            isActive
                                                ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                                                {convo.student.firstName} {convo.student.lastName}
                                            </p>
                                            <span className="text-[10px] text-zinc-400 whitespace-nowrap mt-0.5">
                                                {format(new Date(convo.lastMessageAt), 'MMM d')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-zinc-500 font-medium truncate pr-4">
                                                {convo.messages.length} messages
                                            </p>
                                            {hasFlagged && (
                                                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                                    <AlertTriangle className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Area - Chat Transcript */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
                    {activeConvo ? (
                        <>
                            {/* Transcript Header */}
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                        Transcript: {activeConvo.student.firstName} {activeConvo.student.lastName}
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-1 font-mono">Admission # {activeConvo.student.admissionNumber}</p>
                                </div>

                                {/* Show Parents and Teachers Name block */}
                                <div className="hidden lg:flex gap-6 items-center">
                                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                                            {activeConvo.messages.find((m: any) => m.senderType === "PARENT")?.senderName?.charAt(0) || "P"}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Parent</p>
                                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100">
                                                {activeConvo.messages.find((m: any) => m.senderType === "PARENT")?.senderName || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-500/20">
                                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                                            {activeConvo.messages.find((m: any) => m.senderType === "STAFF" || m.senderType === "TEACHER")?.senderName?.charAt(0) || "T"}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Teacher</p>
                                            <p className="text-xs font-bold text-teal-900 dark:text-teal-100">
                                                {activeConvo.messages.find((m: any) => m.senderType === "STAFF" || m.senderType === "TEACHER")?.senderName || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right ml-4">
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">Category</p>
                                    <p className="text-sm font-bold mt-0.5 text-zinc-700 dark:text-zinc-300">{activeConvo.type}</p>
                                </div>
                            </div>

                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {activeConvo.messages.map((msg: any) => {
                                    const isFlagged = msg.isFlagged;
                                    const isParent = msg.senderType === "PARENT";

                                    return (
                                        <div key={msg.id} className={cn(
                                            "flex flex-col gap-1 w-full max-w-[85%]", // Make messages slightly wider for admin view
                                            isParent ? "items-start" : "items-end ml-auto"
                                        )}>
                                            <div className="flex items-center gap-2 px-1">
                                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                                    {isParent ? "Parent" : "Teacher"} • {msg.senderName}
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    {format(new Date(msg.createdAt), 'hh:mm a')}
                                                </span>
                                            </div>

                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm relative group",
                                                isFlagged
                                                    ? "bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100" // Flagged styling
                                                    : isParent
                                                        ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                                                        : "bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-900 dark:text-blue-100 rounded-tr-sm"
                                            )}>
                                                {isFlagged && (
                                                    <div className="absolute -top-3 -right-3 bg-rose-500 text-white p-1 rounded-full shadow-lg shadow-rose-500/30">
                                                        <XCircle className="h-4 w-4" />
                                                    </div>
                                                )}

                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                                                {/* Flagged Reason Banner */}
                                                {isFlagged && (
                                                    <div className="mt-3 pt-3 border-t border-rose-200/50 dark:border-rose-500/30">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            System Intercept: {msg.flaggedReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4">
                            <MessageSquare className="h-16 w-16 opacity-20" />
                            <p className="font-medium">Select a conversation to view the transcript</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
