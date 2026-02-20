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
        setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, isCompleted: !r.isCompleted } : r));
        try {
            await toggleDiaryCompletionAction(recipientId);
            toast.success("Updated status");
        } catch (error) {
            toast.error("Failed to update status");
            // Revert
            setRecipients(prev => prev.map(r => r.id === recipientId ? { ...r, isCompleted: !r.isCompleted } : r));
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
                {/* 1. CALENDAR WIDGET (Compact) */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div className="p-6 flex items-center justify-between border-b border-slate-50">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <ChevronLeft className="h-5 w-5 text-slate-400" />
                        </button>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {format(currentMonth, "MMMM yyyy")}
                        </h3>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-7 mb-4 text-center">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} className="text-[10px] font-black text-slate-300 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                            {/* Empty cells */}
                            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {daysInMonth.map((day, i) => {
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                const isToday = isSameDay(day, new Date());
                                const hasData = hasEntries(day);

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative",
                                                isSelected ? "bg-slate-900 text-white shadow-lg scale-110 z-10" : "text-slate-600 hover:bg-slate-50",
                                                !isSelected && isToday && "bg-indigo-50 text-indigo-600 border border-indigo-100",
                                                !isSelected && hasData && !isToday && "bg-slate-50 font-black text-slate-900"
                                            )}
                                        >
                                            {format(day, "d")}
                                            {hasData && (
                                                <div className={cn(
                                                    "absolute -bottom-1 h-1.5 w-1.5 rounded-full border border-white",
                                                    isSelected ? "bg-indigo-400" : "bg-indigo-500"
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
                                className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200"
                            >
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="h-8 w-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-900 font-bold mb-1">No activities recorded</h4>
                                <p className="text-xs text-slate-400 font-medium">Enjoy your free time!</p>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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

    // Priority Config (Just colors for text/border)
    const priorityColors: any = {
        URGENT: "text-red-600 bg-red-50 border-red-200",
        HIGH: "text-orange-600 bg-orange-50 border-orange-200",
        NORMAL: "text-blue-600 bg-blue-50 border-blue-200",
        Low: "text-slate-600 bg-slate-50 border-slate-200"
    };

    const priority = entry.priority || "NORMAL";
    const colorClass = priorityColors[priority] || priorityColors.NORMAL;

    return (
        <div className={`flex items-start gap-4 p-4 border-b border-slate-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>

            {/* Priority / Status Strip */}
            <div className={`w-1 self-stretch rounded-full ${colorClass.split(' ')[2].replace('border', 'bg')}`}></div>

            {/* Time */}
            <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                <span className="text-xs font-bold text-slate-500">
                    {format(new Date(entry.publishedAt || entry.createdAt), "h:mm")}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">
                    {format(new Date(entry.publishedAt || entry.createdAt), "a")}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
                        {priority}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide border border-slate-100 rounded px-1.5">
                        {entry.type}
                    </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                    {entry.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {entry.content}
                </p>

                {/* Completion Toggle (Minimal) */}
                {entry.type === 'HOMEWORK' && (
                    <div className="mt-2 text-right">
                        <button
                            onClick={() => onToggle(item.id)}
                            className={`text-xs font-medium flex items-center gap-1.5 ${item.isCompleted ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {item.isCompleted ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <Circle className="h-4 w-4" />
                                    <span>Mark Complete</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

