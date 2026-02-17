"use server";

import React from "react";
import { ChatList } from "@/components/mobile/ChatList";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { getParentConversationsAction } from "@/app/actions/parent-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";

export default async function ParentChatPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ preview?: string }>;
}) {
    const { slug } = await params;
    const { preview } = await searchParams;

    // 1. Auth & Context
    const userRes = await getCurrentUserAction();
    const phone = (preview === "true") ? "9999999999" : (userRes.data?.mobile || "");

    if (preview !== "true" && (!userRes.success || !userRes.data)) {
        redirect("/parent-login");
    }

    // 2. Fetch Conversations
    const convRes = await getParentConversationsAction(phone);
    const conversations = convRes.success ? convRes.conversations : [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto relative shadow-2xl overflow-x-hidden font-sans">

            {/* Dynamic Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm relative z-30">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={`/${slug}/parent/mobile/dashboard${preview === "true" ? "?preview=true" : ""}`}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6 text-summer-navy" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-summer-navy tracking-tight">MESSAGES</h1>
                        <div className="flex items-center gap-1 justify-center">
                            <div className="w-2 h-2 rounded-full bg-summer-teal animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Connect</span>
                        </div>
                    </div>
                    <div className="w-10 h-10" /> {/* Spacer */}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="bg-gray-50 rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-100 focus-within:bg-white focus-within:border-summer-teal/20 transition-all">
                        <Search className="w-5 h-5 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-summer-navy placeholder:text-gray-300"
                        />
                    </div>
                </div>
            </div>

            {/* Chat List Area */}
            <div className="pt-8">
                <ChatList conversations={conversations as any} slug={slug} />
            </div>

            {/* Unified Bottom Nav */}
            <MobileBottomNav slug={slug} activeTab="CHAT" preview={preview === "true"} />
        </div>
    );
}

function MessageSquareIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
