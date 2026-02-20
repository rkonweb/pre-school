"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Brain, Users, TrendingUp, Star, FileText,
    ChevronRight, Loader2, CheckCircle2, Circle, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/cookies";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getClassDevelopmentSummaryAction } from "@/app/actions/development-actions";

const RATING_LABELS = ["", "Beginning", "Developing", "Achieving", "Excelling"];

function RatingBar({ value, max = 4 }: { value: number; max?: number }) {
    const pct = (value / max) * 100;
    const color = value >= 3.5 ? "bg-emerald-500" : value >= 2.5 ? "bg-blue-500" : value >= 1.5 ? "bg-amber-500" : "bg-red-400";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-black text-zinc-500 w-6 text-right">{value > 0 ? value.toFixed(1) : "—"}</span>
        </div>
    );
}

function MilestoneRing({ pct, size = 48 }: { pct: number; size?: number }) {
    const r = 15.9;
    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#6366f1" : pct >= 25 ? "#f59e0b" : "#e4e4e7";
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
                <circle cx="18" cy="18" r={r} fill="none" stroke="#f4f4f5" strokeWidth="3" />
                <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-700">{pct}%</span>
        </div>
    );
}

export default function ClassDevelopmentOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [classroomsLoading, setClassroomsLoading] = useState(true);
    const [academicYearId, setAcademicYearId] = useState<string | undefined>();

    useEffect(() => {
        const yearId = getCookie(`academic_year_${slug}`) || undefined;
        setAcademicYearId(yearId);
        loadClassrooms();
    }, [slug]);

    useEffect(() => {
        if (selectedClassroom) loadSummary();
    }, [selectedClassroom]);

    async function loadClassrooms() {
        setClassroomsLoading(true);
        const res = await getClassroomsAction(slug);
        if (res.success) {
            setClassrooms(res.data ?? []);
            if ((res.data?.length ?? 0) > 0) setSelectedClassroom(res.data![0].id);
        }
        setClassroomsLoading(false);
    }

    async function loadSummary() {
        if (!selectedClassroom) return;
        setLoading(true);
        const res = await getClassDevelopmentSummaryAction(selectedClassroom, academicYearId);
        if (res.success) setStudents(res.data || []);
        setLoading(false);
    }

    const selectedClass = classrooms.find(c => c.id === selectedClassroom);
    const avgMilestone = students.length > 0
        ? Math.round(students.reduce((s, st) => s + st.milestoneProgress, 0) / students.length)
        : 0;
    const avgSkill = students.length > 0
        ? (students.reduce((s, st) => s + st.avgSkillRating, 0) / students.length).toFixed(1)
        : "0";
    const publishedReports = students.reduce((s, st) => s + (st.reports?.filter((r: any) => r.published).length || 0), 0);

    if (classroomsLoading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900">Development Overview</h1>
                    <p className="text-zinc-500 mt-1">Class-level developmental progress at a glance</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Class Selector */}
                    <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                        {classrooms.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Students", value: students.length, icon: Users, color: "bg-indigo-50 text-indigo-600" },
                    { label: "Avg Milestone Progress", value: `${avgMilestone}%`, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Avg Skill Rating", value: `${avgSkill}/4`, icon: Star, color: "bg-amber-50 text-amber-600" },
                    { label: "Published Reports", value: publishedReports, icon: FileText, color: "bg-blue-50 text-blue-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[20px] border border-zinc-100 shadow-sm p-5">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-black text-zinc-900">{stat.value}</div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Student Table */}
            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No students found in this class</p>
                    <p className="text-sm mt-1">Select a different classroom or add students first</p>
                </div>
            ) : (
                <div className="bg-white rounded-[28px] border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-zinc-100">
                        <h2 className="font-black text-zinc-900">
                            {selectedClass?.name} — {students.length} Students
                        </h2>
                    </div>
                    <div className="divide-y divide-zinc-50">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center gap-4 p-4 hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                                onClick={() => router.push(`/s/${slug}/students/${student.id}?tab=development`)}
                            >
                                {/* Avatar */}
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-black text-brand">{student.name.charAt(0)}</span>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="w-40 flex-shrink-0">
                                    <p className="font-bold text-zinc-900 text-sm">{student.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold">
                                        {student.achievedMilestones}/{student.totalMilestones} milestones
                                    </p>
                                </div>

                                {/* Milestone Ring */}
                                <div className="flex-shrink-0">
                                    <MilestoneRing pct={student.milestoneProgress} />
                                </div>

                                {/* Skill Rating */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Skill Rating</div>
                                    <RatingBar value={student.avgSkillRating} />
                                </div>

                                {/* Reports */}
                                <div className="flex-shrink-0 flex gap-1.5">
                                    {["Term 1", "Term 2", "Term 3"].map((term) => {
                                        const report = student.reports?.find((r: any) => r.term === term);
                                        return (
                                            <div
                                                key={term}
                                                className={cn(
                                                    "h-7 px-2 rounded-lg flex items-center text-[9px] font-black uppercase tracking-widest",
                                                    report?.published
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : report
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-zinc-100 text-zinc-400"
                                                )}
                                            >
                                                {term.replace("Term ", "T")}
                                                {report?.published && <CheckCircle2 className="h-2.5 w-2.5 ml-1" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
