"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Loader2, BookOpen, MessageSquare, Bell, Clock, Edit2, Trash2 } from "lucide-react";
import { getDiaryEntriesAction, deleteDiaryEntryAction } from "@/app/actions/diary-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import { DiaryEntryModal } from "@/components/diary/DiaryEntryModal";
import { getCookie } from "@/lib/cookies";

export default function DiaryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [selectedClass, setSelectedClass] = useState<string>("");
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");

    useEffect(() => {
        loadClassrooms();
    }, [slug]);

    useEffect(() => {
        if (selectedClass) {
            loadData();
        }
    }, [selectedClass, currentMonth]);

    async function loadClassrooms() {
        const res = await getClassroomsAction(slug);
        if (res.success) {
            setClassrooms(res.data || []);
        }
    }

    async function loadData(showLoader = true) {
        if (showLoader) setIsLoading(true);
        const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

        const academicYearId = getCookie(`academic_year_${slug}`) || undefined;

        const res = await getDiaryEntriesAction(slug, {
            classroomId: selectedClass,
            month: monthStr,
            academicYearId
        });

        if (res.success) {
            setEntries(res.data || []);
        } else {
            toast.error(res.error || "Failed to load diary entries");
        }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this entry?")) return;

        const res = await deleteDiaryEntryAction(id);
        if (res.success) {
            toast.success("Entry deleted successfully");
            loadData(false); // Silent refresh
        } else {
            toast.error(res.error || "Failed to delete entry");
        }
    }

    function handleEdit(entry: any) {
        setEditingEntry(entry);
        setIsModalOpen(true);
    }

    function handleAddEntry(dateStr: string) {
        setSelectedDate(dateStr);
        setEditingEntry(null);
        setIsModalOpen(true);
    }

    function handleModalClose() {
        setIsModalOpen(false);
        setEditingEntry(null);
        setSelectedDate("");
        loadData(false); // Silent refresh
    }

    function previousMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    }

    function nextMonth() {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }

    const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Generate calendar days
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    function getEntriesForDate(day: number) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return entries.filter(entry => {
            const entryDate = entry.scheduledFor || entry.publishedAt;
            if (!entryDate) return false;
            const entryDateStr = new Date(entryDate).toISOString().split("T")[0];
            return entryDateStr === dateStr;
        });
    }

    function getTypeIcon(type: string) {
        switch (type) {
            case "HOMEWORK":
                return <BookOpen className="h-3 w-3" />;
            case "MESSAGE":
                return <MessageSquare className="h-3 w-3" />;
            case "ANNOUNCEMENT":
                return <Bell className="h-3 w-3" />;
            case "REMINDER":
                return <Clock className="h-3 w-3" />;
            default:
                return <BookOpen className="h-3 w-3" />;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case "HOMEWORK":
                return "bg-brand/10 text-brand border-brand/20";
            case "MESSAGE":
                return "bg-green-100 text-green-700 border-green-200";
            case "ANNOUNCEMENT":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "REMINDER":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "bg-zinc-100 text-zinc-700 border-zinc-200";
        }
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    const selectedClassroom = classrooms.find(c => c.id === selectedClass);

    return (
        <div className="p-8 space-y-6 bg-zinc-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">Class Diary</h1>
                    <p className="text-zinc-500 font-medium">Post homework, notes, and messages for students and parents</p>
                </div>
            </div>

            {/* Class Selection */}
            {!selectedClass ? (
                <div className="bg-white rounded-[2rem] border border-zinc-200 p-12 shadow-sm">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="h-20 w-20 bg-gradient-to-br from-brand to-brand/60 rounded-[28px] flex items-center justify-center mx-auto shadow-lg">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-2">Select a Class</h2>
                            <p className="text-zinc-500 font-medium">Choose a class to view and manage diary entries</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            {classrooms.map((classroom) => (
                                <button
                                    key={classroom.id}
                                    onClick={() => setSelectedClass(classroom.id)}
                                    className="group relative bg-white border-2 border-zinc-200 rounded-2xl p-6 hover:border-brand hover:shadow-lg transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-brand/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-2xl font-black text-brand">
                                                {classroom.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-lg text-zinc-900">{classroom.name}</h3>
                                            <p className="text-sm text-zinc-500 font-medium">
                                                {classroom._count?.students || 0} students
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Selected Class Header */}
                    <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedClass("")}
                                    className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900">{selectedClassroom?.name}</h2>
                                    <p className="text-sm text-zinc-500 font-medium">
                                        {selectedClassroom?._count?.students || 0} students
                                    </p>
                                </div>
                            </div>

                            {/* Month Navigation */}
                            <div className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2">
                                <button
                                    onClick={previousMonth}
                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-sm min-w-[140px] text-center">{monthName}</span>
                                <button
                                    onClick={nextMonth}
                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96 bg-white rounded-[2rem] border border-zinc-200">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm">
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-3 mb-4">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="text-center font-black text-xs text-zinc-400 uppercase tracking-widest py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-3">
                                {days.map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                    }

                                    const dayEntries = getEntriesForDate(day);
                                    const isToday = isCurrentMonth && day === today.getDate();
                                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                                    const dayDate = new Date(year, month, day);
                                    const todayMidnight = new Date();
                                    todayMidnight.setHours(0, 0, 0, 0);
                                    const isPast = dayDate < todayMidnight;

                                    return (
                                        <div
                                            key={day}
                                            className={`relative aspect-square border-2 rounded-2xl p-3 transition-all ${isToday
                                                ? "border-brand bg-brand/5"
                                                : isPast ? "border-zinc-100 bg-zinc-50/50" : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                                                }`}
                                        >
                                            {/* Date Number */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={`text-sm font-bold ${isToday ? "text-brand" : isPast ? "text-zinc-300" : "text-zinc-500"}`}>
                                                    {day}
                                                </div>
                                                {/* Add Entry Button */}
                                                {!isPast && (
                                                    <button
                                                        onClick={() => handleAddEntry(dateStr)}
                                                        className="h-6 w-6 rounded-lg bg-brand text-white flex items-center justify-center hover:brightness-110 transition-colors shadow-sm hover:shadow-md"
                                                        title="Add entry"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Entries */}
                                            <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                                                {dayEntries.slice(0, 3).map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer group relative ${getTypeColor(entry.type)}`}
                                                        onClick={() => handleEdit(entry)}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {getTypeIcon(entry.type)}
                                                            <span className="truncate flex-1">{entry.title}</span>
                                                        </div>
                                                        {/* Hover Actions */}
                                                        <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(entry);
                                                                }}
                                                                className="p-1 bg-white rounded text-zinc-900 hover:bg-zinc-100"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(entry.id);
                                                                }}
                                                                className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayEntries.length > 3 && (
                                                    <div className="text-[10px] font-bold text-zinc-400 text-center">
                                                        +{dayEntries.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <DiaryEntryModal
                    schoolSlug={slug}
                    classrooms={classrooms}
                    initialData={editingEntry}
                    selectedClassroomId={selectedClass}
                    selectedDate={selectedDate}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
