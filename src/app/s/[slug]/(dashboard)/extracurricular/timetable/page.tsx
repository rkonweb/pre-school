"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Plus, Clock, Calendar, MapPin, 
    Users, Trophy, ChevronLeft, ChevronRight,
    Play, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionHeader, Btn } from "@/components/ui/erp-ui";
import { 
    getActivityTimetableAction, 
    startSessionFromTimetableAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { TimetableModal } from "@/components/dashboard/extracurricular/TimetableModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 0, name: "Sunday" }
];

export default function TimetablePage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [timetable, setTimetable] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartingSession, setIsStartingSession] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const loadData = async () => {
        setIsLoading(true);
        const res = await getActivityTimetableAction(slug);
        if (res.success) {
            setTimetable(res.data);
        }
        setIsLoading(false);
    };

    const handleStartSession = async (timetableId: string) => {
        setIsStartingSession(timetableId);
        const res = await startSessionFromTimetableAction(slug, timetableId);
        if (res.success) {
            toast.success("Session started successfully");
            router.push(`/s/${slug}/extracurricular/attendance/${res.sessionId}`);
        } else {
            toast.error(res.error || "Failed to start session");
        }
        setIsStartingSession(null);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Activity Timetable"
                subtitle="Weekly schedule for all extracurricular programs and clubs."
                icon={Clock}
                action={
                    <Btn 
                        icon={Plus} 
                        onClick={() => setShowModal(true)} 
                    >Add Slot</Btn>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
                {DAYS.map(day => (
                    <div key={day.id} className="flex flex-col gap-4 min-w-[160px]">
                        <div className="p-4 bg-zinc-900 rounded-2xl text-center shadow-lg shadow-zinc-200">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">{day.name.slice(0, 3)}</span>
                            <span className="text-[14px] font-black text-white">{day.name}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {timetable.filter(slot => Number(slot.dayOfWeek) === day.id).map(slot => (
                                <div 
                                    key={slot.id} 
                                    className="p-4 bg-white rounded-3xl border-2 border-zinc-100 shadow-sm hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all group cursor-pointer"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                                                <span className="text-[13px] font-black text-zinc-900 line-clamp-1">{slot.activity.name}</span>
                                            </div>
                                            {Number(slot.dayOfWeek) === new Date().getDay() && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartSession(slot.id);
                                                    }}
                                                    disabled={isStartingSession === slot.id}
                                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                                                    title="Start Attendance Session"
                                                >
                                                    {isStartingSession === slot.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Play className="w-3 h-3 fill-current" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">{slot.startTime} - {slot.endTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-[10px] font-bold truncate">{slot.venue || "No venue"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 border-t border-zinc-50">
                                                <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {slot.coach?.avatar ? (
                                                        <img src={slot.coach.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <Users className="w-2.5 h-2.5 text-zinc-400" />
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter truncate">
                                                    {slot.coach ? slot.coach.firstName : "Default Coach"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {timetable.filter(slot => Number(slot.dayOfWeek) === day.id).length === 0 && (
                                <div className="p-8 border-2 border-dashed border-zinc-100 rounded-3xl flex items-center justify-center opacity-50">
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest vertical-text select-none">No Slots</span>
                                    <Btn 
                                        variant="secondary" 
                                        onClick={() => setShowModal(true)} 
                                    >Define New Slot</Btn>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <TimetableModal
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
