"use client";

import { useState, useEffect, useCallback } from "react";
import { format, isFuture, isToday, parseISO } from "date-fns";
import { getSchoolNow } from "@/lib/date-utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save, Play, CheckCircle2, Clock, X } from "lucide-react";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { AttendanceCard, AttendanceStatus } from "@/components/dashboard/attendance/AttendanceCard";
import { getAttendanceDataAction, markAttendanceAction } from "@/app/actions/attendance-actions"; // We will rename/export these
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/cookies";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";

interface AttendanceClientProps {
    slug: string;
    classrooms: { id: string; name: string }[];
    academicYears?: any[];
    currentAcademicYear?: any;
    schoolTimezone?: string;
}

export default function AttendanceClient({ slug, classrooms, academicYears = [], currentAcademicYear, schoolTimezone = "Asia/Kolkata" }: AttendanceClientProps) {
    const { role } = useRolePermissions();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    const [date, setDate] = useState("");

    useEffect(() => {
        const now = getSchoolNow(schoolTimezone);
        setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    }, [schoolTimezone]);
    const [selectedClassId, setSelectedClassId] = useState(classrooms[0]?.id || "");
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [focusIndex, setFocusIndex] = useState(0);

    const loadData = useCallback(async () => {
        if (!selectedClassId || !date) return;
        setIsLoading(true);
        const cookieId = getCookie(`academic_year_${slug}`);
        const academicYearId = cookieId || currentAcademicYear?.id || (academicYears.length > 0 ? academicYears[0].id : undefined);

        const res = await getAttendanceDataAction(slug, selectedClassId, date, academicYearId);
        if (res.success) {
            setStudents(res.data || []);
        } else {
            toast.error(res.error || "Failed to load students");
        }
        setIsLoading(false);
    }, [slug, selectedClassId, date, currentAcademicYear, academicYears]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusChange = async (studentId: string, status: string) => {
        const normalizedStatus = status.toUpperCase();

        // Optimistic update
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: normalizedStatus } : s));

        // Server update
        // Server update
        const cookieId = getCookie(`academic_year_${slug}`);
        const academicYearId = cookieId || currentAcademicYear?.id || (academicYears && academicYears.length > 0 ? academicYears[0].id : undefined);
        const res = await markAttendanceAction(slug, studentId, date, normalizedStatus, undefined, academicYearId);
        if (!res.success) {
            toast.error("Failed to save attendance");
            // Revert on error? For now, we assume success or reload.
            loadData();
        }
    };

    const handleFocusModeMark = async (status: string) => {
        const student = students[focusIndex];
        if (!student) return;

        await handleStatusChange(student.id, status);

        // Move to next
        if (focusIndex < students.length - 1) {
            setFocusIndex(prev => prev + 1);
        } else {
            toast.success("All students marked!");
            setIsFocusMode(false);
        }
    };

    const startFocusMode = () => {
        // Find first unmarked student or start from 0
        const firstUnmarked = students.findIndex(s => !s.status);
        setFocusIndex(firstUnmarked >= 0 ? firstUnmarked : 0);
        setIsFocusMode(true);
    };

    const schoolNow = getSchoolNow(schoolTimezone);
    const todayStr = `${schoolNow.getFullYear()}-${String(schoolNow.getMonth() + 1).padStart(2, '0')}-${String(schoolNow.getDate()).padStart(2, '0')}`;
    const isDateEditable = isAdmin || date === todayStr;

    // Stats
    const stats = {
        present: students.filter((s) => s.status === "PRESENT").length,
        absent: students.filter((s) => s.status === "ABSENT").length,
        late: students.filter((s) => s.status === "LATE").length,
        total: students.length,
    };
    const unmarkedCount = stats.total - (stats.present + stats.absent + stats.late);

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Attendance
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Track daily attendance for your classes.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Date Picker */}
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={(() => {
                                const now = getSchoolNow(schoolTimezone);
                                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            })()} // Disable future
                            className="bg-transparent px-2 text-sm font-medium text-zinc-900 focus:outline-none dark:text-zinc-50"
                            aria-label="Select Attendance Date"
                            title="Select Attendance Date"
                        />
                    </div>

                    {/* Class Selector */}
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        aria-label="Select Classroom"
                        title="Select Classroom"
                    >
                        {classrooms.length > 0 ? (
                            classrooms.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))
                        ) : (
                            <option value="">No Classes Found</option>
                        )}
                    </select>

                    {/* Start Attendance Button (Only for Today) */}
                    {isDateEditable && students.length > 0 && (
                        <StandardActionButton
                            onClick={startFocusMode}
                            variant="primary"
                            icon={Play}
                            label={unmarkedCount > 0 ? "Take Attendance" : "Review Attendance"}
                            permission={{ module: 'attendance', action: 'mark' }}
                        />
                    )}
                </div>
            </div>

            {/* Focus Mode Overlay */}
            {isFocusMode && students[focusIndex] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900 animate-in zoom-in-95 duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <span className="text-sm font-medium text-zinc-500">
                                Student {focusIndex + 1} of {students.length}
                            </span>
                            <button onClick={() => setIsFocusMode(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                Close
                            </button>
                        </div>

                        <div className="mb-8 flex flex-col items-center">
                            <StudentAvatar
                                src={students[focusIndex].avatar}
                                name={students[focusIndex].name}
                                className="h-32 w-32 mb-4 ring-4 ring-zinc-100 dark:ring-zinc-800"
                            />
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{cleanName(students[focusIndex].name)}</h2>
                            <p className="text-zinc-500">Roll No: {students[focusIndex].rollNo}</p>

                            {/* Current Status Indicator */}
                            {students[focusIndex].status && (
                                <div className="mt-2 text-sm font-medium text-brand">
                                    Current: {students[focusIndex].status}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleFocusModeMark("PRESENT")}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-green-50 p-4 text-green-700 transition-all hover:bg-green-100 hover:scale-105 active:scale-95 dark:bg-green-900/20 dark:text-green-400"
                            >
                                <CheckCircle2 className="h-8 w-8" />
                                <span className="font-semibold">Present</span>
                            </button>
                            <button
                                onClick={() => handleFocusModeMark("ABSENT")}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-red-50 p-4 text-red-700 transition-all hover:bg-red-100 hover:scale-105 active:scale-95 dark:bg-red-900/20 dark:text-red-400"
                            >
                                <span className="text-2xl font-bold">X</span>
                                <span className="font-semibold">Absent</span>
                            </button>
                            <button
                                onClick={() => handleFocusModeMark("LATE")}
                                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-yellow-50 p-4 text-yellow-700 transition-all hover:bg-yellow-100 hover:scale-105 active:scale-95 dark:bg-yellow-900/20 dark:text-yellow-400"
                            >
                                <Clock className="h-8 w-8" />
                                <span className="font-semibold">Late</span>
                            </button>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setFocusIndex(prev => Math.max(0, prev - 1))}
                                disabled={focusIndex === 0}
                                className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setFocusIndex(prev => Math.min(students.length - 1, prev + 1))}
                                disabled={focusIndex === students.length - 1}
                                className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
                            >
                                Skip / Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="text-sm font-medium text-zinc-500">Present</div>
                    <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-500">{stats.present}</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="text-sm font-medium text-zinc-500">Absent</div>
                    <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-500">{stats.absent}</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="text-sm font-medium text-zinc-500">Late</div>
                    <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.late}</div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="text-sm font-medium text-zinc-500">Unmarked</div>
                    <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{unmarkedCount}</div>
                </div>
            </div>

            {/* Student Grid (Read Only / Quick Edit) */}
            {isLoading ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                    ))}
                </div>
            ) : students.length > 0 ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {students.map((student) => (
                        <AttendanceCard
                            key={student.id}
                            student={student}
                            status={(student.status as AttendanceStatus) || "unmarked"}
                            onStatusChange={(status) => isDateEditable ? handleStatusChange(student.id, status) : null}
                            readOnly={!isDateEditable}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-zinc-500">
                    No students found in this class.
                </div>
            )}
        </div>
    );
}
