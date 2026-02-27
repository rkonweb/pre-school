"use client";

import { useState, useEffect, useRef } from "react";
import {
    Brain, MessageCircle, Heart, Activity, Palette,
    CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
    Plus, X, Save, Upload, FileText, Image, Video,
    Loader2, AlertCircle, Star, Printer, Send, Trash2,
    BookOpen, Camera, StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import {
    getDevelopmentDomainsAction,
    getStudentMilestonesAction,
    upsertMilestoneRecordAction,
    getStudentSkillsAction,
    bulkUpsertSkillAssessmentsAction,
    getPortfolioEntriesAction,
    createPortfolioEntryAction,
    deletePortfolioEntryAction,
    getDevelopmentReportAction,
    saveDevelopmentReportAction,
    publishDevelopmentReportAction,
    seedDefaultDomainsAction,
} from "@/app/actions/development-actions";
import { useReactToPrint } from "react-to-print";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type MilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED";
type SubTab = "milestones" | "skills" | "portfolio" | "report";

const DOMAIN_ICONS: Record<string, any> = {
    Brain, MessageCircle, Heart, Activity, Palette,
};

const RATING_LABELS = ["", "Beginning", "Developing", "Achieving", "Excelling"];
const RATING_COLORS = [
    "",
    "bg-red-100 text-red-700 border-red-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
];

const TERMS = ["Term 1", "Term 2", "Term 3"];

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface Props {
    schoolSlug: string;
    schoolId: string;
    studentId: string;
    studentName: string;
    studentGrade?: string;
}

// ─── MILESTONE STATUS BADGE ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: MilestoneStatus }) {
    if (status === "ACHIEVED") return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="h-3 w-3" /> Achieved
        </span>
    );
    if (status === "IN_PROGRESS") return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
            <Clock className="h-3 w-3" /> In Progress
        </span>
    );
    return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <Circle className="h-3 w-3" /> Not Started
        </span>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StudentDevelopmentTab({ schoolSlug, schoolId, studentId, studentName, studentGrade }: Props) {
    const [subTab, setSubTab] = useState<SubTab>("milestones");
    const [domains, setDomains] = useState<any[]>([]);
    const [milestoneRecords, setMilestoneRecords] = useState<any[]>([]);
    const [skillAssessments, setSkillAssessments] = useState<any[]>([]);
    const [portfolioEntries, setPortfolioEntries] = useState<any[]>([]);
    const [devReport, setDevReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState("Term 1");
    const [academicYearId, setAcademicYearId] = useState<string | undefined>();
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const yearId = getCookie(`academic_year_${schoolSlug}`) || undefined;
        setAcademicYearId(yearId);
        loadAll(yearId);
    }, [studentId, schoolSlug]);

    useEffect(() => {
        if (subTab === "skills") loadSkills();
        if (subTab === "report") loadReport();
    }, [subTab, selectedTerm]);

    async function loadAll(yearId?: string) {
        setLoading(true);
        try {
            // Seed domains if none exist
            await seedDefaultDomainsAction(schoolId);

            const [domainsRes, milestonesRes, portfolioRes] = await Promise.all([
                getDevelopmentDomainsAction(schoolId),
                getStudentMilestonesAction(studentId, yearId),
                getPortfolioEntriesAction(studentId, yearId),
            ]);

            if (domainsRes.success) setDomains(domainsRes.data || []);
            if (milestonesRes.success) setMilestoneRecords(milestonesRes.data || []);
            if (portfolioRes.success) setPortfolioEntries(portfolioRes.data || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function loadSkills() {
        const res = await getStudentSkillsAction(studentId, selectedTerm, academicYearId);
        if (res.success) setSkillAssessments(res.data || []);
    }

    async function loadReport() {
        const res = await getDevelopmentReportAction(studentId, selectedTerm, academicYearId);
        if (res.success) setDevReport(res.data);
    }

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Development_Report_${studentName}_${selectedTerm}`,
    });

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-tab Nav */}
            <div className="flex p-1.5 bg-zinc-100 rounded-[24px] w-full overflow-x-auto">
                {([
                    { id: "milestones", label: "Milestones", icon: CheckCircle2 },
                    { id: "skills", label: "Skills", icon: Star },
                    { id: "portfolio", label: "Portfolio", icon: Camera },
                    { id: "report", label: "Report Card", icon: FileText },
                ] as const).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setSubTab(t.id)}
                        className={cn(
                            "flex-1 min-w-[110px] py-3 rounded-[18px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            subTab === t.id ? "bg-white text-brand shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* MILESTONES TAB */}
            {subTab === "milestones" && (
                <MilestonesTab
                    domains={domains}
                    milestoneRecords={milestoneRecords}
                    studentId={studentId}
                    academicYearId={academicYearId}
                    onUpdate={() => loadAll(academicYearId)}
                />
            )}

            {/* SKILLS TAB */}
            {subTab === "skills" && (
                <SkillsTab
                    domains={domains}
                    assessments={skillAssessments}
                    studentId={studentId}
                    selectedTerm={selectedTerm}
                    onTermChange={(t: string) => setSelectedTerm(t)}
                    academicYearId={academicYearId}
                    onSaved={loadSkills}
                />
            )}

            {/* PORTFOLIO TAB */}
            {subTab === "portfolio" && (
                <PortfolioTab
                    entries={portfolioEntries}
                    domains={domains}
                    studentId={studentId}
                    academicYearId={academicYearId}
                    onUpdate={() => loadAll(academicYearId)}
                />
            )}

            {/* REPORT CARD TAB */}
            {subTab === "report" && (
                <ReportCardTab
                    studentId={studentId}
                    studentName={studentName}
                    studentGrade={studentGrade}
                    domains={domains}
                    milestoneRecords={milestoneRecords}
                    assessments={skillAssessments}
                    report={devReport}
                    selectedTerm={selectedTerm}
                    onTermChange={(t: string) => setSelectedTerm(t)}
                    academicYearId={academicYearId}
                    onSaved={loadReport}
                    reportRef={reportRef}
                    onPrint={handlePrint}
                />
            )}
        </div>
    );
}

// ─── MILESTONES TAB ───────────────────────────────────────────────────────────

function MilestonesTab({ domains, milestoneRecords, studentId, academicYearId, onUpdate }: any) {
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState<Record<string, string>>({});

    const getRecord = (milestoneId: string) =>
        milestoneRecords.find((r: any) => r.milestoneId === milestoneId);

    const handleStatusChange = async (milestoneId: string, status: MilestoneStatus) => {
        setUpdatingId(milestoneId);
        const notes = noteInput[milestoneId] || getRecord(milestoneId)?.notes || "";
        const res = await upsertMilestoneRecordAction(studentId, milestoneId, status, notes, academicYearId);
        if (res.success) {
            toast.success("Milestone updated");
            onUpdate();
        } else {
            toast.error("Failed to update milestone");
        }
        setUpdatingId(null);
    };

    return (
        <div className="space-y-4">
            {domains.map((domain: any) => {
                const Icon = DOMAIN_ICONS[domain.icon] || Brain;
                const achieved = domain.milestones.filter((m: any) =>
                    getRecord(m.id)?.status === "ACHIEVED"
                ).length;
                const pct = domain.milestones.length > 0
                    ? Math.round((achieved / domain.milestones.length) * 100)
                    : 0;
                const isOpen = expandedDomain === domain.id;

                return (
                    <div key={domain.id} className="bg-white rounded-[28px] border border-zinc-100 shadow-sm overflow-hidden">
                        {/* Domain Header */}
                        <button
                            onClick={() => setExpandedDomain(isOpen ? null : domain.id)}
                            className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: domain.color + "20" }}>
                                    <Icon className="h-6 w-6" style={{ color: domain.color }} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-black text-zinc-900">{domain.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">{domain.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm font-black text-zinc-900">{achieved}/{domain.milestones.length}</div>
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Achieved</div>
                                </div>
                                {/* Progress ring */}
                                <div className="relative h-12 w-12">
                                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f4f4f5" strokeWidth="3" />
                                        <circle
                                            cx="18" cy="18" r="15.9" fill="none"
                                            stroke={domain.color} strokeWidth="3"
                                            strokeDasharray={`${pct} ${100 - pct}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-700">{pct}%</span>
                                </div>
                                {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                            </div>
                        </button>

                        {/* Milestones List */}
                        {isOpen && (
                            <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                                {domain.milestones.map((milestone: any) => {
                                    const record = getRecord(milestone.id);
                                    const status: MilestoneStatus = record?.status || "NOT_STARTED";
                                    const isUpdating = updatingId === milestone.id;

                                    return (
                                        <div key={milestone.id} className="p-5 hover:bg-zinc-50/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-zinc-800">{milestone.title}</p>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{milestone.ageGroup}</span>
                                                </div>
                                                <StatusBadge status={status} />
                                            </div>
                                            {/* Status Buttons */}
                                            <div className="flex items-center gap-2 mt-3">
                                                {(["NOT_STARTED", "IN_PROGRESS", "ACHIEVED"] as MilestoneStatus[]).map((s) => (
                                                    <button
                                                        key={s}
                                                        disabled={isUpdating}
                                                        onClick={() => handleStatusChange(milestone.id, s)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                            status === s
                                                                ? s === "ACHIEVED" ? "bg-emerald-500 text-white border-emerald-500"
                                                                    : s === "IN_PROGRESS" ? "bg-amber-500 text-white border-amber-500"
                                                                        : "bg-zinc-700 text-white border-zinc-700"
                                                                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400"
                                                        )}
                                                    >
                                                        {isUpdating && status !== s ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                                            s === "NOT_STARTED" ? "Not Started" :
                                                                s === "IN_PROGRESS" ? "In Progress" : "✓ Achieved"}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Note */}
                                            <input
                                                type="text"
                                                placeholder="Add a note..."
                                                defaultValue={record?.notes || ""}
                                                onChange={(e) => setNoteInput(prev => ({ ...prev, [milestone.id]: e.target.value }))}
                                                className="mt-2 w-full text-xs px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-200"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── SKILLS TAB ───────────────────────────────────────────────────────────────

function SkillsTab({ domains, assessments, studentId, selectedTerm, onTermChange, academicYearId, onSaved }: any) {
    const [ratings, setRatings] = useState<Record<string, { rating: number; notes: string }>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initial: Record<string, { rating: number; notes: string }> = {};
        assessments.forEach((a: any) => {
            initial[a.skillId] = { rating: a.rating, notes: a.notes || "" };
        });
        setRatings(initial);
    }, [assessments]);

    const handleSave = async () => {
        setSaving(true);
        const payload = Object.entries(ratings).map(([skillId, { rating, notes }]) => ({
            skillId, rating, notes,
        }));
        const res = await bulkUpsertSkillAssessmentsAction(studentId, payload, selectedTerm, academicYearId);
        if (res.success) {
            toast.success("Skills saved");
            onSaved();
        } else {
            toast.error("Failed to save");
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Term Selector + Save */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {TERMS.map((t) => (
                        <button
                            key={t}
                            onClick={() => onTermChange(t)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                selectedTerm === t
                                    ? "bg-brand text-white border-brand"
                                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                            )}
                        >{t}</button>
                    ))}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save All
                </button>
            </div>

            {/* Rating Legend */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rating Scale:</span>
                {[1, 2, 3, 4].map((r) => (
                    <span key={r} className={cn("px-2.5 py-1 rounded-full text-[10px] font-black border", RATING_COLORS[r])}>
                        {r} — {RATING_LABELS[r]}
                    </span>
                ))}
            </div>

            {/* Skills by Domain */}
            {domains.map((domain: any) => {
                const Icon = DOMAIN_ICONS[domain.icon] || Brain;
                if (!domain.skills?.length) return null;

                return (
                    <div key={domain.id} className="bg-white rounded-[28px] border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-5 border-b border-zinc-100">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: domain.color + "20" }}>
                                <Icon className="h-4.5 w-4.5" style={{ color: domain.color }} />
                            </div>
                            <h3 className="font-black text-zinc-900">{domain.name}</h3>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {domain.skills.map((skill: any) => {
                                const current = ratings[skill.id] || { rating: 0, notes: "" };
                                return (
                                    <div key={skill.id} className="p-5">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                            <p className="font-bold text-sm text-zinc-800">{skill.name}</p>
                                            {current.rating > 0 && (
                                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black border", RATING_COLORS[current.rating])}>
                                                    {RATING_LABELS[current.rating]}
                                                </span>
                                            )}
                                        </div>
                                        {/* Rating Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            {[1, 2, 3, 4].map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRatings(prev => ({ ...prev, [skill.id]: { ...prev[skill.id] || { notes: "" }, rating: r } }))}
                                                    className={cn(
                                                        "flex-1 min-w-[60px] py-2.5 rounded-xl text-xs font-black transition-all border",
                                                        current.rating === r
                                                            ? RATING_COLORS[r].replace("border-", "bg-").split(" ")[0] + " " + RATING_COLORS[r].split(" ")[1] + " border-transparent shadow-sm"
                                                            : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-300"
                                                    )}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Teacher notes..."
                                            value={current.notes}
                                            onChange={(e) => setRatings(prev => ({ ...prev, [skill.id]: { ...prev[skill.id] || { rating: 0 }, notes: e.target.value } }))}
                                            className="mt-2 w-full text-xs px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-200"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────

function PortfolioTab({ entries, domains, studentId, academicYearId, onUpdate }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", type: "NOTE", mediaUrl: "", domainId: "" });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!form.title.trim()) return toast.error("Title is required");
        setSaving(true);
        const res = await createPortfolioEntryAction(studentId, { ...form, academicYearId });
        if (res.success) {
            toast.success("Portfolio entry added");
            setShowAdd(false);
            setForm({ title: "", description: "", type: "NOTE", mediaUrl: "", domainId: "" });
            onUpdate();
        } else {
            toast.error("Failed to add entry");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        const res = await deletePortfolioEntryAction(id);
        if (res.success) { toast.success("Deleted"); onUpdate(); }
        else toast.error("Failed to delete");
        setDeleting(null);
    };

    const typeIcon = (type: string) => {
        if (type === "PHOTO") return <Image className="h-4 w-4" />;
        if (type === "VIDEO") return <Video className="h-4 w-4" />;
        return <StickyNote className="h-4 w-4" />;
    };

    const typeColor = (type: string) => {
        if (type === "PHOTO") return "bg-blue-100 text-blue-600";
        if (type === "VIDEO") return "bg-purple-100 text-purple-600";
        return "bg-amber-100 text-amber-600";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-zinc-900">Digital Portfolio</h3>
                    <p className="text-sm text-zinc-500">{entries.length} entries</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Entry
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm space-y-4">
                    <h4 className="font-black text-zinc-900">New Portfolio Entry</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Title *</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. First painting"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none"
                            >
                                <option value="NOTE">📝 Note / Observation</option>
                                <option value="PHOTO">📷 Photo</option>
                                <option value="VIDEO">🎥 Video</option>
                                <option value="ARTWORK">🎨 Artwork</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Domain (optional)</label>
                            <select
                                value={form.domainId}
                                onChange={(e) => setForm(p => ({ ...p, domainId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none"
                            >
                                <option value="">No domain</option>
                                {domains.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Media URL (optional)</label>
                            <input
                                value={form.mediaUrl}
                                onChange={(e) => setForm(p => ({ ...p, mediaUrl: e.target.value }))}
                                placeholder="https://..."
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description / Observation</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            placeholder="Describe what the child did or achieved..."
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAdd} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black hover:brightness-110 transition-all disabled:opacity-50">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save Entry
                        </button>
                        <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-black hover:bg-zinc-200 transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Entries Grid */}
            {entries.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No portfolio entries yet</p>
                    <p className="text-sm mt-1">Add photos, notes, or observations to build this student's portfolio</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map((entry: any) => {
                        const domain = domains.find((d: any) => d.id === entry.domainId);
                        return (
                            <div key={entry.id} className="bg-white rounded-[20px] border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                {/* Media Preview */}
                                {entry.mediaUrl && entry.type === "PHOTO" ? (
                                    <div className="h-40 bg-zinc-100 overflow-hidden">
                                        <img src={entry.mediaUrl} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                ) : (
                                    <div className={cn("h-24 flex items-center justify-center", typeColor(entry.type))}>
                                        <div className="h-10 w-10 rounded-2xl bg-white/50 flex items-center justify-center">
                                            {typeIcon(entry.type)}
                                        </div>
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-black text-zinc-900 text-sm leading-tight">{entry.title}</h4>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            disabled={deleting === entry.id}
                                            className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all"
                                        >
                                            {deleting === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                        </button>
                                    </div>
                                    {entry.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{entry.description}</p>}
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", typeColor(entry.type))}>
                                            {entry.type}
                                        </span>
                                        {domain && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: domain.color }}>
                                                {domain.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-2">
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                        {entry.recordedBy && ` · ${entry.recordedBy.firstName}`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── REPORT CARD TAB ──────────────────────────────────────────────────────────

function ReportCardTab({ studentId, studentName, studentGrade, domains, milestoneRecords, assessments, report, selectedTerm, onTermChange, academicYearId, onSaved, reportRef, onPrint }: any) {
    const [form, setForm] = useState({
        teacherNarrative: "",
        strengthsNotes: "",
        areasToGrow: "",
        parentMessage: "",
    });
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (report) {
            setForm({
                teacherNarrative: report.teacherNarrative || "",
                strengthsNotes: report.strengthsNotes || "",
                areasToGrow: report.areasToGrow || "",
                parentMessage: report.parentMessage || "",
            });
        } else {
            setForm({ teacherNarrative: "", strengthsNotes: "", areasToGrow: "", parentMessage: "" });
        }
    }, [report, selectedTerm]);

    const handleSave = async () => {
        setSaving(true);
        const res = await saveDevelopmentReportAction(studentId, selectedTerm, form, academicYearId);
        if (res.success) { toast.success("Report saved"); onSaved(); }
        else toast.error("Failed to save");
        setSaving(false);
    };

    const handlePublish = async () => {
        if (!report?.id) return toast.error("Save the report first");
        setPublishing(true);
        const res = await publishDevelopmentReportAction(report.id);
        if (res.success) { toast.success("Report published!"); onSaved(); }
        else toast.error("Failed to publish");
        setPublishing(false);
    };

    // Compute summary stats for the report
    const totalMilestones = milestoneRecords.length;
    const achieved = milestoneRecords.filter((r: any) => r.status === "ACHIEVED").length;
    const avgRating = assessments.length > 0
        ? (assessments.reduce((s: number, a: any) => s + a.rating, 0) / assessments.length).toFixed(1)
        : "N/A";

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    {TERMS.map((t) => (
                        <button key={t} onClick={() => onTermChange(t)}
                            className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                selectedTerm === t ? "bg-brand text-white border-brand" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                            )}>{t}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-black hover:bg-zinc-700 transition-all disabled:opacity-50">
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Draft
                    </button>
                    <button onClick={onPrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-black hover:bg-zinc-200 transition-all">
                        <Printer className="h-3.5 w-3.5" />
                        Print
                    </button>
                    {!report?.published && (
                        <button onClick={handlePublish} disabled={publishing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50">
                            {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Publish
                        </button>
                    )}
                    {report?.published && (
                        <span className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Editor */}
                <div className="space-y-4">
                    <div className="bg-white rounded-[24px] border border-zinc-100 shadow-sm p-6 space-y-5">
                        <h3 className="font-black text-zinc-900">Teacher's Assessment — {selectedTerm}</h3>

                        {[
                            { key: "teacherNarrative", label: "Overall Narrative", placeholder: "Write a holistic summary of this child's development this term..." },
                            { key: "strengthsNotes", label: "Strengths & Achievements", placeholder: "What has this child excelled at? What are they proud of?" },
                            { key: "areasToGrow", label: "Areas for Growth", placeholder: "What areas would benefit from more focus and support?" },
                            { key: "parentMessage", label: "Message to Parents", placeholder: "A personal note to the family..." },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
                                <textarea
                                    value={(form as any)[key]}
                                    onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                                    rows={3}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-sm font-medium text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <div ref={reportRef} className="bg-white rounded-[24px] border-2 border-zinc-200 shadow-sm p-8 space-y-6 print:border-0 print:shadow-none print:rounded-none">
                        {/* Report Header */}
                        <div className="text-center border-b border-zinc-100 pb-6">
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Student Development Report</div>
                            <h2 className="text-2xl font-black text-zinc-900">{studentName}</h2>
                            <div className="flex items-center justify-center gap-3 mt-2 text-sm text-zinc-500 font-medium">
                                {studentGrade && <span>Grade: {studentGrade}</span>}
                                <span>·</span>
                                <span>{selectedTerm}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-2xl bg-emerald-50">
                                <div className="text-xl font-black text-emerald-700">{achieved}/{totalMilestones}</div>
                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Milestones</div>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-blue-50">
                                <div className="text-xl font-black text-blue-700">{avgRating}</div>
                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Avg Rating</div>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-purple-50">
                                <div className="text-xl font-black text-purple-700">{totalMilestones > 0 ? Math.round((achieved / totalMilestones) * 100) : 0}%</div>
                                <div className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Progress</div>
                            </div>
                        </div>

                        {/* Domain Progress */}
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Development Areas</div>
                            {domains.map((domain: any) => {
                                const domainMilestones = milestoneRecords.filter((r: any) => r.milestone?.domainId === domain.id);
                                const domainAchieved = domainMilestones.filter((r: any) => r.status === "ACHIEVED").length;
                                const pct = domainMilestones.length > 0 ? Math.round((domainAchieved / domainMilestones.length) * 100) : 0;
                                return (
                                    <div key={domain.id} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-zinc-600 w-32 truncate">{domain.name}</span>
                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: domain.color }} />
                                        </div>
                                        <span className="text-xs font-black text-zinc-500 w-8 text-right">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Narrative Sections */}
                        {form.teacherNarrative && (
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Overall Assessment</div>
                                <p className="text-sm text-zinc-700 leading-relaxed">{form.teacherNarrative}</p>
                            </div>
                        )}
                        {form.strengthsNotes && (
                            <div className="space-y-1 p-4 bg-emerald-50 rounded-2xl">
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✨ Strengths</div>
                                <p className="text-sm text-emerald-800 leading-relaxed">{form.strengthsNotes}</p>
                            </div>
                        )}
                        {form.areasToGrow && (
                            <div className="space-y-1 p-4 bg-amber-50 rounded-2xl">
                                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">🌱 Areas to Grow</div>
                                <p className="text-sm text-amber-800 leading-relaxed">{form.areasToGrow}</p>
                            </div>
                        )}
                        {form.parentMessage && (
                            <div className="space-y-1 p-4 bg-blue-50 rounded-2xl">
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">💌 Message to Parents</div>
                                <p className="text-sm text-blue-800 leading-relaxed">{form.parentMessage}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-zinc-100 pt-4 text-center text-[10px] text-zinc-400 font-medium">
                            Generated on {new Date().toLocaleDateString()} · Confidential
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
