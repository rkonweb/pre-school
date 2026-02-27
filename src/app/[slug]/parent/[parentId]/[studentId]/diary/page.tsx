"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Calendar as CalendarIcon,
    MessageSquare,
    Bell,
    Clock,
    FileText,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    CheckCircle,
    Circle,
    X,
    User,
    Sparkles
} from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getDiaryEntriesForStudentAction, toggleDiaryCompletionAction } from "@/app/actions/diary-actions";
import { cn } from "@/lib/utils";
import LoadingOverlay from "@/components/parent/LoadingOverlay";
import { useParentData } from "@/context/parent-context";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { toast } from "sonner";
import { PageWrapper, StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";

export default function ParentStudentDiaryCalendarPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [recipients, setRecipients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // UI State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const { school } = useParentData();
    const brandColor = school?.brandColor || school?.primaryColor || "#4f46e5";
    const secondaryColor = school?.secondaryColor || "#94a3b8";

    const slug = params.slug as string;
    const studentId = params.studentId as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const loadData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const res = await getDiaryEntriesForStudentAction(slug, studentId);
            if (res.success) {
                const entries = res.data || [];
                setRecipients(entries);

                // Smart Initialization: Select the latest date with entries if initially null
                // Or if it's the first load
                if (entries.length > 0 && isLoading) {
                    const sortedEntries = [...entries].sort((a, b) =>
                        new Date(b.entry.publishedAt || b.entry.createdAt).getTime() -
                        new Date(a.entry.publishedAt || a.entry.createdAt).getTime()
                    );
                    const latestDate = new Date(sortedEntries[0].entry.publishedAt || sortedEntries[0].entry.createdAt);
                    setSelectedDate(latestDate);
                    setCurrentMonth(latestDate);
                }

                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to refresh diary:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();

        // REALTIME POLLING: Refresh data every 30 seconds
        const pollInterval = setInterval(() => {
            loadData(true);
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [slug, studentId]);

    const handleToggleComplete = async (recipientId: string) => {
        const item = recipients.find(r => r.id === recipientId);
        if (!item) return;
        const newStatus = !item.isCompleted;

        setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, isCompleted: newStatus } : r));
        try {
            await toggleDiaryCompletionAction(recipientId, newStatus);
            toast.success("Updated status");
        } catch (error) {
            toast.error("Failed to update status");
            // Revert
            setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, isCompleted: !newStatus } : r));
        }
    };

    // Filter Logic
    const entriesForSelectedDay = recipients.filter(r => {
        if (!selectedDate) return false;
        const entryDate = new Date(r.entry.publishedAt || r.entry.createdAt);
        return isSameDay(entryDate, selectedDate);
    });

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    // Helper to check if a day has entries
    const hasEntries = (date: Date) => {
        return recipients.some(r => isSameDay(new Date(r.entry.publishedAt || r.entry.createdAt), date));
    };

    if (isLoading) return <LoadingOverlay />;

    return (
        <PageWrapper>
            <StickyHeader
                title="Diary & Homework"
                showBell={true}
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />

            <main className="px-5 space-y-6 flex-1 relative z-0">
                {/* 1. CALENDAR WIDGET (Compact Global Glass) */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white/60 mb-6 relative">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-t-[3rem] -z-10" />

                    <div className="p-6 sm:p-8 flex items-center justify-between">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 bg-white/80 hover:bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-105 active:scale-95" title="Previous Month" aria-label="Previous Month">
                            <ChevronLeft className="h-5 w-5 text-slate-600" />
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {format(currentMonth, "MMMM")}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {format(currentMonth, "yyyy")}
                            </p>
                        </div>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-white/80 hover:bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:scale-105 active:scale-95" title="Next Month" aria-label="Next Month">
                            <ChevronRight className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>

                    <div className="px-6 pb-8 sm:px-8">
                        <div className="grid grid-cols-7 mb-4 text-center">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                            {/* Empty cells */}
                            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {daysInMonth.map((day, i) => {
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                const isToday = isSameDay(day, new Date());
                                const hasData = hasEntries(day);

                                return (
                                    <div key={i} className="flex flex-col items-center justify-center">
                                        <button
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all relative overflow-hidden group",
                                                isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 z-10" : "text-slate-600 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm",
                                                !isSelected && isToday && "bg-slate-100 text-slate-900 border-slate-200",
                                                !isSelected && hasData && !isToday && "text-indigo-600 bg-indigo-50/80 border-indigo-100/50"
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 -z-10" />
                                            )}

                                            <span className={cn("relative z-10", isSelected ? "font-black" : "")}>
                                                {format(day, "d")}
                                            </span>

                                            {hasData && (
                                                <div className={cn(
                                                    "h-1 w-1 rounded-full mt-0.5",
                                                    isSelected ? "bg-white" : "bg-indigo-400"
                                                )} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. ACTIVITY STREAM */}
                <div className="pb-12">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            {selectedDate ? format(selectedDate, "EEEE, MMM do") : "Select a Date"}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                            {entriesForSelectedDay.length} Activities
                        </span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {entriesForSelectedDay.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-[3rem] border border-white/60 shadow-lg shadow-slate-200/30"
                            >
                                <div className="h-20 w-20 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100/50">
                                    <Sparkles className="h-8 w-8 text-indigo-300" />
                                </div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight mb-2">No activities recorded</h4>
                                <p className="text-sm font-bold text-slate-400">Enjoy your free time!</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {entriesForSelectedDay.map((item, idx) => (
                                    <DiaryCard
                                        key={item.id}
                                        item={item}
                                        index={idx}
                                        brandColor={brandColor}
                                        onToggle={handleToggleComplete}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </PageWrapper>
    );
}

function DiaryCard({ item, index, brandColor, onToggle }: any) {
    const entry = item.entry;

    // Priority Config
    const priorityConfigs: Record<string, { bg: string, text: string, border: string, icon: any, label: string }> = {
        URGENT: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", icon: Bell, label: "Urgent" },
        HIGH: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", icon: Bell, label: "High" },
        NORMAL: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: MessageSquare, label: "Notice" },
        LOW: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", icon: FileText, label: "Info" }
    };

    const priority = (entry.priority || "NORMAL").toUpperCase();
    const config = priorityConfigs[priority] || priorityConfigs.NORMAL;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "relative bg-white/80 backdrop-blur-md rounded-[2rem] p-5 sm:p-6 border shadow-lg shadow-slate-200/40 overflow-hidden group transition-all hover:shadow-xl hover:shadow-slate-200/60",
                priority === 'URGENT' ? "border-rose-100" : "border-white/60"
            )}
        >
            {/* Priority Glow for Urgent */}
            {priority === 'URGENT' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            )}

            <div className="flex gap-4 sm:gap-6 relative z-10">
                {/* Time Column flex-shrink-0 to prevent squishing */}
                <div className="flex flex-col items-center min-w-[3.5rem] pt-1 shrink-0">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                        {format(new Date(entry.publishedAt || entry.createdAt), "h:mm")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {format(new Date(entry.publishedAt || entry.createdAt), "a")}
                    </span>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            config.bg, config.text, config.border
                        )}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                        </span>

                        {entry.type && (
                            <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-100/50 border border-slate-200/50 uppercase tracking-wider">
                                {entry.type}
                            </span>
                        )}

                        {/* New Indicator (Unread status logic placeholder) */}
                        {!item.isCompleted && entry.type !== 'HOMEWORK' && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                        )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {entry.title}
                    </h4>

                    <p className="text-[13px] sm:text-sm font-medium text-slate-500 leading-relaxed mb-4">
                        {entry.content}
                    </p>

                    {/* Actions (if applicable like Homework toggle) */}
                    {entry.type === 'HOMEWORK' && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100/60 mt-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                            <button
                                onClick={() => onToggle(item.id)}
                                className={cn(
                                    "px-4 py-2.5 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm",
                                    item.isCompleted
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 border border-slate-200"
                                )}
                            >
                                {item.isCompleted ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Completed
                                    </>
                                ) : (
                                    <>
                                        <Circle className="h-4 w-4" />
                                        Mark as Done
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

