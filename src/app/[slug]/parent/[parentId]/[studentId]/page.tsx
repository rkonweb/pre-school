"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ParentHomeworkPage from "@/components/parent/ParentHomework";
import { PushNotificationButton } from "@/lib/push-notifications";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    BookOpen,
    Calendar,
    User,
    Loader2,
    ChevronLeft,
    Sparkles,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Utensils,
    Bus,
    Music,
    Palette,
    Trophy,
    Phone,
    Mail,
    MapPin,
    ShieldAlert,
    Info,
    ArrowRight,
    Star,
    Layers,
    Heart,
    MessageSquare,
    CreditCard,
    BellRing,
    CalendarDays,
    Settings2,
    Truck,
    Clock3,
    CheckCircle,
    LogOut,
    LayoutDashboard,
    UserCircle2,
    MessageCircle,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    getStudentAttendanceAction,
    getStudentReportsAction,
    getStudentDetailsAction,
    getStudentFeesAction,
    recordPaymentAction
} from "@/app/actions/parent-actions";
import { getDiaryEntriesForStudentAction, acknowledgeDiaryEntryAction } from "@/app/actions/diary-actions";
import { useParentData } from "@/context/parent-context";
import { toast } from "sonner";

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const { students, studentStats, isLoading: isContextLoading, school: schoolContext } = useParentData();

    const [activeTab, setActiveTab] = useState<"home" | "homework" | "calendar" | "profile" | "attendance" | "reports" | "fees" | "diary" | "timetable" | "notifications">("home");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Deep Data State
    const [fullStudent, setFullStudent] = useState<any>(null);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [fees, setFees] = useState<any>(null);
    const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [timetableDay, setTimetableDay] = useState("Monday");

    // Initial basic data from context
    const basicStudent = students.find((s: any) => s.id === studentId);
    const stats = studentStats[studentId];

    useEffect(() => {
        if (studentId && phone) {
            loadDeepData();
        }
    }, [studentId, phone]);

    useEffect(() => {
        // Set current day naturally
        setTimetableDay(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    }, []);

    const loadDeepData = async () => {
        setIsLoadingDetails(true);
        try {
            const [detailsRes, attendanceRes, reportsRes, feesRes, diaryRes] = await Promise.all([
                getStudentDetailsAction(studentId, phone),
                getStudentAttendanceAction(studentId, phone),
                getStudentReportsAction(studentId, phone),
                getStudentFeesAction(studentId, phone),
                getDiaryEntriesForStudentAction(studentId)
            ]);

            if (detailsRes.success) {
                setFullStudent(detailsRes.student);
            }
            if (attendanceRes.success) {
                setAttendanceLogs(attendanceRes.attendance || []);
            }
            if (reportsRes.success) {
                setReports(reportsRes.reports || []);
            }
            if (feesRes.success) {
                setFees(feesRes);
            }
            if (diaryRes.success) {
                setDiaryEntries(diaryRes.data || []);
            }
        } catch (error) {
            console.error("Failed to load details", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handlePayment = async (feeId: string) => {
        if (!fees?.fees) return;

        const fee = fees.fees.find((f: any) => f.id === feeId);
        if (!fee) return;

        const paid = fee.payments?.reduce((pSum: number, p: any) => pSum + p.amount, 0) || 0;
        const remainingAmount = fee.amount - paid;

        if (remainingAmount <= 0) {
            toast.error("Fee already paid");
            return;
        }

        const confirmed = window.confirm(
            `Proceed to pay ₹${remainingAmount.toLocaleString()} for ${fee.title}?`
        );

        if (!confirmed) return;

        toast.loading("Processing payment...", { id: "payment" });

        try {
            const result = await recordPaymentAction(
                feeId,
                remainingAmount,
                "ONLINE",
                `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                phone
            );

            if (!result.success) {
                throw new Error(result.error || "Payment failed");
            }

            toast.success("Payment successful!", { id: "payment" });

            // Reload deep data to refresh fees
            await loadDeepData();

        } catch (error: any) {
            toast.error(error.message || "Payment failed", { id: "payment" });
        }
    };

    if (isContextLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!basicStudent && !fullStudent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] p-4 text-center">
                <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
                <p className="text-slate-500 max-w-xs mt-2">We couldn't find the record for this student. Please check the URL or contact the school.</p>
                <Link href={`/${slug}/parent/${parentId}?phone=${phone}`} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // Merged Data
    const student = fullStudent || basicStudent;
    const brandColor = schoolContext?.brandColor || schoolContext?.primaryColor || "#3b82f6";
    const attendancePct = stats?.attendance?.percentage || student?.stats?.attendance?.percentage || 0;
    const feesDue = fees?.summary?.totalDue ?? (stats?.fees?.totalDue || student?.stats?.fees?.totalDue || 0);

    const classroom = student?.classroom;
    const teacher = classroom?.teacher;

    // Module Visibility Helpers
    const isModuleEnabled = (permissionKey: string) => {
        if (!schoolContext?.modulesConfig) return true; // Default to true if not set (legacy)
        try {
            const enabled = JSON.parse(schoolContext.modulesConfig);
            if (!Array.isArray(enabled)) return true;
            return enabled.includes(permissionKey);
        } catch (e) {
            return true;
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#F1F5F9] overflow-hidden text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
            {/* MOBILE-FIRST FLOATING HEADER */}
            <header className="px-5 pt-6 pb-4 shrink-0 z-40">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] px-5 py-4 border border-white/40 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.push(`/${slug}/parent/${parentId}?phone=${phone}`)}
                            className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{student.firstName}'s Portal</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <PushNotificationButton userId={parentId} userType="PARENT" />
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="h-10 w-10 rounded-2xl overflow-hidden bg-indigo-50 border-2 border-white shadow-sm"
                        >
                            <img
                                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
                                alt={student.firstName}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* IMMERSIVE SCROLLABLE CONTENT */}
            <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32">
                <div className="px-5 space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "home" && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* QUICK SUMMARY ISLAND */}
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group"
                                    >
                                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="h-24 w-24" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Attendance</p>
                                        <h3 className="text-3xl font-black">{attendancePct}%</h3>
                                        <p className="text-[9px] font-bold mt-2 bg-emerald-500/20 text-emerald-400 w-fit px-2 py-0.5 rounded-full">On Track</p>
                                    </motion.div>

                                    <motion.div
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveTab("fees")}
                                        className="bg-white rounded-[2.5rem] p-6 text-slate-900 shadow-xl shadow-slate-200 border border-white relative overflow-hidden group flex flex-col justify-between"
                                    >
                                        <div className="absolute -right-4 -bottom-4 text-rose-500 opacity-5 group-hover:scale-110 transition-transform">
                                            <CreditCard className="h-24 w-24" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fee Balance</p>
                                            <h3 className="text-3xl font-black text-rose-500 tracking-tighter">₹{feesDue.toLocaleString()}</h3>
                                        </div>
                                        <div className="mt-4">
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(fees?.summary?.totalPaid / (fees?.summary?.totalPaid + fees?.summary?.totalDue)) * 100 || 0}%` }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">₹{fees?.summary?.totalPaid.toLocaleString() || "0"} Paid</p>
                                                <p className="text-[8px] font-black text-rose-500 uppercase">Pay Now</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                { /* HORIZONTAL SHORTCUTS */}
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 flex-nowrap">
                                    {isModuleEnabled("diary") && (
                                        <ShortcutButton icon={BookOpen} label="HW" color="bg-blue-100 text-blue-600" onClick={() => setActiveTab("homework")} />
                                    )}
                                    {isModuleEnabled("students.attendance") && (
                                        <ShortcutButton icon={Clock} label="Log" color="bg-emerald-100 text-emerald-600" onClick={() => setActiveTab("attendance")} />
                                    )}
                                    {isModuleEnabled("communication") && (
                                        <ShortcutButton icon={BellRing} label="News" color="bg-amber-100 text-amber-600" onClick={() => setActiveTab("notifications")} />
                                    )}
                                    {isModuleEnabled("academics.reports") && (
                                        <ShortcutButton icon={Trophy} label="Rank" color="bg-purple-100 text-purple-600" onClick={() => setActiveTab("reports")} />
                                    )}
                                </div>

                                {/* FEED SECTION */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Pulse</h3>
                                        {diaryEntries.length > 0 && (
                                            <button onClick={() => setActiveTab("diary")} className="text-[10px] font-black text-indigo-600 uppercase">View All</button>
                                        )}
                                    </div>

                                    {/* Latest Diary Entries Feed */}
                                    {diaryEntries.length === 0 ? (
                                        <div className="bg-white rounded-[2rem] p-8 text-center border border-dashed border-slate-200">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">No recent activity</p>
                                        </div>
                                    ) : (
                                        diaryEntries.slice(0, 3).map((rec: any, idx) => (
                                            <motion.div
                                                key={rec.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setActiveTab("diary")}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white rounded-[2.2rem] p-5 shadow-sm border border-slate-100 flex gap-4 relative overflow-hidden group"
                                            >
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                                    rec.entry.type === "HOMEWORK" ? "bg-blue-50 text-blue-600" :
                                                        rec.entry.type === "ANNOUNCEMENT" ? "bg-indigo-50 text-indigo-600" :
                                                            rec.entry.type === "URGENT" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                                )}>
                                                    {rec.entry.type === "HOMEWORK" ? <BookOpen className="h-5 w-5" /> :
                                                        rec.entry.type === "ANNOUNCEMENT" ? <BellRing className="h-5 w-5" /> :
                                                            rec.entry.type === "URGENT" ? <AlertCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className="text-sm font-black text-slate-900 truncate uppercase mt-0.5">{rec.entry.title}</h4>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0 ml-2">{new Date(rec.entry.publishedAt || rec.entry.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium italic">"{rec.entry.content}"</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <img src={rec.entry.author.avatar || `https://ui-avatars.com/api/?name=${rec.entry.author.firstName}`} className="h-4 w-4 rounded-full border border-white" alt="author" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">{rec.entry.author.firstName} • {rec.entry.type}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}

                                    {/* Action Banner for Shortcuts */}
                                    {isModuleEnabled("academics.timetable") && (
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveTab("timetable")}
                                            className="bg-blue-600 rounded-[2.2rem] p-6 text-white relative overflow-hidden mt-2"
                                        >
                                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                                <Clock className="h-24 w-24" />
                                            </div>
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">Schedule Sync</p>
                                                    <h4 className="text-xl font-black">Today's Timeline</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">3 Periods • 1 Activity Room</p>
                                                </div>
                                                <ChevronRight className="h-6 w-6 text-slate-600" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Quick Contacts Island */}
                                    <div className="bg-white rounded-[2.2rem] p-6 border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={teacher?.avatar || `https://ui-avatars.com/api/?name=${teacher?.firstName || 'Teacher'}`} className="h-12 w-12 rounded-2xl object-cover shadow-lg" alt="" />
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">Ms. {teacher?.lastName || teacher?.firstName || 'Class'}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <motion.a whileTap={{ scale: 0.9 }} href={`tel:${teacher?.mobile}`} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 border border-slate-100">
                                                <Phone className="h-4 w-4" />
                                            </motion.a>
                                            <motion.div whileTap={{ scale: 0.9 }} className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 cursor-pointer">
                                                <MessageCircle className="h-4 w-4" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "diary" && (
                            <motion.div
                                key="diary"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/20 border border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Diary</h2>
                                            <p className="text-slate-500 font-medium text-sm">Notes and messages from teachers.</p>
                                        </div>
                                        <MessageSquare className="h-10 w-10 text-blue-100" />
                                    </div>

                                    <div className="space-y-6">
                                        {diaryEntries.length === 0 ? (
                                            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                                <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
                                                <p className="text-sm font-bold opacity-30">No diary entries yet.</p>
                                            </div>
                                        ) : (
                                            diaryEntries.map((rec, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={rec.id}
                                                    className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                                                                {rec.entry.author.firstName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-900">{rec.entry.author.firstName} {rec.entry.author.lastName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(rec.entry.publishedAt || rec.entry.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                            rec.entry.type === "HOMEWORK" ? "bg-purple-100 text-purple-600" :
                                                                rec.entry.type === "URGENT" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                                        )}>
                                                            {rec.entry.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 mb-2">{rec.entry.title}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{rec.entry.content}</p>
                                                    {rec.entry.requiresAck && !rec.isAcknowledged && (
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={async () => {
                                                                const res = await acknowledgeDiaryEntryAction(rec.id, student?.parentName || "Parent");
                                                                if (res.success) {
                                                                    // Update local state
                                                                    setDiaryEntries(prev => prev.map(d => d.id === rec.id ? { ...d, isAcknowledged: true } : d));
                                                                }
                                                            }}
                                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                        >
                                                            Acknowledge Receipt
                                                        </motion.button>
                                                    )}
                                                    {rec.isAcknowledged && (
                                                        <div className="flex items-center gap-2 text-emerald-600 mt-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Acknowledged</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "fees" && (
                            <motion.div
                                key="fees"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* FEES SUMMARY BOX (MOBILE STYLE) */}
                                <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-6 min-h-[220px]">
                                    {/* Decorative Ghost Card */}
                                    <div className="absolute -right-8 top-10 w-48 h-32 bg-white/5 rounded-3xl border border-white/10 rotate-12 -z-0 backdrop-blur-sm shadow-2xl" />
                                    <div className="absolute -right-4 top-14 w-48 h-32 bg-white/5 rounded-3xl border border-white/10 rotate-[20deg] -z-0 backdrop-blur-sm" />

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Fee Statement</p>

                                            <div className="flex items-end justify-between mb-10">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-400">Unpaid Balance</p>
                                                    <h2 className="text-5xl font-black tracking-tighter tabular-nums leading-none">₹{fees?.summary?.totalDue.toLocaleString() || "0"}</h2>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Total Paid</p>
                                                    <p className="text-2xl font-black tabular-nums">₹{fees?.summary?.totalPaid.toLocaleString() || "0"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5 backdrop-blur-md">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Pending Items</p>
                                                <p className="text-lg font-black">{fees?.summary?.pending || 0}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5 backdrop-blur-md">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Overdue</p>
                                                <p className="text-lg font-black text-rose-400">{fees?.summary?.overdue || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FEE INSTALLMENTS / SCHEDULE */}
                                <div className="space-y-4 mb-10">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Installment Schedule</h3>
                                    {fees?.fees?.length === 0 ? (
                                        <div className="bg-white rounded-[2rem] p-8 text-center border border-slate-100">
                                            <p className="text-slate-400 font-bold">No fee records found.</p>
                                        </div>
                                    ) : (
                                        fees?.fees?.map((fee: any) => (
                                            <div key={fee.id} className="bg-white rounded-[2.2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0",
                                                    fee.status === "PAID" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                        fee.status === "OVERDUE" ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-100 text-blue-600"
                                                )}>
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{fee.title}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest",
                                                            fee.status === "PAID" ? "text-emerald-500" : "text-rose-500"
                                                        )}>{fee.status}</span>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <p className="text-[10px] font-bold text-slate-400">Due {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">₹{fee.amount.toLocaleString()}</p>
                                                    {fee.status !== "PAID" && (
                                                        <button
                                                            onClick={() => handlePayment(fee.id)}
                                                            className="text-[9px] font-black text-indigo-600 uppercase mt-1 px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* RECENT TRANSACTIONS */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Recent Transactions</h3>
                                    {fees?.fees?.every((f: any) => !f.payments?.length) ? (
                                        <div className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-center bg-slate-50 rounded-2xl border border-dashed">
                                            No recent transactions found
                                        </div>
                                    ) : (
                                        fees?.fees?.flatMap((f: any) => f.payments || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((pay: any) => (
                                            <div key={pay.id} className="bg-white rounded-[2rem] p-4 border border-slate-50 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">Success Payment</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{pay.method} • {new Date(pay.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-emerald-600">+ ₹{pay.amount.toLocaleString()}</p>
                                                    <p className="text-[8px] font-medium text-slate-400">Ref: {pay.reference?.slice(0, 8) || "N/A"}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "timetable" && (
                            <motion.div
                                key="timetable"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-[3rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/20 border border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Class Timetable</h2>
                                            <p className="text-slate-500 font-medium text-sm">Weekly schedule for {classroom?.name}.</p>
                                        </div>
                                        <CalendarDays className="h-10 w-10 text-indigo-100" />
                                    </div>

                                    {(() => {
                                        // 1. Parse Timetable Configuration
                                        let periods = [];
                                        try {
                                            const rawConfig = fullStudent?.school?.timetableConfig;
                                            if (rawConfig) {
                                                const parsed = JSON.parse(rawConfig);
                                                periods = parsed.periods || [];
                                            }
                                        } catch (e) {
                                            console.error("Timetable config parse error:", e);
                                        }

                                        // Fallback if no config found (Default Default)
                                        if (periods.length === 0) {
                                            periods = [
                                                { id: "p1", name: "Period 1", startTime: "09:00", endTime: "09:45", type: "CLASS" },
                                                { id: "b1", name: "Break", startTime: "09:45", endTime: "10:00", type: "BREAK" },
                                                { id: "p2", name: "Period 2", startTime: "10:00", endTime: "10:45", type: "CLASS" },
                                                { id: "b2", name: "Lunch", startTime: "12:30", endTime: "01:30", type: "BREAK" },
                                                { id: "p3", name: "Period 3", startTime: "01:30", endTime: "02:15", type: "CLASS" },
                                            ];
                                        }

                                        // 2. Active Days Logic
                                        const allDaysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                        let activeDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]; // Default

                                        try {
                                            let sourceArray = null;

                                            // Check Column
                                            if (fullStudent?.school?.workingDays) {
                                                sourceArray = JSON.parse(fullStudent.school.workingDays);
                                            }
                                            // Check Config (Fallback)
                                            else if (fullStudent?.school?.timetableConfig) {
                                                const parsedConfig = JSON.parse(fullStudent.school.timetableConfig);
                                                if (Array.isArray(parsedConfig.workingDays)) {
                                                    sourceArray = parsedConfig.workingDays;
                                                }
                                            }

                                            if (Array.isArray(sourceArray) && sourceArray.length > 0) {
                                                activeDays = sourceArray.sort((a: string, b: string) =>
                                                    allDaysOrder.indexOf(a) - allDaysOrder.indexOf(b)
                                                );
                                            }
                                        } catch (e) {
                                            console.error("Working days parse error:", e);
                                        }

                                        // 3. Safety Check: Always include days that have actual schedule data
                                        const daysWithData = allDaysOrder.filter(day => {
                                            const dayData = classroom?.timetable?.[day];
                                            return dayData && Object.values(dayData).some((p: any) => p && (p.subject || p.teacherName));
                                        });

                                        // Merge Config Days + Data Days (Union)
                                        activeDays = Array.from(new Set([...activeDays, ...daysWithData])).sort((a: string, b: string) =>
                                            allDaysOrder.indexOf(a) - allDaysOrder.indexOf(b)
                                        );

                                        return (
                                            <>
                                                {/* Mobile Day Switcher */}
                                                <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
                                                    {activeDays.map(day => (
                                                        <button
                                                            key={day}
                                                            onClick={() => setTimetableDay(day)}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all",
                                                                timetableDay === day
                                                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105"
                                                                    : "bg-slate-50 text-slate-400 border border-slate-100"
                                                            )}
                                                        >
                                                            {day.slice(0, 3)}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Mobile Vertical List */}
                                                <div className="md:hidden space-y-3">
                                                    {periods.map((period: any, idx: number) => {
                                                        const slotData = classroom?.timetable?.[timetableDay]?.[period.id];

                                                        if (period.type === "BREAK") {
                                                            return (
                                                                <div key={period.id} className="flex items-center gap-4 py-2 opacity-50">
                                                                    <div className="w-20 text-[10px] font-black text-slate-400 text-right flex flex-col">
                                                                        <span>{period.startTime}</span>
                                                                        <span>{period.endTime}</span>
                                                                    </div>
                                                                    <div className="h-px flex-1 bg-slate-200 dashed-line"></div>
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{period.name}</span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={period.id} className="flex gap-4">
                                                                <div className="w-20 flex flex-col items-end pt-2 shrink-0">
                                                                    <span className="text-xs font-black text-slate-900 leading-none">{period.startTime}</span>
                                                                    <span className="text-[9px] font-bold text-slate-300 leading-none my-0.5">to</span>
                                                                    <span className="text-xs font-black text-slate-500 leading-none">{period.endTime}</span>
                                                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-1.5 text-right leading-tight">{period.name}</span>
                                                                </div>
                                                                <div className={cn(
                                                                    "flex-1 p-4 rounded-[1.5rem] border transition-all relative flex flex-col justify-center items-center min-h-[6rem]",
                                                                    slotData
                                                                        ? "bg-white border-slate-100 shadow-lg shadow-slate-100/50"
                                                                        : "bg-slate-50 border-transparent border-dashed"
                                                                )}>
                                                                    {slotData ? (
                                                                        <>
                                                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight text-center z-10">{slotData.subject}</h4>
                                                                            <div className="absolute bottom-3 right-4">
                                                                                <p className="text-[10px] font-normal text-slate-500">{slotData.teacherName || "Assigned Teacher"}</p>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-slate-300">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span className="text-xs font-bold uppercase tracking-wider">Free Period</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Desktop Grid View */}
                                                <div className="hidden md:block overflow-x-auto no-scrollbar pb-4">
                                                    <div className="min-w-[700px]">
                                                        {/* Days Header */}
                                                        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `100px repeat(${activeDays.length}, 1fr)` }}>
                                                            <div className="h-12 flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest">Time</div>
                                                            {activeDays.map(day => (
                                                                <div key={day} className="h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-[11px] text-white uppercase tracking-widest shadow-lg shadow-slate-200">{day}</div>
                                                            ))}
                                                        </div>

                                                        {/* Daily Slots */}
                                                        {periods.map((period: any, idx: number) => (
                                                            <div key={period.id} className="grid gap-4 mb-4" style={{ gridTemplateColumns: `100px repeat(${activeDays.length}, 1fr)` }}>
                                                                <div className="bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 p-1">
                                                                    <span className="text-[9px] font-black text-slate-900 leading-none">{period.startTime}</span>
                                                                    <div className="h-px w-3 bg-slate-200 my-0.5"></div>
                                                                    <span className="text-[9px] font-black text-slate-500 leading-none">{period.endTime}</span>
                                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{period.name}</span>
                                                                </div>
                                                                {period.type === "BREAK" ? (
                                                                    <div
                                                                        className="bg-zinc-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-200/50"
                                                                        style={{ gridColumn: "2 / -1" }}
                                                                    >
                                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">{period.name}</span>
                                                                    </div>
                                                                ) : (
                                                                    activeDays.map(day => {
                                                                        const slotData = classroom?.timetable?.[day]?.[period.id];
                                                                        return (
                                                                            <div key={day} className={cn(
                                                                                "p-3 rounded-2xl border transition-all hover:scale-[1.05] hover:shadow-xl group relative flex flex-col items-center justify-center min-h-[5rem]",
                                                                                slotData ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-transparent"
                                                                            )}>
                                                                                {slotData ? (
                                                                                    <>
                                                                                        <p className="text-[11px] font-black text-slate-900 leading-tight text-center uppercase group-hover:text-blue-600 transition-colors z-10">{slotData.subject}</p>
                                                                                        <div className="absolute bottom-2 right-3">
                                                                                            <p className="text-[9px] font-normal text-slate-400">{slotData.teacherName || "Assigned"}</p>
                                                                                        </div>
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="text-[9px] font-bold text-slate-200">Free</span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "notifications" && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-indigo-600 rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-20 rotate-12">
                                        <BellRing className="h-48 w-48" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black mb-2 tracking-tight">Notice Board</h2>
                                        <p className="text-indigo-100 font-medium">Important announcements and updates.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {diaryEntries.filter(d => d.entry.type === "ANNOUNCEMENT").length === 0 ? (
                                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100">
                                            <BellRing className="h-16 w-16 mx-auto mb-4 text-slate-100" />
                                            <p className="text-slate-400 font-bold">No active announcements.</p>
                                        </div>
                                    ) : (
                                        diaryEntries.filter(d => d.entry.type === "ANNOUNCEMENT").map((rec, i) => (
                                            <motion.div
                                                key={rec.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white rounded-[2.2rem] p-8 border border-slate-100 shadow-lg relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 h-2 w-full bg-indigo-500" />
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Broadcast</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">{new Date(rec.entry.publishedAt || rec.entry.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 mb-2">{rec.entry.title}</h3>
                                                <p className="text-slate-600 leading-relaxed mb-6">{rec.entry.content}</p>
                                                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                                                        BB
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Administration</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "attendance" && (
                            <motion.div
                                key="attendance"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/30 border border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Timeline</h2>
                                            <p className="text-slate-500 font-medium text-sm">Historical attendance and event log.</p>
                                        </div>
                                        <div className="h-20 w-20 flex items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-50/20">
                                            <span className="text-xl font-black text-emerald-600">{attendancePct}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {isLoadingDetails && attendanceLogs.length === 0 ? (
                                            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                                <Loader2 className="animate-spin h-10 w-10 mb-4" />
                                                <p className="text-xs font-bold uppercase tracking-widest">Syncing Records...</p>
                                            </div>
                                        ) : (
                                            <>
                                                {attendanceLogs.map((record, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        key={i}
                                                        className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 transition-all hover:shadow-lg group"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-14 w-14 rounded-[1.2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                <span className="text-[10px] font-black uppercase opacity-50">{new Date(record.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                                                <span className="text-xl font-black leading-none mt-1">{new Date(record.date).getDate()}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 text-sm">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {record.status}</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                                            record.status === "PRESENT" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                record.status === "ABSENT" ? "bg-rose-50 text-rose-500 border-rose-100" :
                                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                        )}>
                                                            {record.status}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {attendanceLogs.length === 0 && (
                                                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                                        <Clock className="h-16 w-16 mb-4 opacity-10" />
                                                        <p className="text-sm font-bold opacity-30">No history available yet.</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "homework" && (
                            <motion.div
                                key="homework"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <ParentHomeworkPage studentId={studentId} parentId={parentId} />
                            </motion.div>
                        )}

                        {activeTab === "reports" && (
                            <motion.div
                                key="reports"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/30 border border-slate-100">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports</h2>
                                            <p className="text-slate-500 font-medium text-sm">Official assessment results.</p>
                                        </div>
                                        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Trophy className="h-8 w-8" />
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        {isLoadingDetails && reports.length === 0 ? (
                                            <div className="py-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-slate-200" /></div>
                                        ) : (
                                            <>
                                                {reports.map((report: any) => (
                                                    <div key={report.id} className="bg-slate-50 rounded-[2.2rem] p-8 border border-white hover:bg-white hover:shadow-xl transition-all group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:scale-125">
                                                            <Trophy className="h-24 w-24" />
                                                        </div>
                                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                                            <div>
                                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Academic Result</p>
                                                                <h3 className="text-2xl font-black text-slate-900">{report.term}</h3>
                                                            </div>
                                                            <button className="h-10 w-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
                                                                <FileText className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 relative z-10">
                                                            {Object.entries(JSON.parse(report.marks || "{}")).map(([sub, grade]: any) => (
                                                                <div key={sub} className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 flex items-center justify-between">
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sub}</span>
                                                                    <span className="text-sm font-black text-slate-900 px-2.5 py-0.5 bg-slate-100 rounded-lg">{grade}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {report.comments && (
                                                            <div className="mt-8 pt-6 border-t border-slate-200/50">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Sparkles className="h-3 w-3 text-amber-400" />
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher's Remarks</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                                                                    "{report.comments}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {reports.length === 0 && (
                                                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                                        <FileText className="h-16 w-16 mb-4 opacity-10" />
                                                        <p className="text-sm font-bold opacity-30">No reports available as of now.</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/20 border border-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                                        <User className="h-64 w-64" />
                                    </div>

                                    <div className="flex flex-col items-center mb-10 text-center">
                                        <div className="h-28 w-28 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden mb-6">
                                            <img
                                                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
                                                alt={student.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{student.firstName} {student.lastName}</h2>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">Student ID: {student.admissionNumber || "N/A"}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <ProfileRow label="Class / Section" value={classroom?.name || "N/A"} icon={Layers} color="text-indigo-600" bg="bg-indigo-50" />
                                        <ProfileRow label="Birth Date" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} icon={Calendar} color="text-amber-600" bg="bg-amber-50" />
                                        <ProfileRow label="Blood Type" value={student.bloodGroup || "O+"} icon={Heart} color="text-rose-600" bg="bg-rose-50" />
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Management</p>
                                        <ActionRow
                                            label="Change Student"
                                            icon={Home}
                                            onClick={() => router.push(`/${slug}/parent/${parentId}?phone=${phone}`)}
                                        />
                                        <ActionRow
                                            label="Logout Portal"
                                            icon={LogOut}
                                            variant="danger"
                                            onClick={() => router.push("/parent-login")}
                                        />
                                    </div>
                                </div>

                                <div className="p-10 text-center">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        School Contact Support<br />+91 {schoolContext?.phone || "99999 00000"}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[100]">
                <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] p-2.5 shadow-2xl shadow-indigo-500/20 border border-white/10 flex items-center justify-around">
                    <BottomNavItem id="home" label="Home" icon={LayoutDashboard} active={activeTab} onClick={setActiveTab} />
                    {isModuleEnabled("diary") && (
                        <BottomNavItem id="diary" label="Diary" icon={MessageSquare} active={activeTab} onClick={setActiveTab} badge={diaryEntries.length} />
                    )}
                    {isModuleEnabled("billing") && (
                        <BottomNavItem id="fees" label="Fees" icon={CreditCard} active={activeTab} onClick={setActiveTab} />
                    )}
                    {isModuleEnabled("academics.timetable") && (
                        <BottomNavItem id="timetable" label="Time" icon={CalendarDays} active={activeTab} onClick={setActiveTab} />
                    )}
                    <BottomNavItem id="profile" label="Me" icon={UserCircle2} active={activeTab} onClick={setActiveTab} />
                </div>
            </nav>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                html, body { overflow: hidden; height: 100%; position: fixed; width: 100%; }
            `}</style>
        </div>
    );
}

// Mobile Components Atoms

function BottomNavItem({ id, label, icon: Icon, active, onClick, badge }: any) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className="relative flex flex-col items-center justify-center w-16 h-14 gap-1 group"
        >
            <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40" : "text-slate-500 hover:text-slate-300"
            )}>
                <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
                isActive ? "text-indigo-400" : "text-slate-500"
            )}>
                {label}
            </span>
            {badge > 0 && (
                <span className="absolute top-1 right-2 h-4 w-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                    {badge}
                </span>
            )}
        </button>
    );
}

function ShortcutButton({ icon: Icon, label, color, onClick }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex flex-col items-center gap-2 shrink-0 group"
        >
            <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center text-2xl shadow-sm transition-shadow group-hover:shadow-md", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
        </motion.button>
    );
}

function ProfileRow({ label, value, icon: Icon, color, bg }: any) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-slate-900 leading-none">{value}</p>
            </div>
        </div>
    );
}

function ActionRow({ label, icon: Icon, onClick, variant = "default" }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                variant === "danger" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600 shadow-sm border border-slate-100"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-30" />
        </button>
    );
}

// Existing Core Components

function ScheduleItem({ time, subject, icon: Icon, color, bg }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="min-w-[45px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</p>
            </div>
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="font-black text-slate-900 text-xs truncate uppercase tracking-wide">{subject}</p>
        </div>
    );
}

function ProgressStat({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-[11px] font-black text-slate-900">{value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-sm", color)}
                />
            </div>
        </div>
    );
}

function ProfileField({ label, value, icon: Icon }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-10 w-10 flex-shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function TabButton({ id, label, active, onClick, icon: Icon }: any) {
    // Kept for backward compat in UI logic if needed
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "flex-shrink-0 flex items-center gap-2.5 px-6 py-4 rounded-[1.3rem] text-[11px] font-black uppercase tracking-widest transition-all",
                isActive
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-300")} />
            {label}
        </button>
    );
}
