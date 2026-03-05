"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, Plus, Clock, CheckCircle, XCircle, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    createPTMSessionAction,
    getPTMSessionsAction,
    deletePTMSessionAction,
    togglePTMSessionAction
} from "@/app/actions/parent-phase3-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";

function generateSlots(start: string, end: string, slotMinutes: number): string[] {
    const slots: string[] = [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let totalStart = sh * 60 + sm;
    const totalEnd = eh * 60 + em;
    while (totalStart + slotMinutes <= totalEnd) {
        const h = Math.floor(totalStart / 60).toString().padStart(2, "0");
        const m = (totalStart % 60).toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
        totalStart += slotMinutes;
    }
    return slots;
}

export default function PTMPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [sessions, setSessions] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        startTime: "09:00",
        endTime: "16:00",
        slotMinutes: 10,
        classIds: ["all"] as string[],
    });

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        try {
            const [sessionsRes, classesRes] = await Promise.all([
                getPTMSessionsAction(slug),
                getClassroomsAction(slug)
            ]);

            if (sessionsRes.success) setSessions(sessionsRes.data || []);
            if (classesRes.success) setClassrooms(classesRes.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load PTM data");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateAction() {
        if (!form.title || !form.date) { toast.error("Title and date are required"); return; }
        if (form.classIds.length === 0) { toast.error("Please select at least one class"); return; }

        setIsCreating(true);
        try {
            const actionRes = await createPTMSessionAction(slug, {
                title: form.title,
                description: form.description,
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                slotMinutes: form.slotMinutes,
                classIds: form.classIds,
            });

            if (actionRes.success) {
                toast.success("PTM session created! Parents can now book slots.");
                setShowForm(false);
                setForm({ title: "", description: "", date: "", startTime: "09:00", endTime: "16:00", slotMinutes: 10, classIds: ["all"] });
                loadData();
            } else {
                toast.error((actionRes as any).error || "Failed to create session");
            }
        } catch (err) { toast.error("Unexpected error"); }
        finally { setIsCreating(false); }
    }

    async function toggleSession(sessionId: string, isActive: boolean) {
        try {
            const res = await togglePTMSessionAction(sessionId, isActive);
            if (res.success) {
                toast.success(isActive ? "Session closed" : "Session reopened");
                setSessions(sessions.map(s => s.id === sessionId ? { ...s, isActive: !isActive } : s));
            } else {
                toast.error(res.error || "Failed to update session");
            }
        } catch { toast.error("Failed to update session"); }
    }

    async function handleDelete(sessionId: string) {
        if (!confirm("Are you sure you want to delete this session? All bookings will be lost.")) return;
        setIsDeleting(sessionId);
        try {
            const res = await deletePTMSessionAction(sessionId);
            if (res.success) {
                toast.success("Session deleted");
                setSessions(sessions.filter(s => s.id !== sessionId));
            } else {
                toast.error(res.error || "Failed to delete session");
            }
        } catch {
            toast.error("Failed to delete session");
        } finally {
            setIsDeleting(null);
        }
    }

    const handleClassToggle = (classId: string) => {
        setForm(prev => {
            if (classId === "all") return { ...prev, classIds: ["all"] };

            let newIds = prev.classIds.filter(id => id !== "all");
            if (newIds.includes(classId)) {
                newIds = newIds.filter(id => id !== classId);
            } else {
                newIds.push(classId);
            }
            if (newIds.length === 0) newIds = ["all"];
            return { ...prev, classIds: newIds };
        });
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-500" />
                        PTM Scheduler
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Manage parent-teacher meetings and class-wise schedules.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                    <Plus className="h-4 w-4" /> New Session
                </button>
            </div>

            {showForm && (
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-2xl font-black mb-6">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">New Session</span></h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Session Title *</label>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="E.g., Term 2 Parent-Teacher Meeting" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Date *</label>
                            <input type="date" title="PTM Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                        </div>

                        <div className="md:col-span-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Target Classes</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleClassToggle("all")}
                                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", form.classIds.includes("all") ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:border-purple-500/30" : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-purple-300")}
                                >
                                    All Classes
                                </button>
                                {classrooms.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleClassToggle(c.id)}
                                        className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", form.classIds.includes(c.id) ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:border-purple-500/30" : "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-purple-300")}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Start Time</label>
                            <input type="time" title="Start Time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">End Time</label>
                            <input type="time" title="End Time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Slot Duration</label>
                            <select title="Slot Duration" value={form.slotMinutes} onChange={e => setForm(f => ({ ...f, slotMinutes: parseInt(e.target.value) }))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all">
                                {[5, 10, 15, 20, 30].map(m => <option key={m} value={m}>{m} min/slot</option>)}
                            </select>
                        </div>
                    </div>

                    {form.startTime && form.endTime && form.slotMinutes && (
                        <div className="mt-6 bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-3">Preview: {generateSlots(form.startTime, form.endTime, form.slotMinutes).length} slots available</p>
                            <div className="flex flex-wrap gap-2">
                                {generateSlots(form.startTime, form.endTime, form.slotMinutes).slice(0, 12).map(s => (
                                    <span key={s} className="bg-white/80 dark:bg-zinc-900 border border-purple-200/50 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 shadow-sm text-[10px] font-bold px-2 py-1 rounded-lg">{s}</span>
                                ))}
                                {generateSlots(form.startTime, form.endTime, form.slotMinutes).length > 12 && (
                                    <span className="text-purple-400 text-[10px] font-bold self-center">+{generateSlots(form.startTime, form.endTime, form.slotMinutes).length - 12} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <button onClick={handleCreateAction} disabled={isCreating} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                            {isCreating ? "Creating Session..." : "Publish Session"}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 py-4 rounded-2xl font-black uppercase text-xs transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <div className="lg:col-span-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-white/10 p-20 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full drop-shadow-md" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="lg:col-span-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-[2.5rem] border border-white/20 dark:border-white/10 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inherit">📅</div>
                        <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100">No Sessions Yet</h3>
                        <p className="text-zinc-500 font-medium mt-2 max-w-sm">Create your first class-wise Parent-Teacher meeting to get started.</p>
                    </div>
                ) : sessions.map(s => {
                    let parsedClasses = ["all"];
                    try {
                        parsedClasses = JSON.parse(s.classIds || '["all"]');
                    } catch (e) {
                        console.error("JSON parse error on classIds:", s.classIds);
                    }
                    const isAll = parsedClasses.includes('all');

                    return (
                        <div key={s.id} className={cn("bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border shadow-xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 relative group overflow-hidden", s.isActive ? "border-purple-200/50 dark:border-purple-500/20" : "border-zinc-200/50 dark:border-zinc-800 opacity-70")}>

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg", s.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400")}>
                                            {s.isActive ? "🟢 Active" : "🔴 Closed"}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                            {isAll ? "All Classes" : `${parsedClasses.length} Classes`}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{s.title}</h3>
                                    <p className="text-sm font-bold text-zinc-500 flex items-center gap-2 mt-2">
                                        <Calendar className="h-4 w-4 text-purple-400" />
                                        {new Date(s.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                                    </p>
                                    <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2 mt-1">
                                        <Clock className="h-3.5 w-3.5 text-indigo-400" /> {s.startTime} – {s.endTime} · {s.slotMinutes}m slots
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-600 to-indigo-600">{s._count?.bookings || 0}</div>
                                    <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Bookings</div>
                                </div>
                            </div>

                            {/* Bookings preview */}
                            <div className="mt-6 mb-4 relative z-10 bg-white/50 dark:bg-zinc-950/50 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800/50">
                                {(!s.bookings || s.bookings.length === 0) ? (
                                    <p className="text-xs text-center text-zinc-400 font-medium py-2">No bookings yet</p>
                                ) : (
                                    <>
                                        {s.bookings.slice(0, 3).map((b: any) => (
                                            <div key={b.id} className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 last:pb-0 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 w-12">{b.slotTime}</span>
                                                <span className="text-xs text-zinc-500 truncate">{b.student?.firstName} {b.student?.lastName}</span>
                                                <span className="ml-auto text-[9px] font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded px-2">{b.status}</span>
                                            </div>
                                        ))}
                                        {s.bookings.length > 3 && (
                                            <p className="text-[10px] text-indigo-500 font-extrabold mt-2 text-center tracking-widest uppercase">+{s.bookings.length - 3} more</p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3 relative z-10 mt-6">
                                <button onClick={() => toggleSession(s.id, s.isActive)} className={cn("flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all", s.isActive ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20")}>
                                    {s.isActive ? "Close Session" : "Reopen Session"}
                                </button>
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    disabled={isDeleting === s.id}
                                    className="p-3.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    title="Delete Session"
                                >
                                    {isDeleting === s.id ? <div className="h-4 w-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
