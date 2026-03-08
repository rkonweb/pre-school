"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Plus, Zap, CheckCircle, XCircle, 
    Users, Calendar, Search, ArrowRight,
    Trophy, Play, Loader2, Clock, MapPin
} from "lucide-react";
import { 
    SectionHeader, Btn, StatusChip 
} from "@/components/ui/erp-ui";
import { 
    getSessionsAction, 
    getActivityTimetableAction, 
    startSessionFromTimetableAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { format } from "date-fns";
import { SessionModal } from "@/components/dashboard/extracurricular/SessionModal";
import { toast } from "sonner";

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [sessions, setSessions] = useState<any[]>([]);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartingSession, setIsStartingSession] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        const [sessionRes, timetableRes] = await Promise.all([
            getSessionsAction(slug),
            getActivityTimetableAction(slug)
        ]);

        if (sessionRes.success) {
            setSessions(sessionRes.data);
        }

        if (timetableRes.success) {
            const today = new Date().getDay();
            setTodaySchedule(timetableRes.data.filter((s: any) => s.dayOfWeek === today));
        }
        setIsLoading(false);
    };

    const handleStartSession = async (timetableId: string) => {
        setIsStartingSession(timetableId);
        const res = await startSessionFromTimetableAction(slug, timetableId);
        if (res.success) {
            toast.success("Session started");
            router.push(`/s/${slug}/extracurricular/attendance/${res.sessionId}`);
        } else {
            toast.error(res.error || "Failed to start session");
        }
        setIsStartingSession(null);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const filtered = sessions.filter(s => 
        s.activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Attendance Tracking"
                subtitle="Mark and monitor student presence in activity sessions."
                icon={Zap}
                action={
                    <Btn 
                        icon={Plus} 
                        onClick={() => setShowModal(true)} 
                    >New Session</Btn>
                }
            />

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border-2 border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search sessions by activity or topic..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {todaySchedule.length > 0 && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">Today's Schedule</h3>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Slots scheduled for today</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {todaySchedule.map((slot) => (
                            <div 
                                key={slot.id}
                                className="p-5 bg-white rounded-[32px] border-2 border-zinc-100 shadow-sm hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/5 transition-all group"
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 animate-pulse" />
                                            <span className="text-sm font-black text-zinc-900 line-clamp-1">{slot.activity.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleStartSession(slot.id)}
                                            disabled={isStartingSession === slot.id}
                                            className="p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-600 hover:text-white transition-all disabled:opacity-50"
                                            title="Start Session"
                                        >
                                            {isStartingSession === slot.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-black uppercase tracking-tighter">{slot.startTime} - {slot.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-bold truncate">{slot.venue || "No venue"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">Past & Ongoing Sessions</h3>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Historical attendance data</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => router.push(`/s/${slug}/extracurricular/attendance/${session.id}`)}
                            className="p-6 bg-white rounded-[32px] border-2 border-zinc-100 shadow-sm hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/5 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-violet-50 group-hover:text-violet-600 transition-all">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-black text-zinc-900 line-clamp-1">{session.activity.name}</span>
                                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-tight">{session.activity.category}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                                </div>

                                <div className="flex flex-col gap-3 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-50">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-sm font-bold text-zinc-600">{format(new Date(session.date), 'EEE, MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-sm font-bold text-zinc-600">
                                            Coach: {session.coach ? `${session.coach.firstName} ${session.coach.lastName}` : "Assigned Mentor"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-zinc-500 line-clamp-1 italic">
                                        "{session.notes || "Regular practice session"}"
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Attendance Status</div>
                                    <StatusChip label={session.attendanceCount > 0 ? "Completed" : "Pending"} />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {filtered.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 py-20 bg-zinc-50/50 rounded-[40px] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-4">
                            <Zap className="w-12 h-12 text-zinc-200" />
                            <p className="text-sm font-bold text-zinc-400">No sessions found.</p>
                            <Btn 
                                variant="primary" 
                                onClick={() => setShowModal(true)} 
                            >Start Your First Session</Btn>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <SessionModal
                    slug={slug}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
