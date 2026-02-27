"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, Send, User, ChevronLeft, MoreVertical, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getMessagesAction, sendMessageAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useParentData } from "@/context/parent-context";
import { PageWrapper, StickyHeader } from "@/components/ui-theme";

export default function MessagesPage() {
    // Context Consumer
    const {
        conversations: contextConversations,
        school,
        isLoading: isContextLoading
    } = useParentData();

    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Local State
    // Initialize conversations from context, but keep local state for updates (read status, optimistic sends)
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const checkPhone = searchParams.get("phone");
    const slug = params.slug as string;

    // Sync context to local state initially or when context updates
    useEffect(() => {
        if (contextConversations) {
            setConversations(contextConversations);
        }
    }, [contextConversations]);

    // Fetch messages when chat selected
    useEffect(() => {
        if (selectedChatId) {
            loadMessages(selectedChatId);
        } else {
            setMessages([]);
        }
    }, [selectedChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async (id: string) => {
        setIsLoadingMessages(true);
        const res = await getMessagesAction(id);
        if (res.success) {
            setMessages(res.messages);
            // Update unread count locally
            setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
        } else {
            toast.error("Failed to load conversation");
        }
        setIsLoadingMessages(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedChatId) return;

        setIsSending(true);

        // Optimistic update
        const tempId = "temp-" + Date.now();
        const newMessage = {
            id: tempId,
            content: messageInput,
            senderType: "PARENT",
            createdAt: new Date(),
            isRead: false
        };
        setMessages(prev => [...prev, newMessage]);
        setMessageInput("");

        const res = await sendMessageAction(selectedChatId, newMessage.content, "Parent", checkPhone || "unknown");

        if (res.success) {
            // Replace temp message
            setMessages(prev => prev.map(m => m.id === tempId ? res.message : m));
            setConversations(prev => prev.map(c => c.id === selectedChatId ? {
                ...c,
                lastMessage: res.message.content,
                lastMessageTime: res.message.createdAt
            } : c));
        } else {
            toast.error("Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove failed
        }
        setIsSending(false);
    };

    const brandColor = school?.brandColor || "#2563eb";
    const selectedChat = conversations.find(c => c.id === selectedChatId);

    if (isContextLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <PageWrapper className="pb-0 sm:pb-0 h-screen overflow-hidden flex flex-col">
            {/* Page Header */}
            <StickyHeader
                title="School Chat"
                subtitle="Parent-Teacher Communication"
                className="shrink-0"
                showBell={true}
            />

            {/* Chat Interface Card */}
            <main className="px-5 flex-1 flex flex-col pb-6 min-h-0 relative z-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-1 bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-white/60 overflow-hidden relative"
                >
                    {/* Chat List Sidebar */}
                    <div className={`
                    flex flex-col w-full md:w-96 border-r border-white/40 bg-white/40
                    ${selectedChatId ? 'hidden md:flex' : 'flex'}
                `}>
                        {/* Sidebar Header */}
                        <header className="px-6 py-6 border-b border-white/40 flex-shrink-0">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600/30 placeholder:text-zinc-400 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </header>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="text-center p-8 text-zinc-400 text-sm">No conversations found.</div>
                            ) : (
                                conversations.map((chat) => (
                                    <motion.div
                                        key={chat.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setSelectedChatId(chat.id)}
                                        className={`
                                        relative flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all border mx-2 mb-2
                                        ${selectedChatId === chat.id ? 'bg-white shadow-lg shadow-zinc-200/40 border-white/60' : 'bg-transparent border-transparent hover:bg-white/50'}
                                    `}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-zinc-50 flex items-center justify-center">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.title}`}
                                                    alt={chat.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            {chat.unreadCount > 0 && (
                                                <div
                                                    className="absolute -top-1 -right-1 h-5 w-5 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse"
                                                    style={{ backgroundColor: brandColor }}
                                                >
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-sm font-black truncate ${chat.unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-800'}`}>
                                                    {chat.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                    {chat.lastMessageTime ? formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: false }).replace('about ', '').replace(' hours', 'h') : ''}
                                                </span>
                                            </div>
                                            <p className={`text-[13px] truncate ${chat.unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-500 font-medium'}`}>
                                                {chat.lastMessage || "Start a conversation"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`
                    flex-1 flex flex-col bg-slate-50/20 relative
                    ${!selectedChatId ? 'hidden md:flex' : 'flex'}
                `}>
                        {!selectedChatId ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                                <div className="relative h-24 w-24">
                                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20" />
                                    <div className="relative h-full w-full bg-white rounded-full flex items-center justify-center shadow-xl border border-white">
                                        <MessageCircle className="h-10 w-10 text-indigo-500" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Your Messages</h3>
                                    <p className="text-zinc-500 font-bold max-w-xs mx-auto">Select a conversation from the sidebar to chat.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <header className="bg-white/60 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/60 shadow-sm z-10 sticky top-0">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedChatId(null)}
                                            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-white border border-transparent hover:border-zinc-200 transition-all shadow-sm hover:shadow-md"
                                            title="Back to chat list"
                                            aria-label="Back to chat list"
                                        >
                                            <ArrowLeft className="h-5 w-5 text-zinc-700" />
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-zinc-50 flex items-center justify-center">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat?.title}`}
                                                    alt={selectedChat?.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-zinc-900 tracking-tight">{selectedChat?.title}</h3>
                                                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{selectedChat?.studentName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
                                            <p className="text-sm">No messages yet.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = msg.senderType === "PARENT";
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    key={msg.id || idx}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`
                                                    max-w-[85%] px-5 py-3.5 rounded-[1.5rem] text-[14px] font-semibold leading-relaxed shadow-md
                                                    ${isMe ? 'bg-indigo-600 text-white shadow-indigo-600/20 rounded-br-sm border border-indigo-500' : 'bg-white/90 backdrop-blur-sm border border-white text-zinc-800 rounded-bl-sm shadow-zinc-200/50'}
                                                `}>
                                                        {msg.content}
                                                        <div className={`text-[9px] mt-1.5 text-right font-black uppercase tracking-widest ${isMe ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-md border-t border-white/60 mb-[env(safe-area-inset-bottom)] z-10 sticky bottom-0">
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-zinc-200/60 focus-within:ring-4 focus-within:ring-indigo-600/10 focus-within:border-indigo-600/30 transition-all shadow-lg shadow-zinc-200/40"
                                    >
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-transparent border-none px-5 py-3 text-sm font-bold text-zinc-700 focus:ring-0 placeholder:text-zinc-400 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim() || isSending}
                                            className="h-12 w-12 flex items-center justify-center rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md shrink-0"
                                            style={{ backgroundColor: brandColor }}
                                            title="Send Message"
                                            aria-label="Send Message"
                                        >
                                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </PageWrapper>
    );
}
