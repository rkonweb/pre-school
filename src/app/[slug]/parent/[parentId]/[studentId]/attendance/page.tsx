"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Clock, CheckCircle2, XCircle, AlertCircle, Plus, FileText, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getStudentAttendanceStatsAction,
    getStudentLeaveRequestsAction,
    createStudentLeaveRequestAction,
    cancelStudentLeaveRequestAction
} from "@/app/actions/student-attendance-actions";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { PageWrapper, StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";
import { useSearchParams } from "next/navigation";

export default function AttendancePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const [activeTab, setActiveTab] = useState<"calendar" | "leaves">("calendar");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [studentId, currentMonth, activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "calendar") {
                const res = await getStudentAttendanceStatsAction(
                    studentId,
                    currentMonth.getMonth(),
                    currentMonth.getFullYear()
                );
                if (res.success) setAttendanceData(res.data);
            } else {
                const res = await getStudentLeaveRequestsAction(studentId);
                if (res.success) setLeaveRequests(res.data || []);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            {/* Header */}
            <StickyHeader
                title="Attendance"
                showBell={true}
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            >
                {/* Tabs */}
                <div className="flex p-1.5 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
                    <TabButton
                        active={activeTab === "calendar"}
                        onClick={() => setActiveTab("calendar")}
                        label="Calendar"
                        icon={CalendarIcon}
                    />
                    <TabButton
                        active={activeTab === "leaves"}
                        onClick={() => setActiveTab("leaves")}
                        label="Leaves"
                        icon={FileText}
                    />
                </div>
            </StickyHeader>

            <main className="px-5 flex-1 relative z-0">
                <AnimatePresence mode="wait">
                    {activeTab === "calendar" ? (
                        <CalendarView
                            key="calendar"
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            data={attendanceData}
                            isLoading={isLoading}
                        />
                    ) : (
                        <LeavesView
                            key="leaves"
                            requests={leaveRequests}
                            isLoading={isLoading}
                            onRequestNew={() => setIsRequestModalOpen(true)}
                            onCancel={(id) => {
                                // Optimistic
                                setLeaveRequests(prev => prev.filter(r => r.id !== id));
                                cancelStudentLeaveRequestAction(id);
                                toast.success("Leave request cancelled");
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Request Modal */}
            <AnimatePresence>
                {isRequestModalOpen && (
                    <LeaveRequestModal
                        studentId={studentId}
                        onClose={() => setIsRequestModalOpen(false)}
                        onSuccess={() => {
                            setIsRequestModalOpen(false);
                            loadData();
                        }}
                    />
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}

// --- SUB COMPONENTS ---

function TabButton({ active, onClick, label, icon: Icon }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all",
                active ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-400 hover:bg-slate-50"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function CalendarView({ currentMonth, setCurrentMonth, data, isLoading }: any) {
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const isToday = (date: Date) => isSameDay(date, new Date());

    const getStatus = (date: Date) => {
        if (!data) return null;
        const dateStr = format(date, "yyyy-MM-dd");
        // Check present
        if (data.presentDates?.some((d: string) => d.startsWith(dateStr))) return "PRESENT";
        // Check absent
        if (data.absentDates?.some((d: string) => d.startsWith(dateStr))) return "ABSENT";
        // Check late
        if (data.lateDates?.some((d: string) => d.startsWith(dateStr))) return "LATE";
        // Check holiday
        if (data.holidays?.some((d: string) => d.startsWith(dateStr))) return "HOLIDAY";
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Present" value={data?.stats?.present || 0} color="emerald" icon={CheckCircle2} />
                <StatCard label="Absent" value={data?.stats?.absent || 0} color="rose" icon={XCircle} />
                <StatCard label="Late" value={data?.stats?.late || 0} color="amber" icon={Clock} />
            </div>

            {/* Calendar Widget */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden border border-white/60">
                <div className="p-6 flex items-center justify-between border-b border-white/50 bg-gradient-to-r from-slate-50/50 to-white/50">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-white/50 hover:bg-white shadow-sm rounded-xl transition-all border border-white">
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {format(currentMonth, "MMMM yyyy")}
                    </h3>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-white/50 hover:bg-white shadow-sm rounded-xl transition-all border border-white">
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>

                <div className="p-6 bg-white/40">
                    <div className="grid grid-cols-7 mb-4 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                        {/* Empty cells for start of month */}
                        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {days.map((day, i) => {
                            const status = getStatus(day);
                            const today = isToday(day);

                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={cn(
                                        "h-10 w-10 sm:h-12 sm:w-12 rounded-[14px] flex items-center justify-center text-sm font-bold transition-all relative border border-transparent shadow-sm",
                                        today ? "bg-slate-900 text-white shadow-lg scale-110 z-10 border-slate-700" : "bg-white/60 text-slate-600 hover:bg-white border-white/40 shadow-slate-200/50",
                                        status === "PRESENT" && !today && "bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-emerald-100/20",
                                        status === "ABSENT" && !today && "bg-rose-50 text-rose-700 border-rose-100/50 shadow-rose-100/20",
                                        status === "LATE" && !today && "bg-amber-50 text-amber-700 border-amber-100/50 shadow-amber-100/20",
                                        status === "HOLIDAY" && !today && "bg-purple-50 text-purple-700 border-purple-100/50 shadow-purple-100/20"
                                    )}>
                                        {format(day, "d")}
                                        {status && (
                                            <div className={cn(
                                                "absolute -bottom-1.5 h-1.5 w-1.5 rounded-full border border-white ring-1 ring-black/5 shadow-sm",
                                                status === "PRESENT" && "bg-emerald-500",
                                                status === "ABSENT" && "bg-rose-500",
                                                status === "LATE" && "bg-amber-500",
                                                status === "HOLIDAY" && "bg-purple-500"
                                            )} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, color, icon: Icon }: any) {
    const colors: any = {
        emerald: "bg-emerald-500 shadow-emerald-200 border-emerald-400",
        rose: "bg-rose-500 shadow-rose-200 border-rose-400",
        amber: "bg-amber-500 shadow-amber-200 border-amber-400",
    };

    return (
        <div className={cn("rounded-[2rem] p-5 flex flex-col items-center text-center shadow-lg text-white border transition-transform hover:scale-105", colors[color])}>
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter leading-none mb-1 text-white">{value}</span>
            <span className="text-[9px] uppercase font-black opacity-90 tracking-widest text-white/90">{label}</span>
        </div>
    );
}

function LeavesView({ requests, isLoading, onRequestNew, onCancel }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            <button
                onClick={onRequestNew}
                className="w-full py-4 rounded-[2rem] bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <Plus className="h-5 w-5" />
                Request Leave
            </button>

            <div className="space-y-3">
                {requests.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-xs font-bold bg-white rounded-[2rem] border border-dashed border-slate-200">
                        No active leave requests.
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <div key={req.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">{req.reason}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                        {format(new Date(req.startDate), "MMM d")} - {format(new Date(req.endDate), "MMM d, yyyy")}
                                    </p>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                    req.status === "APPROVED" && "bg-emerald-100 text-emerald-700",
                                    req.status === "PENDING" && "bg-amber-100 text-amber-700",
                                    req.status === "REJECTED" && "bg-rose-100 text-rose-700"
                                )}>
                                    {req.status}
                                </span>
                            </div>
                            {req.status === "PENDING" && (
                                <button
                                    onClick={() => onCancel(req.id)}
                                    className="mt-3 text-[10px] font-bold text-rose-500 hover:text-rose-600 underline decoration-rose-200 underline-offset-4"
                                >
                                    Cancel Request
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}

function LeaveRequestModal({ studentId, onClose, onSuccess }: any) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) {
            toast.error("Please fill all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createStudentLeaveRequestAction({
                studentId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                type: "SICK" // Default for now
            });
            if (res.success) {
                toast.success("Request sent successfully");
                onSuccess();
            } else {
                toast.error("Failed to send request");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900">New Leave Request</h3>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">From</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-slate-200"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">To</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-slate-200"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reason</label>
                        <textarea
                            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-slate-200 resize-none h-24"
                            placeholder="Sick leave, Family event..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

