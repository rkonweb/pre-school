"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    MessageSquare,
    Send,
    Users,
    Clock,
    Zap,
    AlertCircle,
    BellRing,
    Calendar,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";

// Actions
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import {
    sendBulkMessageAction,
    triggerFeeRemindersAction,
    getPendingBroadcastsAction,
    updateBroadcastStatusAction
} from "@/app/actions/communication-actions";
import {
    getFlaggedMessagesAction,
    updateMessageModerationStatusAction
} from "@/app/actions/moderation-actions";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/erp-ui";

type ViewState = "BLASTER" | "AUTOMATION" | "BROADCASTS" | "MODERATION";

export default function CommunicationPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [view, setView] = useState<ViewState>("BLASTER");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Blaster State
    const [classes, setClasses] = useState<any[]>([]);
    const [audience, setAudience] = useState("EVERYONE");
    const [messageTitle, setMessageTitle] = useState("");
    const [messageBody, setMessageBody] = useState("");

    // Broadcasts State
    const [pendingBroadcasts, setPendingBroadcasts] = useState<any[]>([]);
    const [isActioning, setIsActioning] = useState<string | null>(null);

    // Moderation State
    const [flaggedMessages, setFlaggedMessages] = useState<any[]>([]);
    const [isModerating, setIsModerating] = useState<string | null>(null);

    // Automation State
    const [isFeeTriggering, setIsFeeTriggering] = useState(false);

    useEffect(() => {
        loadData();
    }, [slug]);

    useEffect(() => {
        if (view === "BROADCASTS") {
            loadPendingBroadcasts();
        }
        if (view === "MODERATION") {
            loadFlaggedMessages();
        }
    }, [view]);

    async function loadData() {
        setIsLoading(true);
        const res = await getClassroomsAction(slug);
        if (res.success) setClasses(res.data || []);
        setIsLoading(false);
    }

    async function loadPendingBroadcasts() {
        const res = await getPendingBroadcastsAction(slug);
        if (res.success) {
            setPendingBroadcasts(res.broadcasts || []);
        }
    }

    async function loadFlaggedMessages() {
        const res = await getFlaggedMessagesAction(slug);
        if (res.success) {
            setFlaggedMessages(res.messages || []);
        }
    }

    async function handleUpdateBroadcast(id: string, status: "APPROVED" | "REJECTED") {
        setIsActioning(id);
        const res = await updateBroadcastStatusAction(slug, id, status);
        if (res.success) {
            toast.success(`Broadcast ${status.toLowerCase()} successfully`);
            loadPendingBroadcasts();
        } else {
            toast.error(res.error || `Failed to ${status.toLowerCase()} broadcast`);
        }
        setIsActioning(null);
    }

    async function handleModerationAction(messageId: string, status: "SENT" | "REJECTED") {
        setIsModerating(messageId);
        const res = await updateMessageModerationStatusAction(slug, messageId, status);
        if (res.success) {
            toast.success(`Message ${status === "SENT" ? "approved" : "rejected"} successfully`);
            loadFlaggedMessages();
        } else {
            toast.error(res.error || "Failed to update moderation status");
        }
        setIsModerating(null);
    }

    async function handleSendBlast() {
        if (!messageTitle || !messageBody) {
            toast.error("Please provide a subject and message body");
            return;
        }

        setIsSending(true);
        const audienceVal = audience === "EVERYONE" ? "EVERYONE" : audience;
        const res = await sendBulkMessageAction(slug, audienceVal, messageTitle, messageBody);
        if (res.success) {
            toast.success(`Blast successful! Delivered to ${res.count} recipients.`);
            setMessageTitle("");
            setMessageBody("");
        } else {
            toast.error(res.error || "Failed to send blast");
        }
        setIsSending(false);
    }

    async function handleTriggerFeeReminders() {
        setIsFeeTriggering(true);
        const res = await triggerFeeRemindersAction(slug);
        if (res.success) {
            toast.success(`Automation Executed: ${res.count} fee reminders dispatched.`);
        } else {
            toast.error(res.error || "Failed to trigger automation");
        }
        setIsFeeTriggering(false);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Comms Engine"
                subtitle="Unified messaging and automated workflow triggers."
                icon={MessageSquare}
                action={
                    <div style={{ display: "flex", alignItems: "center", background: "#F5F5F7", padding: 4, borderRadius: 16, border: "1.5px solid #E5E7EB", gap: 2, overflowX: "auto" }}>
                        {(["BLASTER", "BROADCASTS", "MODERATION", "AUTOMATION"] as const).map((v, i) => (
                            <button key={v} onClick={() => setView(v)}
                                style={{ padding: "8px 16px", borderRadius: 12, border: "none", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", background: view === v ? "white" : "transparent", color: view === v ? "#EF4444" : "#6B7280", boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none", position: "relative", whiteSpace: "nowrap" }}>
                                {v === "BLASTER" ? "Blast Tool" : v === "BROADCASTS" ? "Broadcasts" : v === "MODERATION" ? "Moderation" : "Automations"}
                                {v === "BROADCASTS" && pendingBroadcasts.length > 0 && (
                                    <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: "#EF4444", borderRadius: "50%", fontSize: 8, color: "white", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{pendingBroadcasts.length}</span>
                                )}
                                {v === "MODERATION" && flaggedMessages.length > 0 && (
                                    <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: "#F97316", borderRadius: "50%", fontSize: 8, color: "white", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{flaggedMessages.length}</span>
                                )}
                            </button>
                        ))}
                        <div style={{ width: 1, height: 20, background: "#E5E7EB", margin: "0 4px" }} />
                        <Link href={`/s/${slug}/communication/chat-history`}
                            style={{ padding: "8px 14px", borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6B7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                            <ShieldAlert style={{ width: 14, height: 14 }} /> Chat History
                        </Link>
                    </div>
                }
            />

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Pane */}
                <div className="lg:col-span-2 space-y-8">
                    {view === "BLASTER" ? (
                        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 relative">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Send className="h-64 w-64 text-rose-500" />
                            </div>

                            <div className="p-10 relative z-10">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                    Compose <span className="text-rose-500">Blast</span>
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Target Audience</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                            <select
                                                title="Filter by category"
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors appearance-none"
                                            >
                                                <option value="EVERYONE">Entire School (Parents, Staff, Students)</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>Class {c.name} Only</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Subject Header</label>
                                        <input
                                            type="text"
                                            value={messageTitle}
                                            onChange={(e) => setMessageTitle(e.target.value)}
                                            placeholder="E.g., Unexpected Holiday Declaration"
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Payload Body</label>
                                        <textarea
                                            value={messageBody}
                                            onChange={(e) => setMessageBody(e.target.value)}
                                            placeholder="Enter your message here..."
                                            rows={6}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendBlast}
                                        disabled={isSending || !messageTitle || !messageBody}
                                        className="w-full bg-rose-500 hover:bg-rose-400 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        <Send className="h-5 w-5" />
                                        {isSending ? "Transmitting..." : "Engage Protocol"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : view === "BROADCASTS" ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                                Review <span className="text-rose-500">Queue</span>
                            </h2>
                            {pendingBroadcasts.length === 0 ? (
                                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">📭</div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic">Inbox Empty</h3>
                                    <p className="text-zinc-500 text-sm mt-2 max-w-xs">There are no pending broadcasts requiring administrative attention at this time.</p>
                                </div>
                            ) : (
                                pendingBroadcasts.map((bc) => (
                                    <div key={bc.id} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm group hover:border-rose-200 dark:hover:border-rose-900 transition-all">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 font-bold uppercase overflow-hidden">
                                                        {bc.author?.avatar ? (
                                                            <img src={bc.author.avatar} alt="Author" className="w-full h-full object-cover" />
                                                        ) : (
                                                            bc.author?.firstName?.[0] || 'S'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase italic tracking-tighter">
                                                            {bc.author?.firstName} {bc.author?.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                            Teacher • {format(new Date(bc.createdAt), "MMM d, h:mm a")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                                    <h4 className="text-md font-bold text-zinc-800 dark:text-zinc-100 mb-2 italic">"{bc.title}"</h4>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{bc.content}</p>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-3 justify-center md:border-l border-zinc-100 dark:border-zinc-800 md:pl-8">
                                                <button
                                                    onClick={() => handleUpdateBroadcast(bc.id, "APPROVED")}
                                                    disabled={isActioning === bc.id}
                                                    className="flex-1 md:flex-none h-14 w-full md:w-32 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateBroadcast(bc.id, "REJECTED")}
                                                    disabled={isActioning === bc.id}
                                                    className="flex-1 md:flex-none h-14 w-full md:w-32 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all active:scale-95"
                                                >
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : view === "MODERATION" ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                                Moderation <span className="text-brand">Queue</span>
                            </h2>
                            {flaggedMessages.length === 0 ? (
                                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">✅</div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic">All Clean</h3>
                                    <p className="text-zinc-500 text-sm mt-2 max-w-xs">There are no flagged messages requiring review.</p>
                                </div>
                            ) : (
                                flaggedMessages.map((msg) => (
                                    <div key={msg.id} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm group hover:border-orange-200 dark:hover:border-orange-900 transition-all">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold uppercase overflow-hidden">
                                                            {msg.senderName?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase italic tracking-tighter">
                                                                {msg.senderName} ({msg.senderType})
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                                To: {msg.conversation?.student?.firstName} • {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand/80 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        AI Flagged
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                                    <p className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed font-bold mb-3 italic">
                                                        "{msg.content}"
                                                    </p>
                                                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                                        <p className="text-[10px] text-brand/80 dark:text-brand/60 font-black uppercase tracking-widest mb-1">AI Reasoning:</p>
                                                        <p className="text-xs text-zinc-500 font-medium">{msg.flaggedReason || "No reasoning provided."}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col gap-3 justify-center md:border-l border-zinc-100 dark:border-zinc-800 md:pl-8">
                                                <button
                                                    onClick={() => handleModerationAction(msg.id, "SENT")}
                                                    disabled={isModerating === msg.id}
                                                    className="flex-1 md:flex-none h-14 w-full md:w-32 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                                >
                                                    Release
                                                </button>
                                                <button
                                                    onClick={() => handleModerationAction(msg.id, "REJECTED")}
                                                    disabled={isModerating === msg.id}
                                                    className="flex-1 md:flex-none h-14 w-full md:w-32 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all active:scale-95"
                                                >
                                                    Block
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            {/* Automation Card 1 */}
                            <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row gap-6 justify-between items-center group hover:border-indigo-200 transition-colors shadow-sm">
                                <div className="flex gap-6 items-center">
                                    <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                        <BellRing className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight italic">Fee Reminder Bot</h3>
                                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">Active Cron</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium">Scans for unpaid invoices due in ≤ 3 days and dispatches alerts to parents.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                                    <button
                                        onClick={handleTriggerFeeReminders}
                                        disabled={isFeeTriggering}
                                        className="w-full md:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Zap className="h-3 w-3" />
                                        {isFeeTriggering ? "Scanning..." : "Force Run Now"}
                                    </button>
                                </div>
                            </div>

                            {/* Automation Card 2 (Placeholder) */}
                            <div className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 flex flex-col md:flex-row gap-6 justify-between items-center opacity-70">
                                <div className="flex gap-6 items-center">
                                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                                        <Calendar className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-zinc-500 tracking-tight italic">Attendance Summarizer</h3>
                                            <span className="bg-zinc-200 text-zinc-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">In Development</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium">Weekly digest of student attendance patterns and deviation flags.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Info Pane */}
                <div className="space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-500/10">
                        <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> System Readiness
                        </h3>
                        <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80 font-medium mb-6 leading-relaxed">
                            The communication engine is online and connected to the Push Notification gateway. Messages sent here will instantly route to connected Web Push clients.
                        </p>
                        <div className="space-y-3 pt-6 border-t border-emerald-100 dark:border-emerald-500/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-emerald-700 dark:text-emerald-500">Gateway Status</span>
                                <span className="font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black uppercase">Active</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-emerald-700 dark:text-emerald-500">Latency</span>
                                <span className="font-mono text-emerald-900 dark:text-emerald-300">~42ms</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Recent Activity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5" />
                                <div>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">System Initialization Sync</p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Today, 04:22 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                                <div>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Bot Check: Fee Cron</p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Yesterday, 11:59 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
