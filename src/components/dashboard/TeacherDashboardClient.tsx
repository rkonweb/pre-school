"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Users,
    BookOpen,
    Clock,
    Calendar,
    CheckCircle,
    FileText,
    ArrowRight,
    Sparkles,
    GraduationCap,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { getTeacherOverviewAction } from "@/app/actions/teacher-dashboard-actions";
import { Loader2 } from "lucide-react";

export function TeacherDashboardClient() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const teacherId = params.id as string;

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getTeacherOverviewAction(slug, teacherId);
            if (res.success) {
                setData(res.data);
            } else {
                console.error("Dashboard Load Error:", res.error);
                setError(res.error || "Unknown error");
            }
        } catch (err: any) {
            console.error("Client Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [slug, teacherId]);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <div>
                    <h3 className="text-lg font-bold text-zinc-900">Failed to load dashboard</h3>
                    <p className="text-zinc-500 max-w-md">{error}</p>
                </div>
                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return <div className="text-center py-20 text-zinc-500">No data available.</div>;

    const { profile, stats, classrooms, recentDiary, schedule, homeworkPerformance, birthdays, recentMessages, announcements } = data;

    const navTo = (path: string) => router.push(`/s/${slug}${path}`);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">
                        Welcome back, {profile.name.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </motion.div>

                {/* Clock-in Status */}
                <motion.div
                    variants={itemVariants}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${stats.clockInStatus.status === 'NOT_MARKED'
                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}
                >
                    <div className={`h-2 w-2 rounded-full ${stats.clockInStatus.status === 'NOT_MARKED' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-bold uppercase tracking-wider">
                        {stats.clockInStatus.status === 'NOT_MARKED' ? 'Shift Not Started' : 'On Duty'}
                    </span>
                    {stats.clockInStatus.status === 'NOT_MARKED' && (
                        <button className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-black hover:bg-amber-700 transition-colors">
                            Clock In
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickStat
                    icon={GraduationCap}
                    label="My Students"
                    value={stats.totalStudents}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <QuickStat
                    icon={BookOpen}
                    label="My Classes"
                    value={stats.totalClasses}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <QuickStat
                    icon={CheckCircle}
                    label="Pending Reviews"
                    value={stats.pendingReviews}
                    color="text-orange-600"
                    bg="bg-orange-50"
                    alert={stats.pendingReviews > 0}
                />
                {/* Attendance Summary */}
                <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Attendance</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <div>
                            <span className="text-2xl font-black text-zinc-900">{stats.attendance.present}</span>
                            <span className="text-xs font-bold text-zinc-400 ml-1">Present</span>
                        </div>
                        <div className="h-4 w-px bg-zinc-200 mx-2" />
                        <div>
                            <span className="text-2xl font-black text-red-500">{stats.attendance.absent}</span>
                            <span className="text-xs font-bold text-zinc-400 ml-1">Absent</span>
                        </div>
                    </div>
                    {stats.attendance.unmarked > 0 && (
                        <p className="text-[10px] font-bold text-orange-500 mt-2">{stats.attendance.unmarked} Unmarked</p>
                    )}
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* My Classrooms */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-zinc-400" />
                                My Classrooms
                            </h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {classrooms.map((c: any) => (
                                <div key={c.id} onClick={() => navTo(`/academics/classes`)} className="p-5 rounded-2xl border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <h3 className="font-bold text-lg text-zinc-900">{c.name}</h3>
                                    <p className="text-zinc-500 text-sm font-medium mb-3">
                                        {c.isClassTeacher ? "Class Teacher" : "Subject Teacher"}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600 group-hover:bg-white group-hover:text-blue-600">
                                        <Users className="h-3 w-3" />
                                        {c.students} Students
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Homework Performance */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-zinc-400" />
                                Homework Insights
                            </h2>
                            <button onClick={() => navTo('/homework')} className="text-sm font-bold text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {(homeworkPerformance || []).map((h: any) => (
                                <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 bg-zinc-50/50">
                                    <div>
                                        <h4 className="font-bold text-zinc-900 truncate max-w-[200px]">{h.title}</h4>
                                        <p className="text-xs text-zinc-500 font-medium">
                                            Assigned {new Date(h.assignedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg font-black text-blue-600">{h.submitted}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Submitted</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Message Feed */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-400" />
                                Recent Messages
                            </h2>
                            <button onClick={() => navTo('/messages')} className="text-sm font-bold text-indigo-600 hover:underline">Open Inbox</button>
                        </div>
                        <div className="space-y-4">
                            {recentMessages.map((msg: any) => (
                                <div key={msg.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100 group cursor-pointer" onClick={() => navTo(`/messages/${msg.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                            {msg.studentName[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900">{msg.studentName}</h4>
                                            <p className="text-sm text-zinc-500 line-clamp-1 italic">"{msg.lastMessage}"</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">
                                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                            {recentMessages.length === 0 && (
                                <p className="text-center py-6 text-zinc-400 text-sm italic">No recent messages.</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar (1/3) */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Sparkles className="h-5 w-5 opacity-80" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <button onClick={() => navTo('/diary/create')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm text-left transition-all hover:translate-y-[-2px] active:translate-y-0 backdrop-blur-sm border border-white/10">
                                + Diary
                            </button>
                            <button onClick={() => navTo('/homework/create')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm text-left transition-all hover:translate-y-[-2px] active:translate-y-0 backdrop-blur-sm border border-white/10">
                                + Homework
                            </button>
                            <button onClick={() => navTo('/attendance')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm text-left transition-all hover:translate-y-[-2px] active:translate-y-0 backdrop-blur-sm border border-white/10">
                                Attendance
                            </button>
                            <button onClick={() => navTo('/reports')} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm text-left transition-all hover:translate-y-[-2px] active:translate-y-0 backdrop-blur-sm border border-white/10">
                                Reports
                            </button>
                        </div>
                    </motion.div>

                    {/* Today's Schedule */}
                    <motion.div variants={itemVariants} className="bg-zinc-900 text-zinc-100 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 pointer-events-none" />

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Clock className="h-5 w-5 text-blue-400" />
                            Today's Schedule
                        </h2>

                        <div className="space-y-6 relative z-10">
                            {schedule.map((s: any, i: number) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20 group-hover:scale-110 transition-transform" />
                                        {i !== schedule.length - 1 && <div className="w-0.5 bg-zinc-800 h-full mt-2" />}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm text-zinc-400 font-mono mb-1">{s.time}</p>
                                        <p className="font-bold text-lg leading-tight">{s.subject}</p>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1">{s.class}</p>
                                    </div>
                                </div>
                            ))}
                            {schedule.length === 0 && (
                                <div className="text-zinc-500 text-sm italic">
                                    No classes scheduled today.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Announcements Feed */}
                    <motion.div variants={itemVariants} className="bg-zinc-50 rounded-[2rem] border border-zinc-200/50 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <AlertCircle className="h-4 w-4 text-zinc-300" />
                        </div>
                        <h2 className="text-xl font-bold mb-6 text-zinc-900">Announcements</h2>
                        <div className="space-y-4">
                            {announcements.map((a: any) => (
                                <div key={a.id} className="p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">School</span>
                                        <span className="text-[10px] font-bold text-zinc-400">
                                            {new Date(a.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-zinc-900 text-sm mb-1">{a.title}</h4>
                                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{a.message}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <p className="text-center py-6 text-zinc-400 text-sm italic">No active announcements.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Upcoming Birthdays */}
                    {(birthdays && birthdays.length > 0) && (
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-xl">🎂</span>
                                    Birthdays
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {birthdays.map((b: any) => (
                                    <div key={b.id} className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-500">
                                            {b.name[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-zinc-900">{b.name}</p>
                                            <p className="text-xs text-zinc-500 font-medium">
                                                {new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </motion.div>
    );
}

function QuickStat({ icon: Icon, label, value, color, bg, alert }: any) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-3 ${bg} ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    {value}
                    {alert && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                </p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">{label}</p>
            </div>
        </div>
    );
}
