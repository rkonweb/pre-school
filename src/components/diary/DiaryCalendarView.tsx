"use client";

import { Edit2, Trash2, BookOpen, MessageSquare, Bell, CheckCircle, Clock } from "lucide-react";

interface DiaryCalendarViewProps {
    entries: any[];
    currentMonth: Date;
    onEdit: (entry: any) => void;
    onDelete: (id: string) => void;
}

export function DiaryCalendarView({ entries, currentMonth, onEdit, onDelete }: DiaryCalendarViewProps) {
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
                return <CheckCircle className="h-3 w-3" />;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case "HOMEWORK":
                return "bg-blue-100 text-blue-700 border-blue-200";
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

    return (
        <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-black text-xs text-zinc-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayEntries = getEntriesForDate(day);
                    const isToday = isCurrentMonth && day === today.getDate();

                    return (
                        <div
                            key={day}
                            className={`aspect-square border rounded-2xl p-2 transition-all ${isToday
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                                }`}
                        >
                            <div className="flex flex-col h-full">
                                <div className={`text-xs font-bold mb-1 ${isToday ? "text-blue-600" : "text-zinc-500"}`}>
                                    {day}
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1">
                                    {dayEntries.slice(0, 3).map((entry) => (
                                        <div
                                            key={entry.id}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer group relative ${getTypeColor(entry.type)}`}
                                            onClick={() => onEdit(entry)}
                                        >
                                            <div className="flex items-center gap-1">
                                                {getTypeIcon(entry.type)}
                                                <span className="truncate">{entry.title}</span>
                                            </div>
                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(entry);
                                                    }}
                                                    className="p-1 bg-white rounded text-zinc-900 hover:bg-zinc-100"
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(entry.id);
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
