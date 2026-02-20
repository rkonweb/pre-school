"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, ChevronLeft, Bot, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function JarvisPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params.studentId as string;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // AI SDK v6: input and handles are managed by the user
    const [input, setInput] = useState("");

    const chat = useChat({
        id: "jarvis-chat",
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { studentId },
            fetch: async (url, options) => {
                console.log("Jarvis Fetch Request:", url, options);
                try {
                    const res = await fetch(url, options);
                    console.log("Jarvis Fetch Response:", res.status, res.statusText);
                    return res;
                } catch (e) {
                    console.error("Jarvis Fetch Network Error:", e);
                    throw e;
                }
            }
        }),
        initialMessages: [
            {
                id: "welcome",
                role: "assistant",
                content: "Hi! I'm Jarvis. I can help you with updates on attendance, fees, homework, or just general questions. How can I help you today? ✨",
                parts: [{ type: 'text', text: "Hi! I'm Jarvis. I can help you with updates on attendance, fees, homework, or just general questions. How can I help you today? ✨" }]
            }
        ]
    });

    // AI SDK v6 returns sendMessage and status instead of append/handleSubmit
    const { messages, sendMessage, status, error } = chat;
    const isLoading = status === "submitted" || status === "streaming";

    useEffect(() => {
        console.log("Jarvis Chat Status:", status);
        if (messages) {
            console.log("Jarvis Messages:", messages.length, messages);
        }
        if (error) {
            console.error("Jarvis Chat Error:", error);
        }
    }, [status, messages, error]);

    // Helper to extract text from AI SDK v6 UIMessage
    const getMessageContent = (m: any) => {
        if (m.parts && Array.isArray(m.parts)) {
            const textParts = m.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text);
            if (textParts.length > 0) return textParts.join('');
        }
        return m.content || "";
    };

    // Provide a safe onChange for the input field
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting question:", input);
        if (!input.trim() || isLoading) return;

        const content = input;
        setInput("");

        if (sendMessage) {
            try {
                await sendMessage({ text: content }, { body: { studentId } });
                console.log("Message sent successfully");
            } catch (err) {
                console.error("Failed to send message:", err);
                setInput(content);
            }
        } else {
            console.error("Critical: sendMessage is missing from useChat", chat);
            setInput(content);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const suggestions = [
        "Generate Morning Briefing ☀️",
        "Any homework due?",
        "How is attendance?",
        "Fee status?"
    ];

    const handleSuggestionClick = async (suggestion: string) => {
        const text = suggestion.includes("Morning Briefing")
            ? "Generate a morning briefing for today including schedule, homework, and announcements."
            : suggestion;

        console.log("Suggestion clicked:", text);
        if (sendMessage) {
            await sendMessage({ text }, { body: { studentId } });
        } else {
            setInput(text);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="px-5 pt-6 pb-4 shrink-0 bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white cursor-pointer"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                            Jarvis Data
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                        </h2>
                        <p className="text-xs text-indigo-300 font-medium">AI School Assistant</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-5 space-y-6">
                {(messages || []).map((m: any) => (
                    <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            m.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                            m.role === "user" ? "bg-indigo-600" : "bg-emerald-600"
                        )}>
                            {m.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                        </div>

                        <div className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed",
                            m.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-sm"
                                : "bg-white/10 text-slate-200 rounded-tl-sm border border-white/5"
                        )}>
                            {getMessageContent(m)}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 max-w-[85%]"
                    >
                        <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                            <span className="text-xs text-indigo-300 font-bold">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="p-4 bg-slate-900 border-t border-white/10 shrink-0">
                {(messages || []).length <= 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleSuggestionClick(s)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-xs text-indigo-300 whitespace-nowrap transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={onSubmit} className="flex gap-2">
                    <input
                        value={input}
                        onChange={onInputChange}
                        placeholder="Ask about attendance, homework..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl w-12 flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
