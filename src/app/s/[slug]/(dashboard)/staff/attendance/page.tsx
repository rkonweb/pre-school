"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Clock,
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    BarChart3,
    UserCheck,
    Briefcase,
    TrendingUp,
    Timer,
    FileText,
    Check,
    X,
    LogIn,
    LogOut,
    PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, isSameDay, isToday, addDays, subDays } from "date-fns";
import { SlideOver } from "@/components/ui/SlideOver";
import { AvatarWithAdjustment } from "@/components/dashboard/staff/AvatarWithAdjustment";

// Actions
import { getStaffAction } from "@/app/actions/staff-actions";
import {
    getStaffAttendanceAction,
    togglePunchAction,
    markStaffAttendanceAction,
    getStaffLeaveRequestsAction,
    createLeaveRequestAction,
    updateLeaveStatusAction,
    getAttendanceAnalyticsAction
} from "@/app/actions/attendance-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";

type TabType = "daily" | "leaves" | "analytics";

export default function StaffAttendancePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [activeTab, setActiveTab] = useState<TabType>("daily");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Data states
    const [staff, setStaff] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null); // New state for RBAC UI

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, [slug, selectedDate]);

    async function loadInitialData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        try {
            const [staffRes, attRes, leaveRes, analyticsRes] = await Promise.all([
                getStaffAction(slug),
                getStaffAttendanceAction(slug, selectedDate.toISOString()),
                getStaffLeaveRequestsAction(slug),
                getAttendanceAnalyticsAction(slug, selectedDate.getMonth(), selectedDate.getFullYear())
            ]);

            if (staffRes.success) setStaff(staffRes.data || []);
            if (attRes.success) setAttendance(attRes.data || []);
            if (leaveRes.success) setLeaves(leaveRes.data || []);
            if (leaveRes.success) setLeaves(leaveRes.data || []);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);

            // Fetch current user for UI permission logic
            const userRes = await getCurrentUserAction();
            if (userRes.success) setCurrentUser(userRes.data);

        } catch (error) {
            console.error("Load Error:", error);
            toast.error("Failed to load attendance data");
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }

    const filteredStaff = useMemo(() => {
        return staff.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.designation || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [staff, searchTerm]);

    async function handleTogglePunch(userId: string) {
        // Optimistic Update Setup
        const now = new Date();
        const timestamp = now.toISOString();

        // Calculate optimistic state
        let isCurrentlyIn = false;
        setAttendance(prev => {
            const existingIndex = prev.findIndex(a => a.userId === userId);

            if (existingIndex >= 0) {
                const updated = [...prev];
                const record = { ...updated[existingIndex] };
                const lastPunch = record.punches?.[record.punches.length - 1];

                // Determine new type based on last punch
                const newType = (!lastPunch || lastPunch.type === 'OUT') ? 'IN' : 'OUT';
                isCurrentlyIn = newType === 'IN';

                record.punches = [
                    ...(record.punches || []),
                    { type: newType, timestamp, id: `optimistic-${Date.now()}` }
                ];

                // Optimistically update status
                if (newType === 'IN') {
                    // If purely optimistic, status logic might be complex, but for UI feedback immediate punch list update is key
                    if (record.status === 'ABSENT' || !record.status) record.status = 'PRESENT';
                }

                updated[existingIndex] = record;
                return updated;
            } else {
                // New record
                isCurrentlyIn = true;
                return [...prev, {
                    userId,
                    punches: [{ type: 'IN', timestamp, id: `optimistic-${Date.now()}` }],
                    status: 'PRESENT',
                    totalHours: 0,
                    minPunchGapMins: 0 // Will be corrected on reload, but prevents undefined
                }];
            }
        });

        toast.success(isCurrentlyIn ? "Punched In" : "Punched Out");

        try {
            const res = await togglePunchAction(slug, userId, selectedDate.toISOString());
            if (!res.success) {
                toast.error(res.error || "Failed to sync punch");
                // Revert is handled by reloading data on error
                loadInitialData(false);
            } else {
                // Silently re-validate to ensure hours/consistency
                loadInitialData(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error");
            loadInitialData(false);
        }
    }

    async function handleQuickStatus(userId: string, status: string) {
        const res = await markStaffAttendanceAction(slug, {
            userId,
            date: selectedDate.toISOString(),
            status
        });
        if (res.success) {
            toast.success(`Marked as ${status}`);
            loadInitialData(false);
        }
    }

    async function handleLeaveStatus(id: string, status: string) {
        const res = await updateLeaveStatusAction(slug, id, status);
        if (res.success) {
            toast.success(`Leave request ${status.toLowerCase()}`);
            loadInitialData(false);
        }
    }

    async function handleLeaveSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            userId: formData.get("userId") as string,
            startDate: formData.get("startDate") as string,
            endDate: formData.get("endDate") as string,
            type: formData.get("type") as string,
            reason: formData.get("reason") as string,
        };

        const res = await createLeaveRequestAction(slug, data);
        if (res.success) {
            toast.success("Leave request submitted");
            setIsFormOpen(false);
            loadInitialData(false);
        } else {
            toast.error(res.error || "Failed to submit request");
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header section with Tabs */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic">
                        Staff <span className="text-brand">Attendance</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Real-time tracking, leave management, and punctuality logs.</p>
                </div>

                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
                    <TabButton active={activeTab === "daily"} onClick={() => setActiveTab("daily")} label="Daily Log" icon={<Clock className="h-4 w-4" />} />
                    <TabButton active={activeTab === "leaves"} onClick={() => setActiveTab("leaves")} label="Leaves" icon={<Briefcase className="h-4 w-4" />} />
                    {(currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN") && (
                        <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} label="Analytics" icon={<BarChart3 className="h-4 w-4" />} />
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Present Today"
                    value={attendance.filter(a => ["PRESENT", "LATE"].includes(a.status)).length.toString()}
                    icon={<UserCheck className="h-5 w-5" />}
                    color="text-emerald-600"
                    bg="bg-emerald-50 dark:bg-emerald-950/20"
                />
                <StatCard
                    title="Expected"
                    value={staff.length.toString()}
                    icon={<UsersIcon className="h-5 w-5" />}
                    color="text-zinc-600"
                    bg="bg-zinc-50 dark:bg-zinc-900"
                />
                <StatCard
                    title="Punctuality Score"
                    value={`${analytics?.totalPresent ? Math.round(((analytics.totalPresent - analytics.totalLate) / analytics.totalPresent) * 100) : 100}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="text-purple-600"
                    bg="bg-purple-50 dark:bg-purple-950/20"
                />
                <StatCard
                    title="Late/Half-Day"
                    value={attendance.filter(a => ["LATE", "HALF_DAY"].includes(a.status)).length.toString()}
                    icon={<AlertCircle className="h-5 w-5" />}
                    color="text-amber-600"
                    bg="bg-amber-50 dark:bg-amber-950/20"
                />
                <StatCard
                    title="Active Leaves"
                    value={leaves.filter(l => l.status === "APPROVED" && isSameDay(new Date(l.startDate), new Date())).length.toString()}
                    icon={<Briefcase className="h-5 w-5" />}
                    color="text-brand"
                    bg="bg-brand/10"
                />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                {activeTab === "daily" && (
                    <div className="p-0">
                        {/* Control Bar */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-zinc-50/30 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-2xl p-1 shadow-sm">
                                    <button
                                        onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="px-6 py-2 text-sm font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                                        <CalendarIcon className="h-4 w-4 text-brand" />
                                        {format(selectedDate, "EEEE, dd MMM yyyy")}
                                    </div>
                                    <button
                                        onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                                        disabled={isToday(selectedDate)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelectedDate(new Date())}
                                    className="text-[10px] font-black uppercase tracking-widest text-brand border border-brand/20 dark:border-brand/50 px-3 py-1.5 rounded-full hover:bg-brand/5 transition-all"
                                >
                                    Today
                                </button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-brand transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search staff members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all w-full md:w-80 shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 border-b dark:border-zinc-800">
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px]">Emp Details</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px]">Punch In</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px]">Punch Out</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px]">Worked</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px]">Status</th>
                                        <th className="px-8 py-5 font-black uppercase tracking-tighter text-[11px] text-right">Activity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-8 py-10"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredStaff.map((person) => {
                                        const attRecord = attendance.find(a => a.userId === person.id);
                                        return (
                                            <tr
                                                key={person.id}
                                                className="group hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/s/${slug}/staff/${person.id}/attendance`)}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <AvatarWithAdjustment
                                                            src={person.avatar}
                                                            adjustment={person.avatarAdjustment}
                                                            className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm"
                                                        />
                                                        <div>
                                                            <div className="font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{person.firstName} {person.lastName}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-brand mt-0.5">{person.designation || "Staff"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-xs font-black text-zinc-700 dark:text-zinc-300">
                                                            {attRecord?.punches?.[0] ? format(new Date(attRecord.punches[0].timestamp), "hh:mm a") : "--:--"}
                                                        </span>
                                                        {attRecord?.punches?.length > 0 && (
                                                            <span className="text-[10px] text-zinc-400 font-medium italic">First In</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-xs font-black text-zinc-700 dark:text-zinc-300">
                                                            {attRecord?.punches?.[attRecord.punches.length - 1]?.type === "OUT"
                                                                ? format(new Date(attRecord.punches[attRecord.punches.length - 1].timestamp), "hh:mm a")
                                                                : "--:--"}
                                                        </span>
                                                        {attRecord?.punches?.[attRecord.punches.length - 1]?.type === "OUT" && (
                                                            <span className="text-[10px] text-zinc-400 font-medium italic">Last Out</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                                                            {attRecord?.totalHours?.toFixed(1) || "0.0"} hrs
                                                        </span>
                                                        <div className="h-1 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className="h-full bg-brand transition-all duration-700"
                                                                style={{ width: `${Math.min(((attRecord?.totalHours || 0) / 9) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <StatusBadge status={attRecord?.status || "PENDING"} />
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                                                        {(() => {
                                                            const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
                                                            const isSelf = currentUser?.id === person.id;

                                                            if (!isAdmin && !isSelf) return null; // Hide controls for others unless Admin

                                                            return (
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <PunchSwitch
                                                                        isIn={attRecord?.punches?.length > 0 && attRecord.punches[attRecord.punches.length - 1].type === "IN"}
                                                                        onClick={() => handleTogglePunch(person.id)}
                                                                        isLoading={false}
                                                                        lastPunchTime={attRecord?.punches?.length > 0 ? (attRecord.punches[attRecord.punches.length - 1].timestamp) : null}
                                                                        minGapMins={attRecord?.minPunchGapMins || 0}
                                                                    />

                                                                    {attRecord?.punches?.length > 0 && (
                                                                        <button
                                                                            onClick={() => handleQuickStatus(person.id, "PENDING")}
                                                                            className="ml-3 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                                                            title="Clear all logs"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}

                                                    </div >
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "leaves" && (
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight italic">Leave <span className="text-brand">Requests</span></h2>
                                <p className="text-sm text-zinc-500 font-medium">Review applications and manage time-off pipeline.</p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="flex items-center gap-2.5 bg-brand dark:bg-zinc-50 text-[var(--secondary-color)] dark:text-zinc-900 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand/10 transition-all hover:brightness-110 hover:-translate-y-0.5"
                            >
                                <PlusCircle className="h-4 w-4" />
                                New Application
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {leaves.length === 0 ? (
                                <div className="md:col-span-2 text-center py-32 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-[2rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
                                    <FileText className="h-16 w-16 text-zinc-200 mx-auto" />
                                    <p className="mt-4 text-zinc-500 font-black uppercase tracking-widest text-xs">No active request backlog</p>
                                </div>
                            ) : (
                                leaves.map((leave) => (
                                    <div key={leave.id} className="group relative bg-white dark:bg-zinc-800/40 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-brand/40 dark:hover:border-brand/60 transition-all hover:shadow-brand/5">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-3xl bg-brand/10 flex items-center justify-center text-brand">
                                                        <Briefcase className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{leave.user.firstName} {leave.user.lastName}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{leave.type}</span>
                                                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand italic">Requested on {format(new Date(leave.createdAt), "dd MMM")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={leave.status} />
                                            </div>

                                            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border dark:border-zinc-800">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                                    <span>Period</span>
                                                    <span className="text-zinc-900 dark:text-zinc-200 italic">{format(new Date(leave.startDate), "dd MMM")} - {format(new Date(leave.endDate), "dd MMM")}</span>
                                                </div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">"{leave.reason}"</p>
                                            </div>

                                            {leave.status === "PENDING" && (
                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleLeaveStatus(leave.id, "APPROVED")}
                                                        className="flex-1 py-3.5 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleLeaveStatus(leave.id, "REJECTED")}
                                                        className="flex-1 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="p-10 space-y-12">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter uppercase italic">Monthly <span className="text-brand font-black">Performance</span></h2>
                            <p className="text-zinc-500 font-medium uppercase tracking-[0.1em] text-xs">Dynamic insights based on real-time activity tracking.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 border-l-4 border-brand pl-4 py-1">Attendance Breakdown</h3>
                                <div className="space-y-6">
                                    <AnalyticsProgress label="Total Presences" value={analytics?.totalPresent || 0} max={25} color="bg-emerald-500" />
                                    <AnalyticsProgress label="Late Arrivals" value={analytics?.totalLate || 0} max={25} color="bg-amber-500" />
                                    <AnalyticsProgress label="Absences" value={analytics?.totalLeaves || 0} max={25} color="bg-red-500" />
                                </div>
                            </div>

                            <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 group transition-all hover:bg-zinc-950 shadow-2xl">
                                <TrendingUp className="h-10 w-10 text-emerald-500 mb-6 transition-transform group-hover:scale-125" />
                                <h3 className="text-xl font-black text-white italic tracking-tight">System Trends</h3>
                                <p className="text-sm text-zinc-500 font-medium mt-2 leading-relaxed tracking-tight">
                                    Overall punctuality index is at <span className="text-emerald-500 font-black">94.2%</span>.
                                    Average team check-in time is <span className="text-zinc-200 font-bold">09:12 AM</span>.
                                </p>

                                <div className="mt-12 flex items-end justify-between gap-4 h-40">
                                    {[30, 75, 45, 100, 80, 60, 45].map((val, i) => (
                                        <div key={i} className="flex-1 bg-zinc-800 rounded-2xl relative group/bar overflow-hidden hover:bg-zinc-700 transition-all cursor-pointer" style={{ height: `${val}%` }}>
                                            <div className="absolute inset-0 bg-brand/30 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Leave Application SlideOver */}
            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Apply for Leave"
            >
                <form onSubmit={handleLeaveSubmit} className="space-y-8 p-1">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Staff Member</label>
                        <select name="userId" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand">
                            <option value="">Select Employee</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Start Date</label>
                            <input type="date" name="startDate" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">End Date</label>
                            <input type="date" name="endDate" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Leave Type</label>
                        <select name="type" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand">
                            <option value="PLANNED">Planned Leave</option>
                            <option value="SICK">Sick Leave</option>
                            <option value="UNPLANNED">Unplanned / Casual</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Reason</label>
                        <textarea
                            name="reason"
                            required
                            placeholder="Briefly describe why you are applying..."
                            className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 rounded-2xl bg-brand text-[var(--secondary-color)] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand/30 transition-all hover:brightness-110 hover:-translate-y-1 active:scale-95"
                    >
                        Submit Request
                    </button>
                </form>
            </SlideOver>
        </div>
    );
}

function AttendanceBtn({ onClick, icon, label, color }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700",
                color
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function TabButton({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                active
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function StatCard({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-2xl hover:shadow-zinc-300/50 dark:hover:shadow-none group relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
                {icon}
            </div>
            <div className="flex items-center gap-5">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-12", bg, color)}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black text-zinc-950 dark:text-zinc-50 mt-1">{value}</h3>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50",
        ABSENT: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
        LATE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50",
        HALF_DAY: "bg-brand/10 text-brand border-brand/20 dark:bg-brand/20 dark:text-brand dark:border-brand/40",
        APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20",
        REJECTED: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20",
        PENDING: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
    };

    return (
        <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest italic",
            styles[status as keyof typeof styles] || styles.PENDING
        )}>
            {status}
        </span>
    );
}

function AnalyticsProgress({ label, value, max, color }: any) {
    const percentage = Math.min((value / max) * 100, 100);
    return (
        <div className="space-y-3 group">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-900 transition-colors">{label}</span>
                <span className="text-sm font-black text-zinc-950 dark:text-zinc-50 italic">{value} Days</span>
            </div>
            <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner p-1">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-in-out shadow-sm", color)}
                    style={{ width: `${percentage}%` }}
                >
                    {percentage > 10 && (
                        <div className="h-full w-full bg-white/10 flex items-center justify-end px-2">
                            <div className="h-1 w-1 bg-white rounded-full animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PunchSwitch({ isIn, onClick, isLoading, lastPunchTime, minGapMins }: { isIn: boolean, onClick: () => void, isLoading: boolean, lastPunchTime?: string | Date | null, minGapMins?: number }) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Sync with server time drift if needed, but for now we'll just add a safety buffer
    useEffect(() => {
        if (!lastPunchTime || !minGapMins || minGapMins <= 0) {
            setTimeLeft(0);
            return;
        }

        const tick = () => {
            const now = Date.now();
            const last = new Date(lastPunchTime).getTime();
            if (isNaN(last)) return 0;

            const gapMs = Math.round(minGapMins * 60 * 1000);
            const diff = last + gapMs - now;
            const remaining = Math.max(0, Math.ceil(diff / 1000));

            setTimeLeft(remaining);
            return remaining;
        };

        const initialRemaining = tick();

        // If we found we should wait, start interval
        if (initialRemaining > 0) {
            const interval = setInterval(() => {
                const remaining = tick();
                if (remaining <= 0) clearInterval(interval);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [lastPunchTime, minGapMins]);

    const isLocked = timeLeft > 0;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex flex-col items-center gap-1 group/punch">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoading && !isLocked) onClick();
                }}
                disabled={isLocked || isLoading}
                className={cn(
                    "relative h-9 w-32 rounded-full transition-all duration-300 flex items-center p-1 shadow-inner border overflow-hidden",
                    isLocked ? "bg-zinc-50 border-zinc-200" :
                        isIn
                            ? "bg-emerald-100/50 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700",
                    !isLocked && "cursor-pointer active:scale-95"
                )}
            >
                {/* Background Labels */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-between px-3.5 text-[10px] font-black uppercase tracking-widest pointer-events-none select-none transition-opacity duration-300",
                    isLocked ? "opacity-0" : "opacity-100"
                )}>
                    <span className={cn(
                        "transition-all duration-300",
                        isIn ? "opacity-100 text-emerald-700 translate-x-1" : "opacity-0 -translate-x-2"
                    )}>IN</span>
                    <span className={cn(
                        "transition-all duration-300",
                        !isIn ? "opacity-100 text-zinc-500 -translate-x-1" : "opacity-0 translate-x-2"
                    )}>OUT</span>
                </div>

                {/* Countdown Overlay Inside Button */}
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[1px] animate-in fade-in duration-300">
                        <div className="flex items-center gap-1.5 px-3">
                            <Timer className="h-3 w-3 text-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black text-rose-600 tabular-nums tracking-tighter">
                                WAIT {minutes}:{seconds.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Moving Toggle */}
                <div className={cn(
                    "absolute h-7 w-12 rounded-full shadow-sm border transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center z-10",
                    isIn
                        ? "translate-x-[4.5rem] bg-emerald-500 border-emerald-400"
                        : "translate-x-0 bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600",
                    isLocked && "hidden" // Hide the toggle when locked to show countdown clearly
                )}>
                    {isIn ? (
                        <LogIn className="h-3.5 w-3.5 text-white" />
                    ) : (
                        <LogOut className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-300" />
                    )}
                </div>
            </button>
            {!isLocked && minGapMins > 0 && (
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-2 opacity-0 group-hover/punch:opacity-100 transition-opacity">
                    {minGapMins}m Gap Active
                </span>
            )}
        </div>
    );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
