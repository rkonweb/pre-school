"use client";

import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";

export type AttendanceStatus = "present" | "absent" | "late" | "unmarked";

interface AttendanceCardProps {
    student: {
        id: string;
        name: string;
        avatar: string;
        rollNo: string;
    };
    status: AttendanceStatus;
    onStatusChange: (status: AttendanceStatus) => void;
    readOnly?: boolean;
}

export function AttendanceCard({ student, status: rawStatus, onStatusChange, readOnly }: AttendanceCardProps) {
    const status = (rawStatus?.toLowerCase() || "unmarked") as AttendanceStatus;

    return (
        <div className={cn(
            "group relative flex flex-col items-center justify-between rounded-3xl border p-3 transition-all duration-300 hover:shadow-lg",
            status === "present" && "border-green-200 bg-green-50/50 shadow-green-100/50 dark:border-green-900/50 dark:bg-green-900/20",
            status === "absent" && "border-red-200 bg-red-50/50 shadow-red-100/50 dark:border-red-900/50 dark:bg-red-900/20",
            status === "late" && "border-yellow-200 bg-yellow-50/50 shadow-yellow-100/50 dark:border-yellow-900/50 dark:bg-yellow-900/20",
            status === "unmarked" && "border-zinc-100 bg-white hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
        )}>
            {/* Status Badge (Floating) */}
            <div className={cn(
                "absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                status === "present" && "bg-green-100 text-green-600",
                status === "absent" && "bg-red-100 text-red-600",
                status === "late" && "bg-yellow-100 text-yellow-600",
                status === "unmarked" && "opacity-0"
            )}>
                {status === "present" && "P"}
                {status === "absent" && "A"}
                {status === "late" && "L"}
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
                {/* Avatar */}
                <StudentAvatar
                    src={student.avatar}
                    name={student.name}
                    className="h-14 w-14 rounded-2xl group-hover:scale-105 transition-transform ring-2 ring-white dark:ring-zinc-950"
                />

                {/* Info */}
                <div className="text-center w-full min-w-0 px-1">
                    <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                        {cleanName(student.name)}
                    </h3>
                    <p className="truncate text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                        {student.rollNo}
                    </p>
                </div>
            </div>

            {/* Actions (Icon Buttons) */}
            <div className="mt-3 flex w-full items-center justify-center gap-2">
                <button
                    onClick={() => !readOnly && onStatusChange("present")}
                    disabled={readOnly}
                    title="Present"
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        status === "present"
                            ? "bg-green-500 text-white shadow-md shadow-green-200"
                            : "bg-white text-zinc-400 hover:bg-green-100 hover:text-green-600 border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
                    )}
                >
                    <Check className="h-4 w-4" strokeWidth={3} />
                </button>
                <button
                    onClick={() => !readOnly && onStatusChange("absent")}
                    disabled={readOnly}
                    title="Absent"
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        status === "absent"
                            ? "bg-red-500 text-white shadow-md shadow-red-200"
                            : "bg-white text-zinc-400 hover:bg-red-100 hover:text-red-600 border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
                    )}
                >
                    <X className="h-4 w-4" strokeWidth={3} />
                </button>
                <button
                    onClick={() => !readOnly && onStatusChange("late")}
                    disabled={readOnly}
                    title="Late"
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        status === "late"
                            ? "bg-yellow-500 text-white shadow-md shadow-yellow-200"
                            : "bg-white text-zinc-400 hover:bg-yellow-100 hover:text-yellow-600 border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700"
                    )}
                >
                    <Clock className="h-4 w-4" strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
