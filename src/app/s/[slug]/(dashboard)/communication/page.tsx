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
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSidebar } from "@/context/SidebarContext";

// Actions
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { sendBulkMessageAction, triggerFeeRemindersAction } from "@/app/actions/communication-actions";

type ViewState = "BLASTER" | "AUTOMATION";

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

    // Automation State
    const [isFeeTriggering, setIsFeeTriggering] = useState(false);

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const res = await getClassroomsAction(slug);
        if (res.success) setClasses(res.data);
        setIsLoading(false);
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
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-rose-500" />
                        Comms <span className="text-rose-500">Engine</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Unified messaging and automated workflow triggers.</p>
                </div>

                <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <button
                        onClick={() => setView("BLASTER")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            view === "BLASTER"
                                ? "bg-white dark:bg-zinc-800 text-rose-500 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        )}
                    >
                        Blast Tool
                    </button>
                    <button
                        onClick={() => setView("AUTOMATION")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            view === "AUTOMATION"
                                ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        )}
                    >
                        Automations
                    </button>
                </div>
            </div>

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
