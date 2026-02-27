"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    CheckCircle2,
    History,
    Activity,
    ShieldCheck,
    X,
    Loader2
} from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameYear,
    isAfter,
    startOfDay,
    subMonths,
    addMonths
} from "date-fns";
import { cn } from "@/lib/utils";
import { getStudentAttendanceAction } from "@/app/actions/attendance-actions";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const AttendanceDialog = dynamic(() => import("@/components/dashboard/students/AttendanceDialog").then(m => m.AttendanceDialog), { ssr: false });

export default function AttendanceTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;
    const { can } = useRolePermissions();

    const [isLoading, setIsLoading] = useState(true);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
    const [attendanceModalInitialData, setAttendanceModalInitialData] = useState<{ date: string, status: string, notes: string } | undefined>(undefined);

    const canAttendance = can('attendance', 'create');

    useEffect(() => {
        loadAttendance();
    }, [id, currentMonth]);

    async function loadAttendance() {
        setIsLoading(true);
        const res = await getStudentAttendanceAction(slug, id);
        if (res.success) {
            setAttendance(res.data || []);
        } else {
            toast.error(res.error || "Failed to load attendance");
        }
        setIsLoading(false);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Attendance Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black text-zinc-900">Attendance Log</h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Monthly overview and daily records.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-2xl border border-zinc-200 p-1 shadow-sm">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="px-4 text-sm font-black text-zinc-700 min-w-[140px] text-center">
                            {format(currentMonth, 'MMMM yyyy')}
                        </div>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <StandardActionButton
                        onClick={() => setIsAddAttendanceOpen(true)}
                        variant="primary"
                        icon={Plus}
                        label="Mark Attendance"
                        permission={{ module: 'attendance', action: 'create' }}
                    />
                </div>
            </div>

            {/* Monthly Overview Stats */}
            {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const workingDaysCount = daysInMonth.filter(day => {
                    const dayOfWeek = day.getDay();
                    return dayOfWeek !== 0 && dayOfWeek !== 6;
                }).length;

                const monthRecords = attendance.filter(r =>
                    isSameMonth(new Date(r.date), currentMonth) &&
                    isSameYear(new Date(r.date), currentMonth)
                );

                const stats = {
                    working: workingDaysCount,
                    present: monthRecords.filter(r => r.status === 'PRESENT').length,
                    absent: monthRecords.filter(r => r.status === 'ABSENT').length,
                    late: monthRecords.filter(r => r.status === 'LATE').length,
                    halfDay: monthRecords.filter(r => r.status === 'HALF_DAY').length,
                    excused: monthRecords.filter(r => r.status === 'EXCUSED').length
                };

                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard icon={Briefcase} label="Working Days" value={stats.working} />
                        <StatCard icon={CheckCircle2} label="Present" value={stats.present} color="text-emerald-600" bgColor="bg-emerald-50" />
                        <StatCard icon={History} label="Late" value={stats.late} color="text-amber-600" bgColor="bg-amber-50" />
                        <StatCard icon={Activity} label="Half Day" value={stats.halfDay} color="text-purple-600" bgColor="bg-purple-50" />
                        <StatCard icon={ShieldCheck} label="Excused" value={stats.excused} color="text-blue-600" bgColor="bg-blue-50" />
                        <StatCard icon={X} label="Absent" value={stats.absent} color="text-red-600" bgColor="bg-red-50" />
                    </div>
                );
            })()}

            {/* Calendar View */}
            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden p-8">
                <div className="grid grid-cols-7 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(currentMonth);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                        return calendarDays.map((day, idx) => {
                            const isFutureDate = isAfter(startOfDay(day), startOfDay(new Date()));
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const dateKey = format(day, "yyyy-MM-dd");
                            const record = attendance.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateKey);
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                            let statusColor = isWeekend ? "bg-zinc-50/50 text-zinc-300 border-transparent" : "bg-zinc-50 border-transparent text-zinc-400";
                            if (isFutureDate) statusColor = "bg-zinc-50/20 text-zinc-200 border-transparent opacity-30";
                            let statusIcon = null;

                            if (record) {
                                if (record.status === 'PRESENT') {
                                    statusColor = "bg-emerald-50 border-emerald-100 text-emerald-600";
                                    statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-1" />;
                                } else if (record.status === 'ABSENT') {
                                    statusColor = "bg-red-50 border-red-100 text-red-600";
                                    statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-red-500 mb-1" />;
                                } else if (record.status === 'LATE') {
                                    statusColor = "bg-amber-50 border-amber-100 text-amber-600";
                                    statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mb-1" />;
                                } else if (record.status === 'HALF_DAY') {
                                    statusColor = "bg-purple-50 border-purple-100 text-purple-600";
                                    statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mb-1" />;
                                } else if (record.status === 'EXCUSED') {
                                    statusColor = "bg-blue-50 border-blue-100 text-blue-600";
                                    statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mb-1" />;
                                }
                            }

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (!canAttendance || isFutureDate) return;
                                        setAttendanceModalInitialData({
                                            date: dateKey,
                                            status: record?.status || "PRESENT",
                                            notes: record?.notes || ""
                                        });
                                        setIsAddAttendanceOpen(true);
                                    }}
                                    className={cn(
                                        "min-h-[100px] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all relative group",
                                        statusColor,
                                        !isFutureDate && isCurrentMonth && "hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                                    )}
                                >
                                    <span className="text-xs font-black">{format(day, 'd')}</span>
                                    <div className="flex flex-col items-center">
                                        {statusIcon}
                                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                            {record?.status || (isWeekend ? "Weekend" : "N/A")}
                                        </span>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>

            {isAddAttendanceOpen && (
                <AttendanceDialog
                    onClose={() => setIsAddAttendanceOpen(false)}
                    onSuccess={() => {
                        setIsAddAttendanceOpen(false);
                        loadAttendance();
                    }}
                    studentId={id}
                    slug={slug}
                    initialData={attendanceModalInitialData}
                />
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color = "text-zinc-900", bgColor = "bg-zinc-100" }: any) {
    return (
        <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", bgColor, color)}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">{label}</span>
            </div>
            <p className={cn("text-2xl font-black", color)}>{value}</p>
        </div>
    );
}
