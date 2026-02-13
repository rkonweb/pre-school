"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Phone,
    MessageCircle,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    Filter,
    MoreVertical,
    Trash2,
    CalendarClock,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getFollowUpsAction,
    completeFollowUpAction,
    deleteFollowUpAction,
    rescheduleFollowUpAction
} from "@/app/actions/follow-up-actions";
import { LeadScoreChip } from "@/components/dashboard/leads/LeadComponents";
import Link from "next/link";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FollowUpsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [followUps, setFollowUps] = useState<any[]>([]);
    const [stats, setStats] = useState({ overdue: 0, today: 0 });
    const [activeTab, setActiveTab] = useState("today");

    // Modal States
    const [completionModal, setCompletionModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
    const [completionNotes, setCompletionNotes] = useState("");
    const [rescheduleItem, setRescheduleItem] = useState<any>(null);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadFollowUps(true);
    }, [slug, activeTab]);

    async function loadFollowUps(fullLoad = false) {
        if (fullLoad) setIsLoading(true);
        else setIsRefreshing(true);

        const res = await getFollowUpsAction(slug, {
            range: activeTab
        });

        if (res.success) {
            setFollowUps(res.followUps || []);
            setStats(res.stats || { overdue: 0, today: 0 });
        }

        setIsLoading(false);
        setIsRefreshing(false);
    }

    const TABS = [
        { id: "today", label: "Today" },
        { id: "overdue", label: "Overdue" },
        { id: "upcoming", label: "Upcoming" },
        { id: "completed", label: "Completed" },
    ];

    async function handleComplete() {
        if (!completionModal.item) return;
        setIsActionLoading(completionModal.item.id);

        const res = await completeFollowUpAction(slug, completionModal.item.id, completionNotes || "Completed");
        if (res.success) {
            toast.success("Follow-up marked as completed");
            setCompletionModal({ open: false, item: null });
            setCompletionNotes("");
            loadFollowUps();
        } else {
            toast.error(res.error || "Failed to complete follow-up");
        }
        setIsActionLoading(null);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this follow-up?")) return;
        setIsActionLoading(id);
        const res = await deleteFollowUpAction(slug, id);
        if (res.success) {
            toast.success("Follow-up deleted");
            loadFollowUps();
        } else {
            toast.error(res.error || "Failed to delete");
        }
        setIsActionLoading(null);
    }

    async function handleReschedule(id: string, days: number) {
        setIsActionLoading(id);
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        const res = await rescheduleFollowUpAction(slug, id, newDate);
        if (res.success) {
            toast.success(`Rescheduled for ${days === 1 ? 'tomorrow' : `in ${days} days`}`);
            loadFollowUps();
        } else {
            toast.error(res.error || "Failed to reschedule");
        }
        setIsActionLoading(null);
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                            Follow-ups
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        Daily task list for counsellors
                    </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <button
                        onClick={() => setActiveTab("overdue")}
                        className={cn("flex items-center gap-1.5 transition-colors hover:text-red-500", activeTab === 'overdue' && "text-red-500")}
                    >
                        <span className="h-2 w-2 rounded-full bg-red-500" /> {stats.overdue} Overdue
                    </button>
                    <button
                        onClick={() => setActiveTab("today")}
                        className={cn("flex items-center gap-1.5 transition-colors hover:text-brand", activeTab === 'today' && "text-brand")}
                    >
                        <span className="h-2 w-2 rounded-full bg-brand" /> {stats.today} Today
                    </button>
                    {isRefreshing && <Loader2 className="h-3 w-3 animate-spin text-zinc-300" />}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id ? "bg-white text-brand shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : followUps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-zinc-300 bg-white rounded-[40px] border border-zinc-100 shadow-xl shadow-zinc-100/40">
                    <CheckCircle2 className="h-12 w-12 mb-4 opacity-10" />
                    <p className="font-bold">No follow-ups for this category.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {followUps.map((item) => {
                        const isOverdue = new Date(item.scheduledAt) < new Date() && item.status === 'PENDING';
                        const isPerformingAction = isActionLoading === item.id;

                        return (
                            <div key={item.id} className={cn(
                                "group relative flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/20 hover:border-brand/20 transition-all",
                                isOverdue && "border-red-100 bg-red-50/10 shadow-red-100/20",
                                isPerformingAction && "opacity-50 pointer-events-none"
                            )}>
                                {isOverdue && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-[32px]" />}

                                <div className="flex items-center gap-4 min-w-[120px]">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center ring-4 ring-zinc-50",
                                        item.type === 'CALL' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    )}>
                                        {item.type === 'CALL' ? <Phone className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-zinc-900">{new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase">{new Date(item.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        {isOverdue && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Overdue</span>}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-base font-black text-zinc-900">{item.lead?.parentName}</p>
                                        <LeadScoreChip score={item.lead?.score || 50} />
                                    </div>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Child: {item.lead?.childName} • {item.lead?.mobile}</p>
                                    {item.notes && <p className="mt-3 text-[11px] text-zinc-400 font-medium italic border-l-2 border-zinc-100 pl-3">"{item.notes}"</p>}
                                </div>

                                <div className="flex items-center gap-3 sm:border-l sm:border-zinc-100 sm:pl-6">
                                    {item.status === 'PENDING' && (
                                        <button
                                            onClick={() => setCompletionModal({ open: true, item })}
                                            className="h-10 px-6 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            {isPerformingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                            Mark Done
                                        </button>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-10 w-10 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-50 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48 p-2 rounded-2xl border-zinc-100 shadow-xl">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/s/${slug}/admissions/inquiry/${item.leadId || item.admissionId}`} className="flex items-center gap-2 p-2.5 text-xs font-black uppercase tracking-widest text-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-50">
                                                    <UserCircle className="h-4 w-4" /> View Profile
                                                </Link>
                                            </DropdownMenuItem>

                                            {item.status === 'PENDING' && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => handleReschedule(item.id, 1)}
                                                        className="flex items-center gap-2 p-2.5 text-xs font-black uppercase tracking-widest text-blue-600 rounded-xl cursor-pointer hover:bg-blue-50"
                                                    >
                                                        <CalendarClock className="h-4 w-4" /> Tomorrow
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleReschedule(item.id, 7)}
                                                        className="flex items-center gap-2 p-2.5 text-xs font-black uppercase tracking-widest text-blue-600 rounded-xl cursor-pointer hover:bg-blue-50"
                                                    >
                                                        <Calendar className="h-4 w-4" /> Next Week
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            <DropdownMenuItem
                                                onClick={() => handleDelete(item.id)}
                                                className="flex items-center gap-2 p-2.5 text-xs font-black uppercase tracking-widest text-red-500 rounded-xl cursor-pointer hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Completion Dialog */}
            <Dialog open={completionModal.open} onOpenChange={(val: boolean) => !val && setCompletionModal({ open: false, item: null })}>
                <DialogContent className="sm:max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Complete Follow-up</DialogTitle>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                            Add a quick note about the interaction
                        </p>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Spoke to parent, requested home visit next week..."
                            className="min-h-[120px] rounded-2xl border-zinc-200 focus:ring-brand font-medium"
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setCompletionModal({ open: false, item: null })}
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleComplete}
                            disabled={isActionLoading !== null}
                            className="bg-brand hover:bg-brand/90 rounded-xl font-black text-[10px] uppercase tracking-widest px-8"
                        >
                            {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save & Complete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
