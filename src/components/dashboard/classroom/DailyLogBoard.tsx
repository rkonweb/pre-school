"use client";

import { useState } from "react";
import {
    Coffee,
    Moon,
    Smile,
    Frown,
    Clock,
    Utensils,
    Droplets,
    CheckCircle2,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "MEAL" | "NAP" | "POTTY" | "MOOD" | "ACTIVITY";

interface StudentLog {
    id: string;
    name: string;
    avatar: string;
    lastLogs: { type: ActivityType; time: string; value?: string }[];
}

const MOCK_STUDENTS: StudentLog[] = [
    { id: "1", name: "Emma", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", lastLogs: [{ type: "MEAL", time: "09:30 AM", value: "Full" }] },
    { id: "2", name: "Liam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam", lastLogs: [{ type: "NAP", time: "11:00 AM", value: "Start" }] },
    { id: "3", name: "Olivia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia", lastLogs: [] },
    { id: "4", name: "Noah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah", lastLogs: [{ type: "MOOD", time: "08:45 AM", value: "Happy" }] },
    { id: "5", name: "Ava", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava", lastLogs: [] },
    { id: "6", name: "Lucas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", lastLogs: [] },
];

export function DailyLogBoard() {
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Classroom Daily Log</h2>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                    Kindergarten A • 24 Jan 2026
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_STUDENTS.map((student) => (
                    <div
                        key={student.id}
                        className={cn(
                            "relative rounded-2xl border p-4 transition-all hover:shadow-md",
                            selectedStudent === student.id
                                ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10 dark:border-blue-500"
                                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                        )}
                        onClick={() => setSelectedStudent(student.id)}
                    >
                        <div className="flex items-center gap-3">
                            <img src={student.avatar} alt={student.name} className="h-12 w-12 rounded-full border-2 border-zinc-100 dark:border-zinc-800" />
                            <div className="flex-1">
                                <p className="font-bold text-sm tracking-tight">{student.name}</p>
                                <div className="mt-1 flex gap-1.5">
                                    {student.lastLogs.map((log, i) => (
                                        <div key={i} className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                                            {log.type === "MEAL" && <Utensils className="h-3 w-3 text-orange-500" />}
                                            {log.type === "NAP" && <Moon className="h-3 w-3 text-purple-500" />}
                                            {log.type === "MOOD" && <Smile className="h-3 w-3 text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions for marking */}
                        <div className="mt-4 flex gap-2 border-t border-zinc-50 pt-4 dark:border-zinc-900">
                            <button className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/20 group">
                                <Utensils className="h-4 w-4 text-zinc-400 group-hover:text-orange-500" />
                                <span className="text-[10px] font-medium text-zinc-400 group-hover:text-orange-600">Meal</span>
                            </button>
                            <button className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/20 group">
                                <Moon className="h-4 w-4 text-zinc-400 group-hover:text-purple-500" />
                                <span className="text-[10px] font-medium text-zinc-400 group-hover:text-purple-600">Nap</span>
                            </button>
                            <button className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/20 group">
                                <Droplets className="h-4 w-4 text-zinc-400 group-hover:text-blue-500" />
                                <span className="text-[10px] font-medium text-zinc-400 group-hover:text-blue-600">Potty</span>
                            </button>
                            <button className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-green-50 dark:hover:bg-green-950/20 group">
                                <Smile className="h-4 w-4 text-zinc-400 group-hover:text-green-500" />
                                <span className="text-[10px] font-medium text-zinc-400 group-hover:text-green-600">Mood</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
