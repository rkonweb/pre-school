"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatView } from "@/components/mobile/ChatView";
import { getMessagesAction, sendMessageAction } from "@/app/actions/parent-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const conversationId = params.conversationId as string;
    const preview = searchParams.get("preview");

    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [title, setTitle] = useState("Conversation");
    const [subtitle, setSubtitle] = useState("Direct Message");

    useEffect(() => {
        loadUser();
        loadMessages();
        // Poll for new messages every 10 seconds (Simple "live" effect without WebSockets)
        const interval = setInterval(loadMessages, 10000);
        return () => clearInterval(interval);
    }, [conversationId]);

    async function loadUser() {
        if (preview === "true") {
            setUser({ firstName: "Demo", lastName: "Parent", id: "demo-parent-id" });
            return;
        }
        const res = await getCurrentUserAction();
        if (res.success) {
            setUser(res.data);
        }
    }

    async function loadMessages() {
        const res = await getMessagesAction(conversationId);
        if (res.success) {
            setMessages(res.messages || []);
        }
        setIsLoading(false);
    }

    const handleSend = async (content: string) => {
        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticMsg = {
            id: tempId,
            content,
            senderType: "PARENT",
            senderName: "You",
            createdAt: new Date(),
            isRead: false
        };

        setMessages(prev => [...prev, optimisticMsg]);

        const res = await sendMessageAction(
            conversationId,
            content,
            user ? `${user.firstName} ${user.lastName || ""}` : "Parent",
            user?.id || "parent-id"
        );

        if (!res.success) {
            toast.error("Failed to send message");
            // Rollback optimistic update
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else {
            // Replace optimistic message with actual data
            setMessages(prev => prev.map(m => m.id === tempId ? res.message : m));
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-summer-teal/10 border-t-summer-teal rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-summer-teal rounded-full animate-pulse" />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entering Chat...</span>
                </div>
            </div>
        );
    }

    return (
        <ChatView
            conversationId={conversationId}
            title={title}
            subtitle={subtitle}
            messages={messages}
            onSendMessage={handleSend}
            onBack={() => router.push(`/${slug}/parent/mobile/chat${preview === "true" ? "?preview=true" : ""}`)}
        />
    );
}
