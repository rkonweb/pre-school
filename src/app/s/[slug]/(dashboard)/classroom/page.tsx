"use client";

import Link from "next/link";
import { DailyLogBoard } from "@/components/dashboard/classroom/DailyLogBoard";
import {
    Calendar,
    Bell,
    BookOpen,
    AlertCircle,
    Clock,
    ChevronRight,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useParams } from "next/navigation";

export default function ClassroomPage() {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Classroom Management</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Real-time classroom activities and daily planning.
                    </p>
                </div>
                <button className="h-12 px-6 bg-brand text-white hover:brightness-110 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all">
                    <Package className="h-4 w-4" />
                    Request Supplies
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
                {/* Main Content: Daily Log Board */}
                <div className="lg:col-span-4">
                    <DailyLogBoard />
                </div>

                {/* Sidebar: Schedule, Announcements, and Alerts */}
                <div className="space-y-8 lg:col-span-3">
                    {/* Daily Schedule */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold">Daily Schedule</h3>
                            <Calendar className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { time: "09:00 AM", event: "Morning Circle & Greeting", status: "completed" },
                                { time: "10:00 AM", event: "Creative Arts: Finger Painting", status: "current" },
                                { time: "11:00 AM", event: "Outdoor Play", status: "upcoming" },
                                { time: "12:00 PM", event: "Lunch Time", status: "upcoming" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <span className="text-xs font-medium text-zinc-400 w-16">{item.time}</span>
                                    <div className="relative pb-4 flex-1">
                                        {i !== 3 && <div className="absolute left-[-21px] top-4 h-full w-px bg-zinc-100 dark:bg-zinc-800" />}
                                        <div className={cn(
                                            "flex items-center gap-2 text-sm font-medium",
                                            item.status === "completed" ? "text-zinc-400 line-through" :
                                                item.status === "current" ? "text-brand" : "text-zinc-900 dark:text-zinc-50"
                                        )}>
                                            {item.event}
                                            {item.status === "current" && <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Announcements/Lesson Plan */}
                    <div className="rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/[0.03] to-white p-6 dark:border-brand/20 dark:from-brand/[0.05] dark:to-zinc-950">
                        <div className="mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-brand" />
                            <h3 className="font-bold whitespace-normal">Weekly Theme: "Ocean Wonders"</h3>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Focus on marine life and water conservation. Today we are learning about Starfish!
                        </p>
                        <Link href={`/s/${slug}/classroom/guide`} className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                            View Lesson Plan <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Critical Alerts */}
                    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                        <div className="mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <h3 className="font-bold text-red-900 dark:text-red-400">Class Alerts</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-600" />
                                Emma: Allergy Alert (Peanuts)
                            </li>
                            <li className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-600" />
                                Medication: Liam needs inhaler at 11:30 AM
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
