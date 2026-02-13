"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    Plus,
    Loader2,
    ChevronLeft,
    CheckCircle2,
    MoreVertical,
    Trash2,
    CalendarClock,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getSchoolToursAction,
    deleteTourAction,
    rescheduleTourAction,
    completeTourAction
} from "@/app/actions/school-tour-actions";
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

export default function TourCalendarPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tours, setTours] = useState<any[]>([]);
    const [stats, setStats] = useState({ overdue: 0, today: 0 });
    const [activeTab, setActiveTab] = useState("today");

    // Modal States
    const [completionModal, setCompletionModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
    const [completionNotes, setCompletionNotes] = useState("");
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadTours(true);
    }, [slug, activeTab]);

    async function loadTours(fullLoad = false) {
        if (fullLoad) setIsLoading(true);
        else setIsRefreshing(true);

        const res = await getSchoolToursAction(slug, {
            range: activeTab
        });

        if (res.success) {
            setTours(res.tours || []);
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

        const res = await completeTourAction(slug, completionModal.item.id, completionNotes || "Tour completed");
        if (res.success) {
            toast.success("Tour marked as completed");
            setCompletionModal({ open: false, item: null });
            setCompletionNotes("");
            loadTours();
        } else {
            toast.error(res.error || "Failed to complete tour");
        }
        setIsActionLoading(null);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to cancel/delete this tour?")) return;
        setIsActionLoading(id);
        const res = await deleteTourAction(slug, id);
        if (res.success) {
            toast.success("Tour deleted");
            loadTours();
        } else {
            toast.error(res.error || "Failed to delete");
        }
        setIsActionLoading(null);
    }

    async function handleReschedule(id: string, days: number) {
        setIsActionLoading(id);
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        const res = await rescheduleTourAction(slug, id, newDate);
        if (res.success) {
            toast.success(`Rescheduled for ${days === 1 ? 'tomorrow' : `in ${days} days`}`);
            loadTours();
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
                            School Tours
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        Campus visit and slot management
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-4">
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
                    <button className="h-11 px-6 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all">
                        <CalendarIcon className="h-4 w-4" />
                        Book Tour
                    </button>
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

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Daily Summary Sidebar */}
                <div className="lg:col-span-1 rounded-[32px] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/40 h-fit">
                    <h3 className="text-sm font-black uppercase tracking-tight mb-6">Daily Summary</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold p-3 bg-zinc-50 rounded-xl">
                            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Scheduled Today</span>
                            <span className="text-brand font-black text-sm">{stats.today}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold p-3 bg-red-50 rounded-xl">
                            <span className="text-red-500 font-bold uppercase tracking-widest text-[9px]">Overdue/Past</span>
                            <span className="text-red-600 font-black text-sm">{stats.overdue}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 italic">Pro Tip</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Marking tours as completed updates the lead's status and logs an interaction automatically.
                        </p>
                    </div>
                </div>

                {/* Main Schedule */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex h-[40vh] items-center justify-center bg-white rounded-[40px] border border-zinc-100">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 text-zinc-300 bg-white rounded-[40px] border border-zinc-100 shadow-xl shadow-zinc-100/40">
                            <MapPin className="h-12 w-12 mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs">No tours scheduled for this range.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {tours.map((tour) => {
                                const isOverdue = new Date(tour.scheduledAt) < new Date() && tour.status === 'PENDING';
                                const isPerformingAction = isActionLoading === tour.id;

                                return (
                                    <div key={tour.id} className={cn(
                                        "group relative flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/20 hover:border-brand/20 transition-all",
                                        isOverdue && "border-red-100 bg-red-50/10 shadow-red-100/20",
                                        isPerformingAction && "opacity-50 pointer-events-none"
                                    )}>
                                        {isOverdue && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-[32px]" />}

                                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                                            <span className="text-lg font-black text-zinc-900 leading-none">
                                                {new Date(tour.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">
                                                {new Date(tour.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            {isOverdue && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">Overdue</span>}
                                        </div>

                                        <div className="h-12 w-1 bg-zinc-100 rounded-full hidden sm:block" />

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-base font-black text-zinc-900">{tour.lead?.parentName}</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    tour.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                                )}>
                                                    {tour.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Child: {tour.lead?.childName} • {tour.lead?.mobile}</p>
                                            {tour.notes && <p className="mt-3 text-[11px] text-zinc-400 font-medium italic border-l-2 border-zinc-100 pl-3">"{tour.notes}"</p>}
                                        </div>

                                        <div className="flex items-center gap-3 sm:border-l sm:border-zinc-100 sm:pl-6">
                                            {tour.status === 'PENDING' && (
                                                <button
                                                    onClick={() => setCompletionModal({ open: true, item: tour })}
                                                    className="h-10 px-6 bg-[#A08359] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#A08359]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
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
                                                        <Link href={`/s/${slug}/admissions/inquiry/${tour.leadId || tour.admissionId}`} className="flex items-center gap-2 p-2.5 text-xs font-black uppercase tracking-widest text-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-50">
                                                            <UserCircle className="h-4 w-4" /> View Profile
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {tour.status === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleReschedule(tour.id, 1)}
                                                                className="text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                                                                    <CalendarClock className="h-4 w-4" /> Tomorrow
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleReschedule(tour.id, 7)}
                                                                className="text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                                                                    <CalendarIcon className="h-4 w-4" /> Next Week
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(tour.id)}
                                                        className="text-red-500 hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                                                            <Trash2 className="h-4 w-4" /> Cancel Tour
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Completion Dialog */}
            <Dialog open={completionModal.open} onOpenChange={(val: boolean) => !val && setCompletionModal({ open: false, item: null })}>
                <DialogContent className="sm:max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 text-left">Complete Tour</DialogTitle>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1 text-left">
                            Add a quick note about the campus visit
                        </p>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="e.g., Parent was impressed with the lab facilities. Ready for documentation."
                            className="min-h-[120px] rounded-2xl border-zinc-200 focus:ring-brand font-medium placeholder:text-zinc-300"
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
