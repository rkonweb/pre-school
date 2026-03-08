"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar, Plus, Trash2, MapPin, Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createAdminEventBySlugAction, getAdminEventsBySlugAction, deleteAdminEventAction } from "@/app/actions/parent-phase2-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";

const EVENT_TYPES = [
    { value: "HOLIDAY", label: "Holiday", color: "bg-green-500" },
    { value: "EXAM", label: "Exam", color: "bg-red-500" },
    { value: "SPORTS", label: "Sports Day", color: "bg-brand" },
    { value: "PTM", label: "PTM", color: "bg-blue-500" },
    { value: "CULTURAL", label: "Cultural", color: "bg-purple-500" },
    { value: "OTHER", label: "Other", color: "bg-zinc-500" },
];

export default function SchoolEventsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [events, setEvents] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const today = new Date();
    const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
    const [viewYear, setViewYear] = useState(today.getFullYear());

    const [form, setForm] = useState<{
        title: string;
        description: string;
        date: string;
        endDate: string;
        type: string;
        venue: string;
        color: string;
        classIds: string[];
    }>({
        title: "",
        description: "",
        date: "",
        endDate: "",
        type: "HOLIDAY",
        venue: "",
        color: "#2563EB",
        classIds: ["all"],
    });

    useEffect(() => {
        loadEvents();
    }, [slug, viewMonth, viewYear]);

    async function loadEvents() {
        setIsLoading(true);
        try {
            const [res, classroomsRes] = await Promise.all([
                getAdminEventsBySlugAction(slug, viewMonth, viewYear),
                getClassroomsAction(slug),
            ]);

            if (res.success) {
                setEvents(res.events || []);
                setUpcoming(res.upcoming || []);
            } else {
                toast.error(res.error || "Failed to load events");
            }

            if (classroomsRes.success) {
                setClassrooms(classroomsRes.data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreate() {
        if (!form.title || !form.date) {
            toast.error("Title and date are required");
            return;
        }
        setIsCreating(true);
        try {
            const res = await createAdminEventBySlugAction(slug, {
                title: form.title,
                description: form.description || undefined,
                date: form.date,
                endDate: form.endDate || undefined,
                type: form.type,
                venue: form.venue || undefined,
                color: form.color,
                classIds: form.classIds,
            });

            if (res.success) {
                toast.success("Event created successfully!");
                setShowForm(false);
                setForm({ title: "", description: "", date: "", endDate: "", type: "HOLIDAY", venue: "", color: "#2563EB", classIds: ["all"] });
                loadEvents();
            } else {
                toast.error(res.error || "Failed to create event");
            }
        } catch (err) {
            toast.error("Unexpected error");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await deleteAdminEventAction(id, slug);
            if (res.success) {
                toast.success("Event deleted");
                loadEvents();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting event");
        }
    }

    function handleClassToggle(classId: string) {
        if (classId === "all") {
            setForm(prev => ({ ...prev, classIds: ["all"] }));
            return;
        }

        setForm(prev => {
            const current = prev.classIds.filter(id => id !== "all");
            const newIds = current.includes(classId)
                ? current.filter(id => id !== classId)
                : [...current, classId];

            return {
                ...prev,
                classIds: newIds.length === 0 ? ["all"] : newIds,
            };
        });
    }

    function prevMonth() {
        if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    const monthName = new Date(viewYear, viewMonth - 1).toLocaleString("default", { month: "long" });

    const typeColor = (type: string) => EVENT_TYPES.find(t => t.value === type)?.color ?? "bg-zinc-400";
    const typeLabel = (type: string) => EVENT_TYPES.find(t => t.value === type)?.label ?? type;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-brand" />
                        School <span className="text-brand">Calendar</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Manage school events, holidays, and activities for parents.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-brand-gradient text-[var(--secondary-color)] px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 border-none shadow-[0_10px_25px_-5px_rgba(var(--brand-color-rgb),0.4)]"
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-brand/20 dark:border-brand/30 shadow-xl p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                        New <span className="text-brand">Event</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Event Title *</label>
                            <input
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="E.g., Republic Day Holiday"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Event Type *</label>
                            <select
                                id="event-type"
                                title="Select Event Type"
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Start Date *</label>
                            <input
                                id="event-date"
                                title="Event Start Date"
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">End Date (optional)</label>
                            <input
                                id="event-end-date"
                                title="Event End Date"
                                type="date"
                                value={form.endDate}
                                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Venue (optional)</label>
                            <input
                                value={form.venue}
                                onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                                placeholder="Main Hall / Sports Ground..."
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Description (optional)</label>
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Additional details..."
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">Target Classes *</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleClassToggle("all")}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        form.classIds.includes("all")
                                            ? "bg-brand text-[var(--secondary-color)] shadow-md shadow-brand/20"
                                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                                    )}
                                >
                                    All Classes
                                </button>
                                {classrooms.map((cls) => (
                                    <button
                                        key={cls.id}
                                        onClick={() => handleClassToggle(cls.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                            !form.classIds.includes("all") && form.classIds.includes(cls.id)
                                                ? "bg-brand text-[var(--secondary-color)] shadow-md shadow-brand/20"
                                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}
                                    >
                                        {cls.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex-1 bg-brand-gradient text-[var(--secondary-color)] py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border-none shadow-[0_10px_25px_-5px_rgba(var(--brand-color-rgb),0.4)]"
                        >
                            {isCreating ? "Creating..." : "Create Event"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-4 rounded-2xl font-black uppercase text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Events List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between">
                        <button onClick={prevMonth} title="Previous Month" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-black uppercase tracking-tighter">{monthName} {viewYear}</h2>
                        <button onClick={nextMonth} title="Next Month" className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl mb-6">📅</div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic">No Events</h3>
                            <p className="text-zinc-500 text-sm mt-2">No events scheduled for {monthName} {viewYear}.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(ev => (
                                <div key={ev.id} className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 flex items-center gap-6 hover:border-blue-200 transition-all shadow-sm">
                                    <div className={cn("w-3 h-16 rounded-full shrink-0", typeColor(ev.type))} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white", typeColor(ev.type))}>
                                                {typeLabel(ev.type)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{ev.title}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-xs font-medium text-zinc-500">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                {ev.endDate && ` – ${new Date(ev.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                            </span>
                                            {ev.venue && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-3 w-3" />
                                                    {ev.venue}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Tag className="h-3 w-3" />
                                                {(() => {
                                                    try {
                                                        const ids = JSON.parse(ev.classIds || '["all"]');
                                                        if (ids.includes("all")) return "All Classes";
                                                        return ids.map((id: string) => {
                                                            const cls = classrooms.find(c => c.id === id);
                                                            return cls ? cls.name : id;
                                                        }).join(', ');
                                                    } catch (e) {
                                                        return "All Classes";
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        {ev.description && <p className="text-xs text-zinc-400 mt-1">{ev.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(ev.id)}
                                        title="Delete Event"
                                        className="p-3 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors rounded-xl"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Upcoming Events</h3>
                    {upcoming.length === 0 ? (
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8 text-center">
                            <p className="text-zinc-400 text-sm">No upcoming events</p>
                        </div>
                    ) : (
                        upcoming.map(ev => (
                            <div key={ev.id} className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", typeColor(ev.type))} />
                                    <span className="text-xs font-black uppercase text-zinc-400">{typeLabel(ev.type)}</span>
                                </div>
                                <p className="font-bold text-zinc-900 dark:text-zinc-50 mt-1 text-sm">{ev.title}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
