"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarCheck,
    Wallet2,
    Truck,
    GraduationCap,
    Clock,
    Image as ImageIcon,
    Calendar,
    Sparkles,
    AlertTriangle,
    Bell,
    ChevronLeft,
    BookOpen,
    BellRing,
    AlertCircle,
    MessageSquare,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    getStudentDetailsAction,
    getStudentAttendanceAction,
    getStudentFeesAction,
    getStudentTransportAction,
    getStudentAcademicDataAction,
    getStudentMediaAction
} from "@/app/actions/parent-actions";
import { getDiaryEntriesForStudentAction, acknowledgeDiaryEntryAction } from "@/app/actions/diary-actions";
import { useParentData } from "@/context/parent-context";
import { PushNotificationButton } from "@/lib/push-notifications";
import { toast } from "sonner";
import CategoryBubbles from "@/components/mobile/CategoryBubbles";
import { StickyHeader } from "@/components/ui-theme";
import { DashboardHeader } from "@/components/ui-theme/DashboardHeader";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";
import { useParentNav } from "../layout";

export default function StudentDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const { students, studentStats, isLoading: isContextLoading, school: schoolContext, parentProfile } = useParentData();

    console.log("StudentDashboardPage Render:", { studentId, slug, parentId, phone, isContextLoading });

    // Deep Data State
    const [fullStudent, setFullStudent] = useState<any>(null);
    const [fees, setFees] = useState<any>(null);
    const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
    const [transport, setTransport] = useState<any>(null);
    const [academicData, setAcademicData] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const { setIsMenuOpen } = useParentNav();

    // Initial basic data from context
    const basicStudent = students.find((s: any) => s.id === studentId);
    const stats = studentStats[studentId];

    useEffect(() => {
        console.log("StudentDashboardPage Effect Triggered", { studentId, phone });
        if (studentId && slug) {
            loadDeepData();
        } else {
            console.warn("Missing params for Dashboard loadDeepData");
            setIsLoadingDetails(false);
        }
    }, [studentId, slug, phone]);

    const loadDeepData = async () => {
        console.log("Starting Dashboard loadDeepData...");
        setIsLoadingDetails(true);
        try {
            console.log("Calling Promise.all for comprehensive dashboard data...");
            const [detailsRes, feesRes, diaryRes, transportRes, academicRes, mediaRes] = await Promise.all([
                getStudentDetailsAction(slug, studentId, phone),
                getStudentFeesAction(slug, studentId, phone),
                getDiaryEntriesForStudentAction(slug, studentId),
                getStudentTransportAction(slug, studentId, phone),
                getStudentAcademicDataAction(slug, studentId),
                getStudentMediaAction(slug, studentId, phone)
            ]);

            if (detailsRes.success) setFullStudent(detailsRes.student);
            if (feesRes.success) setFees(feesRes);
            if (diaryRes.success) setDiaryEntries(diaryRes.data || []);
            if (transportRes.success) setTransport((transportRes as any).transport);
            if (academicRes.success) setAcademicData((academicRes as any).data);
            if (mediaRes.success) setMedia((mediaRes as any).media || []);
        } catch (error) {
            console.error("Failed to load comprehensive details", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    if (isContextLoading) return <div className="h-screen bg-slate-50" />;

    const student = fullStudent || basicStudent;
    if (!student) return null;

    const attendancePct = stats?.attendance?.percentage || student?.stats?.attendance?.percentage || 0;
    const feesDue = fees?.summary?.totalDue ?? (stats?.fees?.totalDue || student?.stats?.fees?.totalDue || 0);

    const brandColor = schoolContext?.brandColor || schoolContext?.primaryColor || "#6366f1";

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-32 text-slate-900 font-sans selection:bg-indigo-500/20">
            {/* HEADER */}
            <DashboardHeader
                title={schoolContext?.name || "Dashboard"}
                subtitle={student.firstName || "Student"}
                showBack={false}
                showBell={true}
                logoUrl={schoolContext?.logo}
                brandColor={brandColor}
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />

            <main className="px-5 space-y-8 flex-1">
                {/* 1. AI PULSE / SMART ALERTS */}
                <section className="mt-4">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest italic leading-none">AI Smart Pulse</h3>
                    </div>

                    <div className="space-y-3">
                        {transport?.liveStatus?.status === 'MOVING' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-3xl p-4 shadow-xl shadow-indigo-500/5 flex items-center gap-4 group"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
                                    <Truck className="h-6 w-6 animate-bounce" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-slate-900 leading-tight">School Bus in Motion</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Estimated arrival at your stop in {transport?.liveStatus?.delayMinutes || 15} mins</p>
                                </div>
                                <div className="pr-2">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                                </div>
                            </motion.div>
                        )}

                        {academicData?.needsAttention && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/80 backdrop-blur-md border border-rose-100 rounded-3xl p-4 shadow-xl shadow-rose-500/5 flex items-center gap-4"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black text-slate-900 leading-tight">Academic Alert</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{student.firstName}'s Math score needs a review.</p>
                                </div>
                                <Link href="#" className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </Link>
                            </motion.div>
                        )}

                        {(!transport?.liveStatus || transport?.liveStatus?.status !== 'MOVING') && !academicData?.needsAttention && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[2rem] p-5 text-white shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white/90">Everything looks great!</p>
                                        <p className="text-[10px] font-medium text-white/70">No urgent alerts for {student.firstName} today.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* 2. COMPREHENSIVE MODULES GRID */}
                <section>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Transport Module Card - Live Updates */}
                        <Link href={`/${slug}/parent/${parentId}/mobile/transport${phone ? `?phone=${phone}` : ''}`} className="block h-full">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-blue-200"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Bus Tracker</p>
                                    <h4 className="text-sm font-black text-white leading-tight">
                                        {transport?.liveStatus?.status || "In Garage"}
                                    </h4>
                                    <p className="text-[9px] font-bold text-white/80 mt-1 uppercase">Live Updates</p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Attendance (Existing) */}
                        <Link href={`/${slug}/parent/${parentId}/${studentId}/attendance${phone ? `?phone=${phone}` : ''}`} className="block h-full">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-amber-200"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <CalendarCheck className="h-6 w-6 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Attendance</p>
                                    <h4 className="text-4xl font-black tracking-tighter mb-1 leading-none">{attendancePct}%</h4>
                                </div>
                                <div className="absolute bottom-6 right-6 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </div>
                            </motion.div>
                        </Link>

                        {/* Finance (Existing/Refined) */}
                        <Link href={`/${slug}/parent/${parentId}/${studentId}/finance${phone ? `?phone=${phone}` : ''}`} className="block h-full">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <Wallet2 className="h-6 w-6 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Fees Balance</p>
                                    <h4 className="text-3xl font-black tracking-tighter text-white leading-none">
                                        <span className="text-xl mr-0.5 opacity-50 font-bold">R</span>{feesDue.toLocaleString()}
                                    </h4>
                                </div>
                                <div className="absolute bottom-6 right-6 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </div>
                            </motion.div>
                        </Link>



                        {/* Academics/Progress Card */}
                        <Link href={`/${slug}/parent/${parentId}/${studentId}/academics${phone ? `?phone=${phone}` : ''}`} className="block h-full">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200"
                            >
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mb-12 blur-2xl shrink-0" />
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Academic Score</p>
                                    <h4 className="text-3xl font-black tracking-tighter text-white leading-none">
                                        {academicData?.overallPerformance || "88%"}
                                    </h4>
                                    <p className="text-[9px] font-bold text-white/80 mt-1 uppercase tracking-widest leading-none">Top 10%</p>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Homework Card */}
                        <Link href={`/${slug}/parent/${parentId}/${studentId}/homework${phone ? `?phone=${phone}` : ''}`} className="block h-full">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-200"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Homework</p>
                                    <h4 className="text-sm font-black text-white leading-tight">
                                        {diaryEntries.filter(d => d.entry.type === "HOMEWORK").length || 0} Pending
                                    </h4>
                                    <p className="text-[9px] font-bold text-white/80 mt-1 uppercase">Next: Math</p>
                                </div>
                            </motion.div>
                        </Link>
                    </div>
                </section>

                {/* 3. DAILY FEED SECTION */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-lg bg-rose-100 flex items-center justify-center">
                                <Clock className="h-3 w-3 text-rose-500" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Daily Pulse</h3>
                        </div>
                        <Link href={`/${slug}/parent/${parentId}/activity${phone ? `?phone=${phone}` : ''}`} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            View All
                        </Link>
                    </div>

                    {/* Recent Diary Entries */}
                    {diaryEntries.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-10 text-center border border-dashed border-slate-200 shadow-sm">
                            <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent updates for {student.firstName}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {diaryEntries.slice(0, 3).map((rec: any, idx) => (
                                <motion.div
                                    key={rec.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[2.2rem] p-5 shadow-xl shadow-slate-200/40 border border-slate-50 flex gap-4 relative overflow-hidden group"
                                >
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:rotate-6",
                                        rec.entry.type === "HOMEWORK" ? "bg-violet-50 text-violet-600" :
                                            rec.entry.type === "ANNOUNCEMENT" ? "bg-amber-50 text-amber-600" :
                                                rec.entry.type === "URGENT" ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-600"
                                    )}>
                                        {rec.entry.type === "HOMEWORK" ? <BookOpen className="h-5 w-5" /> :
                                            rec.entry.type === "ANNOUNCEMENT" ? <BellRing className="h-5 w-5" /> :
                                                rec.entry.type === "URGENT" ? <AlertCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight mt-0.5">{rec.entry.title}</h4>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0 ml-2">{new Date(rec.entry.publishedAt || rec.entry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 font-medium leading-relaxed italic">"{rec.entry.content}"</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 4. MEDIA VAULT MINI-PREVIEW */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-lg bg-teal-100 flex items-center justify-center">
                                <ImageIcon className="h-3 w-3 text-teal-600" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Media Vault</h3>
                        </div>
                        <Link href={`/${slug}/parent/${parentId}/media${phone ? `?phone=${phone}` : ''}`} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                            Browse Gallery
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {media.length > 0 ? (
                            media.slice(0, 3).map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.05 }}
                                    className="aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-lg border border-white"
                                >
                                    <img src={item.url} className="h-full w-full object-cover" />
                                </motion.div>
                            ))
                        ) : (
                            [1, 2, 3].map((_, idx) => (
                                <div key={idx} className="aspect-square rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-slate-200" />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
