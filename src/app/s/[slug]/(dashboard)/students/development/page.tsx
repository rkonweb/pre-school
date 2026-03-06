"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Brain, Users, TrendingUp, Star, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getClassDevelopmentSummaryAction } from "@/app/actions/development-actions";
import { SectionHeader } from "@/components/ui/erp-ui";

const RATING_LABELS = ["", "Beginning", "Developing", "Achieving", "Excelling"];

function RatingBar({ value, max = 4 }: { value: number; max?: number }) {
    const pct = (value / max) * 100;
    const color = value >= 3.5 ? "#10b981" : value >= 2.5 ? "#6366f1" : value >= 1.5 ? "#F59E0B" : "#f87171";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: color, width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#6B7280", minWidth: 24, textAlign: "right" }}>{value > 0 ? value.toFixed(1) : "—"}</span>
        </div>
    );
}

function MilestoneRing({ pct, size = 48 }: { pct: number; size?: number }) {
    const r = 15.9;
    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#6366f1" : pct >= 25 ? "#F59E0B" : "#E4E4E7";
    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r={r} fill="none" stroke="#f4f4f5" strokeWidth="3" />
                <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3"
                    strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#374151" }}>{pct}%</span>
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

    useEffect(() => { if (selectedClassroom) loadSummary(); }, [selectedClassroom]);

    async function loadClassrooms() {
        setClassroomsLoading(true);
        const res = await getClassroomsAction(slug);
        if (res.success) { setClassrooms(res.data ?? []); if ((res.data?.length ?? 0) > 0) setSelectedClassroom(res.data![0].id); }
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
    const avgMilestone = students.length > 0 ? Math.round(students.reduce((s, st) => s + st.milestoneProgress, 0) / students.length) : 0;
    const avgSkill = students.length > 0 ? (students.reduce((s, st) => s + st.avgSkillRating, 0) / students.length).toFixed(1) : "0";
    const publishedReports = students.reduce((s, st) => s + (st.reports?.filter((r: any) => r.published).length || 0), 0);

    const stats = [
        { label: "Students", value: students.length, icon: Users, bg: "#EEF2FF", iconColor: "#4F46E5" },
        { label: "Avg Milestone Progress", value: `${avgMilestone}%`, icon: CheckCircle2, bg: "#ECFDF5", iconColor: "#059669" },
        { label: "Avg Skill Rating", value: `${avgSkill}/4`, icon: Star, bg: "#FFFBEB", iconColor: "#D97706" },
        { label: "Published Reports", value: publishedReports, icon: FileText, bg: "#EFF6FF", iconColor: "#2563EB" },
    ];

    if (classroomsLoading) return (
        <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #F3F4F6", borderTop: "3px solid #F59E0B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Development Overview"
                subtitle="Class-level developmental progress at a glance"
                icon={Brain}
                action={
                    <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value)}
                        style={{ height: 42, borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#374151", outline: "none", cursor: "pointer" }}
                    >
                        {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                }
            />

            {/* Summary Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ background: "white", borderRadius: 20, border: "1.5px solid #F3F4F6", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                            <stat.icon style={{ width: 20, height: 20, color: stat.iconColor }} />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#18181B" }}>{stat.value}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Student Table */}
            {loading ? (
                <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 28, height: 28, border: "2px solid #F3F4F6", borderTop: "2px solid #F59E0B", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : students.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: "#9CA3AF" }}>
                    <Brain style={{ width: 48, height: 48, margin: "0 auto 14px", opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, fontSize: 15 }}>No students found in this class</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Select a different classroom or add students first</p>
                </div>
            ) : (
                <div style={{ background: "white", borderRadius: 24, border: "1.5px solid #F3F4F6", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F3F4F6" }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: "#18181B" }}>{selectedClass?.name} — {students.length} Students</span>
                    </div>
                    <div>
                        {students.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => router.push(`/s/${slug}/students/${student.id}?tab=development`)}
                                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: "1px solid #F9FAFB", cursor: "pointer", transition: "background 0.1s" }}
                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA"}
                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "white"}
                            >
                                {/* Avatar */}
                                <div style={{ width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.08))", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {student.avatar ? <img src={student.avatar} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 15, fontWeight: 900, color: "#F59E0B" }}>{student.name.charAt(0)}</span>}
                                </div>
                                {/* Name */}
                                <div style={{ width: 140, flexShrink: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#18181B" }}>{student.name}</div>
                                    <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>{student.achievedMilestones}/{student.totalMilestones} milestones</div>
                                </div>
                                {/* Milestone Ring */}
                                <div style={{ flexShrink: 0 }}><MilestoneRing pct={student.milestoneProgress} /></div>
                                {/* Skill Rating */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Skill Rating</div>
                                    <RatingBar value={student.avgSkillRating} />
                                </div>
                                {/* Term Reports */}
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                    {["Term 1", "Term 2", "Term 3"].map((term) => {
                                        const report = student.reports?.find((r: any) => r.term === term);
                                        const bg = report?.published ? "#ECFDF5" : report ? "#FFFBEB" : "#F3F4F6";
                                        const c = report?.published ? "#059669" : report ? "#D97706" : "#9CA3AF";
                                        return (
                                            <div key={term} style={{ height: 26, padding: "0 8px", borderRadius: 8, background: bg, display: "flex", alignItems: "center", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: c, gap: 4 }}>
                                                {term.replace("Term ", "T")}
                                                {report?.published && <CheckCircle2 style={{ width: 10, height: 10 }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                                <ChevronRight style={{ width: 14, height: 14, color: "#D1D5DB", flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
