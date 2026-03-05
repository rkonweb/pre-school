"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Inbox, CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_REVIEW: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
};
const STATUS_ICONS: Record<string, any> = {
    PENDING: Clock,
    IN_REVIEW: MessageSquare,
    RESOLVED: CheckCircle,
    REJECTED: XCircle,
};

const REQUEST_TYPES: Record<string, string> = {
    LEAVE: "Leave Application",
    PICKUP_CHANGE: "Pickup Change",
    FEE_CLARIFICATION: "Fee Clarification",
    APPOINTMENT: "Appointment Request",
    TC: "Transfer Certificate",
    OTHER: "General Request",
};

export default function ParentRequestsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseNote, setResponseNote] = useState("");

    useEffect(() => { loadRequests(); }, [slug]);

    async function loadRequests() {
        setIsLoading(true);
        try {
            const { prisma } = await import("@/lib/prisma");
            const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
            if (!school) return;

            const data = await prisma.parentRequest.findMany({
                where: { schoolId: school.id },
                orderBy: { createdAt: "desc" },
                take: 50,
                include: {
                    student: { select: { firstName: true, lastName: true, admissionNumber: true } },
                }
            });
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRespond(requestId: string, status: "RESOLVED" | "REJECTED" | "IN_REVIEW") {
        try {
            const { prisma } = await import("@/lib/prisma");
            await prisma.parentRequest.update({
                where: { id: requestId },
                data: {
                    status,
                    responseNote: responseNote || undefined,
                },
            });
            toast.success(`Request marked as ${status.toLowerCase().replace("_", " ")}`);
            setRespondingTo(null);
            setResponseNote("");
            loadRequests();
        } catch (err) {
            toast.error("Failed to update request");
        }
    }

    const filteredRequests = filterStatus === "ALL"
        ? requests
        : requests.filter(r => r.status === filterStatus);

    const pendingCount = requests.filter(r => r.status === "PENDING").length;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <Inbox className="h-8 w-8 text-indigo-500" />
                        Parent <span className="text-indigo-500">Requests</span>
                        {pendingCount > 0 && (
                            <span className="relative flex h-7 w-7">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-7 w-7 bg-amber-500 text-white text-xs font-bold items-center justify-center">{pendingCount}</span>
                            </span>
                        )}
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Service requests submitted by parents via the app.</p>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 w-fit gap-1">
                {["ALL", "PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            filterStatus === s
                                ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        )}
                    >
                        {s === "ALL" ? `All (${requests.length})` : s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {isLoading ? (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">📭</div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic">Inbox Empty</h3>
                    <p className="text-zinc-500 text-sm mt-2">No parent requests to show.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(req => {
                        const StatusIcon = STATUS_ICONS[req.status] || Clock;
                        return (
                            <div
                                key={req.id}
                                className={cn(
                                    "bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border p-8 shadow-sm transition-all",
                                    req.status === "PENDING"
                                        ? "border-amber-200 dark:border-amber-900"
                                        : "border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        {/* Meta info */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5", STATUS_COLORS[req.status] || "bg-zinc-100 text-zinc-500")}>
                                                <StatusIcon className="h-3 w-3" />
                                                {req.status.replace("_", " ")}
                                            </span>
                                            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                                {REQUEST_TYPES[req.type] || req.type}
                                            </span>
                                        </div>

                                        {/* Student info */}
                                        <div>
                                            <p className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                                                {req.student?.firstName} {req.student?.lastName}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-bold">
                                                Adm: {req.student?.admissionNumber} · {req.parentMobile}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{req.description}</p>
                                        </div>

                                        {req.responseNote && (
                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Response Note</p>
                                                <p className="text-sm text-emerald-800 dark:text-emerald-200">{req.responseNote}</p>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                            Submitted {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>

                                    {/* Action Panel */}
                                    {req.status === "PENDING" || req.status === "IN_REVIEW" ? (
                                        <div className="flex md:flex-col gap-3 justify-center md:border-l border-zinc-100 dark:border-zinc-800 md:pl-8">
                                            {respondingTo === req.id ? (
                                                <div className="space-y-3 w-48">
                                                    <textarea
                                                        value={responseNote}
                                                        onChange={e => setResponseNote(e.target.value)}
                                                        placeholder="Response note (optional)..."
                                                        rows={3}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none"
                                                    />
                                                    <button onClick={() => handleRespond(req.id, "RESOLVED")} className="w-full h-10 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">
                                                        Resolve
                                                    </button>
                                                    <button onClick={() => handleRespond(req.id, "REJECTED")} className="w-full h-10 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                                                        Reject
                                                    </button>
                                                    <button onClick={() => setRespondingTo(null)} className="w-full h-8 text-zinc-400 rounded-xl text-xs">Cancel</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { setRespondingTo(req.id); setResponseNote(""); }}
                                                        className="h-12 px-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                                    >
                                                        Respond
                                                    </button>
                                                    {req.status === "PENDING" && (
                                                        <button
                                                            onClick={() => handleRespond(req.id, "IN_REVIEW")}
                                                            className="h-12 px-6 bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                                        >
                                                            Mark In Review
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
