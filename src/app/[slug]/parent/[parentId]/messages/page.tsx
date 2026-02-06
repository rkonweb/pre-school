"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, Send, User, ChevronLeft, MoreVertical, Loader2, ArrowLeft } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getMessagesAction, sendMessageAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useParentData } from "@/context/parent-context";

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
        <div className="px-4 py-8 sm:px-6 sm:py-12 max-w-6xl mx-auto min-h-screen space-y-8">
            {/* Page Header */}
            <section>
                <div
                    className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                    Communication
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mt-4 leading-[0.9]">
                    School <span className="text-zinc-300">Chat</span>
                </h1>
            </section>

            {/* Chat Interface Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-[75vh] sm:h-[700px] bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
            >
                {/* Chat List Sidebar */}
                <div className={`
                    flex flex-col w-full md:w-96 border-r border-zinc-50 bg-white
                    ${selectedChatId ? 'hidden md:flex' : 'flex'}
                `}>
                    {/* Sidebar Header */}
                    <header className="px-6 py-5 border-b border-zinc-50 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-0 placeholder:text-zinc-400 outline-none transition-all"
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
                                    whileHover={{ x: 4 }}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`
                                        relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                                        ${selectedChatId === chat.id ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-transparent hover:bg-zinc-50/50'}
                                    `}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full overflow-hidden border border-zinc-100 bg-zinc-50">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.title}`}
                                                alt={chat.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <div
                                                className="absolute -top-1 -right-1 h-4 w-4 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center"
                                                style={{ backgroundColor: brandColor }}
                                            >
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={`text-sm font-bold truncate ${chat.unreadCount > 0 ? 'text-zinc-900' : 'text-zinc-700'}`}>
                                                {chat.title}
                                            </h4>
                                            <span className="text-[10px] font-semibold text-zinc-400">
                                                {chat.lastMessageTime ? formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: false }).replace('about ', '').replace(' hours', 'h') : ''}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-400 font-medium'}`}>
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
                    flex-1 flex flex-col bg-zinc-50/30
                    ${!selectedChatId ? 'hidden md:flex' : 'flex'}
                `}>
                    {!selectedChatId ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                            <div className="h-20 w-20 bg-zinc-100 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-10 w-10 text-zinc-300" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900">No chat selected</h3>
                            <p className="text-zinc-400 max-w-xs text-sm">Select a conversation from the sidebar to start messaging.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-zinc-100 shadow-sm z-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedChatId(null)}
                                        className="md:hidden h-8 w-8 flex items-center justify-center -ml-2 rounded-full hover:bg-zinc-50"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden border border-zinc-100">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat?.title}`}
                                                alt={selectedChat?.title}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-zinc-900">{selectedChat?.title}</h3>
                                            <p className="text-xs text-zinc-500 font-medium">{selectedChat?.studentName}</p>
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
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={msg.id || idx}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`
                                                    max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm
                                                    ${isMe ? 'bg-blue-600 text-white hover:bg-blue-700 rounded-tr-sm' : 'bg-white border border-zinc-100 text-zinc-700 rounded-tl-sm'}
                                                `}>
                                                    {msg.content}
                                                    <div className={`text-[9px] mt-1 text-right font-bold ${isMe ? 'text-zinc-500' : 'text-zinc-300'}`}>
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
                            <div className="p-4 bg-white border-t border-zinc-100">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-2 bg-zinc-50 p-2 rounded-[1.5rem] border border-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-300 transition-all shadow-sm"
                                >
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-medium focus:ring-0 placeholder:text-zinc-400 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim() || isSending}
                                        className="h-10 w-10 flex items-center justify-center rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
