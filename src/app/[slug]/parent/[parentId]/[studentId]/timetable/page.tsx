"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CalendarDays, Clock, Loader2, User, MapPin, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentDetailsAction } from "@/app/actions/parent-actions";
import { useParentData } from "@/context/parent-context";
import { StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";

export default function TimetablePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const parentId = params.parentId as string;
    const slug = params.slug as string;
    const phone = searchParams.get("phone") || "";

    const { school, isLoading: isContextLoading } = useParentData();
    const brandColor = school?.brandColor || "#6366f1";

    const [fullStudent, setFullStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timetableDay, setTimetableDay] = useState("Monday");

    useEffect(() => {
        if (studentId && slug) {
            loadData();
        } else {
            setIsLoading(false);
        }
        setTimetableDay(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    }, [studentId, slug, phone]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const detailsRes = await getStudentDetailsAction(slug, studentId, phone);
            if (detailsRes.success) {
                setFullStudent(detailsRes.student);
            }
        } catch (error) {
            console.error("Failed to load student details", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isContextLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const classroom = fullStudent?.classroom;

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-24">
            <StickyHeader
                title="Time Table"
                subtitle={`${fullStudent?.firstName || studentId}'s Schedule`}
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

            <main className="flex-1 px-5 py-6 space-y-6 relative z-0">
                <TimetableView
                    classroom={classroom}
                    fullStudent={fullStudent}
                    timetableDay={timetableDay}
                    setTimetableDay={setTimetableDay}
                    brandColor={brandColor}
                />
            </main>
        </div>
    );
}

function TimetableView({ classroom, fullStudent, timetableDay, setTimetableDay, brandColor }: any) {
    // Timetable Logic
    let periods: any[] = [];
    try {
        const rawConfig = fullStudent?.school?.timetableConfig;
        if (rawConfig) {
            const parsed = JSON.parse(rawConfig);
            periods = parsed.periods || [];
        }
    } catch (e) {
        console.error("Timetable config parse error:", e);
    }

    if (periods.length === 0) {
        periods = [
            { id: "p1", name: "Period 1", startTime: "09:00", endTime: "09:45", type: "CLASS" },
            { id: "b1", name: "Break", startTime: "09:45", endTime: "10:00", type: "BREAK" },
            { id: "p2", name: "Period 2", startTime: "10:00", endTime: "10:45", type: "CLASS" },
            { id: "p3", name: "Period 3", startTime: "10:45", endTime: "11:30", type: "CLASS" },
            { id: "b2", name: "Lunch", startTime: "11:30", endTime: "12:15", type: "BREAK" },
            { id: "p4", name: "Period 4", startTime: "12:15", endTime: "13:00", type: "CLASS" },
        ];
    }

    // Active Days
    const allDaysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let activeDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    try {
        let sourceArray = null;
        if (fullStudent?.school?.workingDays) {
            sourceArray = JSON.parse(fullStudent.school.workingDays);
        } else if (fullStudent?.school?.timetableConfig) {
            const parsedConfig = JSON.parse(fullStudent.school.timetableConfig);
            if (Array.isArray(parsedConfig.workingDays)) sourceArray = parsedConfig.workingDays;
        }
        if (Array.isArray(sourceArray) && sourceArray.length > 0) {
            activeDays = sourceArray.sort((a: string, b: string) => allDaysOrder.indexOf(a) - allDaysOrder.indexOf(b));
        }
    } catch (e) { }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Weekly Schedule</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{classroom?.name || "Class"} • {timetableDay}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                    <CalendarDays className="h-6 w-6" />
                </div>
            </div>

            {/* Day Switcher */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                {activeDays.map(day => (
                    <button
                        key={day}
                        onClick={() => setTimetableDay(day)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                            timetableDay === day
                                ? "text-white border-transparent shadow-lg"
                                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                        )}
                        style={timetableDay === day ? { backgroundColor: brandColor, boxShadow: `0 10px 20px ${brandColor}30` } : {}}
                    >
                        {day.slice(0, 3)}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative pl-4 space-y-0">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-zinc-100" />

                {periods.map((period: any, idx) => {
                    const slotData = classroom?.timetable?.[timetableDay]?.[period.id];
                    const isBreak = period.type === "BREAK";

                    // Check if current time is within this period (simple check)
                    const now = new Date();
                    const [startH, startM] = period.startTime.split(':').map(Number);
                    const [endH, endM] = period.endTime.split(':').map(Number);
                    const startTime = new Date(); startTime.setHours(startH, startM, 0);
                    const endTime = new Date(); endTime.setHours(endH, endM, 0);
                    const isNow = now >= startTime && now <= endTime && timetableDay === new Date().toLocaleDateString('en-US', { weekday: 'long' });

                    if (isBreak) {
                        return (
                            <div key={period.id} className="relative flex items-center gap-6 py-6 opacity-60">
                                <div className="absolute left-[23px] w-2.5 h-2.5 rounded-full bg-zinc-200 ring-4 ring-white z-10" />
                                <div className="ml-12 flex items-center gap-3 w-full">
                                    <span className="text-[10px] font-black text-zinc-400 w-12">{period.startTime}</span>
                                    <div className="h-px flex-1 bg-zinc-200 border-t border-dashed border-zinc-300" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-xl">{period.name}</span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={period.id} className="relative flex gap-6 py-3 group">
                            {/* Dot Indicator */}
                            <div className={cn(
                                "absolute left-[19px] top-10 w-4 h-4 rounded-full border-4 border-white z-10 transition-all shadow-sm",
                                isNow ? "scale-125 shadow-lg" : "bg-zinc-200 group-hover:bg-zinc-300"
                            )}
                                style={isNow ? { backgroundColor: brandColor, boxShadow: `0 0 10px ${brandColor}50` } : {}}
                            />

                            <div className="ml-12 w-full">
                                <div className={cn(
                                    "p-6 rounded-[2.5rem] border transition-all relative overflow-hidden",
                                    isNow ? "text-white shadow-2xl border-transparent" : "bg-white border-zinc-100 hover:border-slate-200 hover:shadow-xl hover:shadow-zinc-200/20"
                                )}
                                    style={isNow ? { background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`, boxShadow: `0 20px 40px ${brandColor}30` } : {}}
                                >
                                    {isNow && (
                                        <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-white/20 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                                            Current Class
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <span className={cn(
                                            "text-[10px] font-black tracking-widest uppercase",
                                            isNow ? "text-white/80" : "text-zinc-400"
                                        )}>
                                            {period.startTime} - {period.endTime}
                                        </span>
                                    </div>

                                    {slotData ? (
                                        <>
                                            <h4 className={cn(
                                                "text-xl font-black uppercase tracking-tight mb-3",
                                                isNow ? "text-white" : "text-zinc-900"
                                            )}>
                                                {slotData.subject}
                                            </h4>

                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-2xl flex items-center justify-center transition-colors",
                                                    isNow ? "bg-white/20" : "bg-zinc-50 group-hover:bg-indigo-50"
                                                )}>
                                                    <User className={cn("h-4 w-4", isNow ? "text-white" : "text-zinc-400")} />
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-black uppercase tracking-tight",
                                                    isNow ? "text-white/90" : "text-zinc-500"
                                                )}>
                                                    {slotData.teacherName || "Assigned Teacher"}
                                                </span>
                                            </div>

                                            {slotData.room && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <MapPin className={cn("h-3 w-3", isNow ? "text-white/60" : "text-zinc-300")} />
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", isNow ? "text-white/60" : "text-zinc-400")}>
                                                        Location: Room {slotData.room}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-4 py-1">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 uppercase text-xs tracking-tight">Free Period</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self Study / Library</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Padding for navigation */}
            <div className="h-12" />
        </motion.div>
    );
}
