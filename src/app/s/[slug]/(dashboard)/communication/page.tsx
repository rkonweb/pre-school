"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Search,
    Send,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    Megaphone,
    MessageSquare,
    Users,
    Plus,
    CheckCircle2,
    Loader2,
    History,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { sendBroadcastAction, getBroadcastHistoryAction } from "@/app/actions/notification-actions";
import { getStudentsAction } from "@/app/actions/student-actions";

// Mock Data for Direct Messages (Tab 1)
const CONVERSATIONS = [
    { id: "1", name: "Sarah Thompson", role: "Parent (Emma)", lastMsg: "Thank you for the update!", time: "10:30 AM", unread: 2, online: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: "2", name: "Mike Wilson", role: "Parent (Liam)", lastMsg: "Will there be a field trip next week?", time: "09:15 AM", unread: 0, online: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { id: "3", name: "Emily Davis", role: "Parent (Olivia)", lastMsg: "Olivia is feeling better today.", time: "Yesterday", unread: 0, online: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
    { id: "4", name: "Ms. Rebecca Miller", role: "Senior Teacher", lastMsg: "I've uploaded the lesson plan.", time: "Yesterday", unread: 0, online: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rebecca" },
];

const MOCK_MESSAGES = [
    { id: 1, text: "Hi, I wanted to check if Emma needs anything special for the art class tomorrow?", sender: "parent", time: "10:25 AM" },
    { id: 2, text: "Hello! Just her usual apron. We'll be using washable paints.", sender: "admin", time: "10:28 AM" },
    { id: 3, text: "Thank you for the update!", sender: "parent", time: "10:30 AM" },
];

export default function CommunicationPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [activeTab, setActiveTab] = useState<"messages" | "announcements">("announcements"); // Default to requested feature
    const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
    const [messageInput, setMessageInput] = useState("");

    // Broadcast State
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Broadcast Form State
    const [isComposing, setIsComposing] = useState(true);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetType, setTargetType] = useState<"ALL_PARENTS" | "CLASS" | "TEACHERS" | "STUDENTS">("ALL_PARENTS");
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    // Student Search State
    const [studentSearchTerm, setStudentSearchTerm] = useState("");
    const [studentClassFilter, setStudentClassFilter] = useState("all");
    const [studentsList, setStudentsList] = useState<any[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    useEffect(() => {
        if (slug) {
            loadInitialData();
        }
    }, [slug]);

    useEffect(() => {
        if (activeTab === "announcements") {
            loadBroadcastHistory();
        }
    }, [activeTab, slug]);

    // Debounced Student Search
    useEffect(() => {
        if (targetType === "STUDENTS") {
            const timer = setTimeout(() => {
                loadStudents();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [studentSearchTerm, studentClassFilter, targetType]);

    const loadInitialData = async () => {
        const classRes = await getClassroomsAction(slug);
        if (classRes.success) {
            setClassrooms(classRes.data || []);
        }
    };

    const loadBroadcastHistory = async () => {
        setIsLoadingHistory(true);
        const res = await getBroadcastHistoryAction(slug);
        if (res.success) {
            setBroadcasts(res.data || []);
        }
        setIsLoadingHistory(false);
    };

    const loadStudents = async () => {
        setIsLoadingStudents(true);
        const res = await getStudentsAction(slug, {
            search: studentSearchTerm,
            filters: { class: studentClassFilter },
            limit: 50 // Fetch enough to select
        });
        if (res.success) {
            setStudentsList(res.students || []);
        }
        setIsLoadingStudents(false);
    }

    const handleSendBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Please enter a title and message");
            return;
        }
        if (targetType === "CLASS" && selectedClasses.length === 0) {
            toast.error("Please select at least one class");
            return;
        }
        if (targetType === "STUDENTS" && selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        setIsSending(true);
        try {
            const res = await sendBroadcastAction(slug, {
                title,
                message,
                targetType,
                targetIds: targetType === "CLASS" ? selectedClasses : (targetType === "STUDENTS" ? selectedStudents : undefined)
            });

            if (res.success) {
                toast.success(`Broadcast sent successfully to ${res.count} recipients!`);
                setTitle("");
                setMessage("");
                setSelectedClasses([]);
                setSelectedStudents([]);
                loadBroadcastHistory();
                setIsComposing(false);
            } else {
                toast.error(res.error || "Failed to send broadcast");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSending(false);
        }
    };

    const toggleClassSelection = (classId: string) => {
        setSelectedClasses(prev =>
            prev.includes(classId)
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {/* Sidebar */}
            <div className="flex w-80 flex-col border-r border-zinc-200 dark:border-zinc-800">
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">Communication</h1>
                        {activeTab === "announcements" && !isComposing && (
                            <button
                                onClick={() => setIsComposing(true)}
                                className="p-2 rounded-lg bg-brand text-[var(--secondary-color)] hover:brightness-110 transition-colors"
                                title="New Broadcast"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <button
                            onClick={() => setActiveTab("messages")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                                activeTab === "messages" ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-500"
                            )}
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Messages
                        </button>
                        <button
                            onClick={() => setActiveTab("announcements")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all",
                                activeTab === "announcements" ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-500"
                            )}
                        >
                            <Megaphone className="h-3.5 w-3.5" />
                            Broadcast
                        </button>
                    </div>

                    {/* Search (Visual Only for now) */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder={activeTab === "messages" ? "Search chats..." : "Search broadcasts..."}
                            className="w-full rounded-lg border-0 bg-zinc-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand dark:bg-zinc-900"
                        />
                    </div>
                </div>

                {/* Sidebar Content List */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "messages" ? (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {CONVERSATIONS.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={cn(
                                        "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                                        selectedChat.id === chat.id && "bg-brand/5 dark:bg-brand/10"
                                    )}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img src={chat.avatar} alt={chat.name} className="h-10 w-10 rounded-full" />
                                        {chat.online && (
                                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-950" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold truncate">{chat.name}</p>
                                            <span className="text-[10px] text-zinc-400">{chat.time}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 truncate">{chat.lastMsg}</p>
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-[var(--secondary-color)]">
                                            {chat.unread}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">History</p>
                                <button onClick={() => loadBroadcastHistory()} className="text-zinc-400 hover:text-brand">
                                    <History className="h-3 w-3" />
                                </button>
                            </div>

                            {isLoadingHistory ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-zinc-400" /></div>
                            ) : broadcasts.length === 0 ? (
                                <div className="text-center p-4 text-xs text-zinc-400 italic">No past broadcasts found.</div>
                            ) : (
                                broadcasts.map((b) => (
                                    <div key={b.id} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => {
                                        setTitle(b.title);
                                        setMessage(b.message);
                                        setIsComposing(false); // View mode basically
                                    }}>
                                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{b.title}</p>
                                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {b.targetGroup === "ALL_PARENTS" ? "All Parents" : b.targetGroup}
                                            </span>
                                            <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-900/30">
                {activeTab === "messages" ? (
                    <>
                        {/* Start of Direct Messages UI (Keep unchanged logic mostly) */}
                        <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="flex items-center gap-3">
                                <img src={selectedChat.avatar} alt={selectedChat.name} className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold">{selectedChat.name}</p>
                                    <p className="text-[10px] text-zinc-500">{selectedChat.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><Phone className="h-5 w-5" /></button>
                                <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><Video className="h-5 w-5" /></button>
                                <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><MoreVertical className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {MOCK_MESSAGES.map((msg) => (
                                <div key={msg.id} className={cn(
                                    "flex flex-col max-w-[70%]",
                                    msg.sender === "admin" ? "ml-auto items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        msg.sender === "admin" ? "bg-brand text-[var(--secondary-color)] rounded-tr-none" : "bg-white dark:bg-zinc-800 rounded-tl-none border border-zinc-100 dark:border-zinc-700"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="mt-1 text-[10px] text-zinc-400">{msg.time}</span>
                                </div>
                            ))}
                            <div className="flex justify-center my-4">
                                <span className="bg-zinc-200 text-zinc-500 text-[10px] px-3 py-1 rounded-full dark:bg-zinc-800">Direct Messaging is currently under construction</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                            {/* Keep input but maybe disabled if functionality not ready, but User might want to see UI */}
                            <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2 dark:bg-zinc-900">
                                <button className="text-zinc-400 hover:text-zinc-600"><Smile className="h-5 w-5" /></button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-0 text-sm focus:ring-0 placeholder:text-zinc-500"
                                />
                                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[var(--secondary-color)]"><Send className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Broadcast UI */
                    <div className="flex flex-col h-full overflow-y-auto p-6">
                        {!isComposing ? (
                            <div className="flex flex-col items-center justify-center flex-1 text-center">
                                <div className="h-20 w-20 rounded-full bg-brand/10 flex items-center justify-center dark:bg-brand/20 mb-6">
                                    <Megaphone className="h-8 w-8 text-brand" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{title || "School Broadcasts"}</h2>
                                <p className="text-zinc-500 max-w-md mb-8">
                                    {message ? "This broadcast has been sent." : "Select a broadcast from the history to view details, or compose a new one to notify parents and teachers."}
                                </p>
                                {message && (
                                    <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-left shadow-sm">
                                        <p className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Message Content</p>
                                        <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{message}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setIsComposing(true);
                                        setTitle("");
                                        setMessage("");
                                        setSelectedClasses([]);
                                        setSelectedStudents([]);
                                    }}
                                    className="mt-8 px-6 py-3 bg-brand text-[var(--secondary-color)] rounded-xl font-bold shadow-lg shadow-brand/20 hover:brightness-110 transition-all flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Compose New Broadcast
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto w-full bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Megaphone className="h-5 w-5 text-brand" />
                                        Compose New Broadcast
                                    </h2>
                                    <p className="text-sm text-zinc-500 mt-1">Send important updates to your school community.</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Audience Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Target Audience</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { id: "ALL_PARENTS", label: "All Parents", icon: Users },
                                                { id: "CLASS", label: "Classes", icon: CheckCircle2 },
                                                { id: "STUDENTS", label: "Specific Student", icon: UserCircle },
                                                { id: "TEACHERS", label: "Teachers", icon: Video }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setTargetType(type.id as any)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                                                        targetType === type.id
                                                            ? "border-brand bg-brand/5 text-brand dark:bg-brand/10 dark:text-brand"
                                                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                                                    )}
                                                >
                                                    <type.icon className={cn("h-6 w-6", targetType === type.id ? "text-brand" : "text-zinc-400")} />
                                                    <span className="text-xs font-bold text-center">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Class Selection (Conditional) */}
                                    {targetType === "CLASS" && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Select Classes</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto">
                                                {classrooms.map((cls) => (
                                                    <button
                                                        key={cls.id}
                                                        onClick={() => toggleClassSelection(cls.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                                                            selectedClasses.includes(cls.id)
                                                                ? "bg-brand text-[var(--secondary-color)] shadow-sm"
                                                                : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-4 w-4 shrink-0 rounded border flex items-center justify-center",
                                                            selectedClasses.includes(cls.id) ? "border-white bg-white/20" : "border-zinc-300"
                                                        )}>
                                                            {selectedClasses.includes(cls.id) && <CheckCircle2 className="h-3 w-3" />}
                                                        </div>
                                                        <span className="truncate">{cls.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-zinc-500 text-right">{selectedClasses.length} classes selected</p>
                                        </div>
                                    )}

                                    {/* Student Selection (Conditional) */}
                                    {targetType === "STUDENTS" && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Select Students</label>
                                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 space-y-3">
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                        <input
                                                            type="text"
                                                            value={studentSearchTerm}
                                                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                                                            placeholder="Search student by name..."
                                                            className="w-full rounded-lg border-zinc-200 bg-white dark:bg-zinc-950 pl-9 py-2 text-sm focus:ring-2 focus:ring-brand"
                                                        />
                                                    </div>
                                                    <select
                                                        value={studentClassFilter}
                                                        onChange={(e) => setStudentClassFilter(e.target.value)}
                                                        className="rounded-lg border-zinc-200 bg-white dark:bg-zinc-950 text-sm py-2 px-3"
                                                    >
                                                        <option value="all">All Classes</option>
                                                        {classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="h-60 overflow-y-auto space-y-1 rounded-lg border border-zinc-100 bg-white dark:bg-zinc-950 p-2">
                                                    {isLoadingStudents ? (
                                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-zinc-400" /></div>
                                                    ) : studentsList.length === 0 ? (
                                                        <div className="p-4 text-center text-xs text-zinc-400">No students found.</div>
                                                    ) : (
                                                        studentsList.map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => toggleStudentSelection(s.id)}
                                                                className={cn(
                                                                    "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                                                    selectedStudents.includes(s.id) && "bg-brand/5 dark:bg-brand/10"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "h-4 w-4 shrink-0 rounded border flex items-center justify-center",
                                                                    selectedStudents.includes(s.id) ? "border-brand bg-brand text-[var(--secondary-color)]" : "border-zinc-300"
                                                                )}>
                                                                    {selectedStudents.includes(s.id) && <CheckCircle2 className="h-3 w-3" />}
                                                                </div>
                                                                <img src={s.avatar} className="h-8 w-8 rounded-full bg-zinc-100" />
                                                                <div className="text-left">
                                                                    <p className="font-semibold">{s.name}</p>
                                                                    <p className="text-[10px] text-zinc-400">Class: {s.class}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 text-right">{selectedStudents.length} students selected</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1 block">Subject / Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Annual Sports Day Update"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-brand focus:bg-white focus:ring-0 dark:border-zinc-800 dark:bg-zinc-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1 block">Message Body</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Type your announcement here..."
                                                rows={6}
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-brand focus:bg-white focus:ring-0 dark:border-zinc-800 dark:bg-zinc-900 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsComposing(false)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendBroadcast}
                                        disabled={isSending}
                                        className="px-8 py-2.5 rounded-xl bg-brand font-bold text-[var(--secondary-color)] shadow-lg shadow-brand/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        {isSending ? "Sending..." : "Send Broadcast"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

