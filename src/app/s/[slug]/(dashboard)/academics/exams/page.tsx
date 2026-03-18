"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createExamAction, getExamsAction, updateExamAction, deleteExamAction } from "@/app/actions/exam-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { generateExamRosterAction, saveExamRosterAction, updateScheduleEntryAction, addScheduleEntryAction, deleteScheduleEntryAction, getExamWithScheduleAction, swapScheduleEntriesAction } from "@/app/actions/exam-roster-actions";
import { toast } from "sonner";
import {
    Plus, Pencil, Trash2, Calendar, Clock, Users, BookOpen,
    FileSpreadsheet, Loader2, X, GraduationCap, Search,
    Wand2, Coffee, ArrowRight, ChevronDown, ChevronUp, Printer, GripVertical,
    Save, LayoutGrid, List, Eye, Sparkles, CalendarDays
} from "lucide-react";
import Link from "next/link";

// ── Types ──
type ScheduleEntry = {
    id?: string; subject: string; date: string; startTime: string; endTime: string;
    maxMarks: number; room?: string; invigilator?: string; instructions?: string;
    syllabus?: string; sortOrder: number; isGapDay: boolean; gapLabel?: string;
};

type Exam = {
    id: string; title: string; description?: string; date: string;
    startDate?: string; endDate?: string;
    type: string; category: string; classrooms: string; subjects: string;
    maxMarks: number; minMarks: number; gradingSystem: string;
    scheduleEntries?: ScheduleEntry[];
    _count?: { results: number };
};

type Classroom = { id: string; name: string };
type Subject = { id: string; name: string };

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "bg-blue-100 text-blue-800 border-blue-200",
    English: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Science: "bg-purple-100 text-purple-800 border-purple-200",
    Hindi: "bg-orange-100 text-orange-800 border-orange-200",
    "Environmental Studies": "bg-green-100 text-green-800 border-green-200",
    Arts: "bg-pink-100 text-pink-800 border-pink-200",
    Music: "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Physical Education": "bg-amber-100 text-amber-800 border-amber-200",
};
const DEFAULT_COLOR = "bg-slate-100 text-slate-800 border-slate-200";

const SUBJECT_ICONS: Record<string, string> = {
    Mathematics: "📐", English: "📖", Science: "🔬", Hindi: "🕉️",
    "Environmental Studies": "🌿", Arts: "🎨", Music: "🎵", "Physical Education": "⚽",
};

export default function ExamsSchedulerPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [exams, setExams] = useState<Exam[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    // Tab state
    const [activeTab, setActiveTab] = useState<"list" | "builder" | "classview">("list");

    // List tab state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("ALL");

    // Create/Edit dialog
    const [showDialog, setShowDialog] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Builder tab state
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [selectedExamData, setSelectedExamData] = useState<Exam | null>(null);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [previewEntries, setPreviewEntries] = useState<ScheduleEntry[] | null>(null);
    const [previewStats, setPreviewStats] = useState<any>(null);
    const [generating, setGenerating] = useState(false);
    const [savingRoster, setSavingRoster] = useState(false);

    // Class view state
    const [selectedClassId, setSelectedClassId] = useState<string>("");

    // AI Dialog state
    const [aiConfig, setAiConfig] = useState({
        subjects: [] as string[],
        startDate: "",
        endDate: "",
        gapStrategy: "ONE_DAY" as "NONE" | "ONE_DAY" | "TWO_DAY" | "CUSTOM",
        customGapDays: 1,
        dailyStartTime: "09:00",
        dailyEndTime: "12:00",
        maxExamsPerDay: 1,
        excludeWeekends: true,
        excludeDates: [] as string[],
        subjectMaxMarks: {} as Record<string, number>,
        ordering: "AS_PROVIDED" as "HARDEST_FIRST" | "ALPHABETICAL" | "AS_PROVIDED",
    });

    // Form state
    const [form, setForm] = useState({
        title: "", description: "", date: "",
        type: "TERM", category: "ACADEMIC",
        selectedClassrooms: [] as string[],
        selectedSubjects: [] as string[],
        maxMarks: 100, minMarks: 35,
        gradingSystem: "MARKS",
    });

    useEffect(() => { loadData(); }, []);

    // When selectedExamId changes, load its schedule
    useEffect(() => {
        if (selectedExamId) loadSelectedExam(selectedExamId);
        else setSelectedExamData(null);
    }, [selectedExamId]);

    const loadData = async () => {
        setLoading(true);
        const [examsRes, classesRes, subjectsRes] = await Promise.all([
            getExamsAction(slug),
            getClassroomsAction(slug),
            getMasterDataAction("SUBJECT"),
        ]);
        if (examsRes.success && examsRes.data) setExams(examsRes.data);
        if (classesRes.success && classesRes.data) setClassrooms(classesRes.data);
        if (subjectsRes.success && subjectsRes.data) setMasterSubjects(subjectsRes.data);
        setLoading(false);
    };

    const loadSelectedExam = async (examId: string) => {
        setLoadingSchedule(true);
        const res = await getExamWithScheduleAction(examId);
        if (res.success && res.data) setSelectedExamData(res.data);
        setLoadingSchedule(false);
    };

    // ── Create / Edit Dialog ──
    const openCreate = () => {
        setEditingExam(null);
        setForm({ title: "", description: "", date: "", type: "TERM", category: "ACADEMIC", selectedClassrooms: [], selectedSubjects: [], maxMarks: 100, minMarks: 35, gradingSystem: "MARKS" });
        setShowDialog(true);
    };

    const openEdit = (exam: Exam) => {
        setEditingExam(exam);
        let clsIds: string[] = [], subNames: string[] = [];
        try { clsIds = JSON.parse(exam.classrooms || "[]"); } catch {}
        try { subNames = JSON.parse(exam.subjects || "[]"); } catch {}
        setForm({
            title: exam.title, description: exam.description || "",
            date: new Date(exam.date).toISOString().split("T")[0],
            type: exam.type, category: exam.category,
            selectedClassrooms: clsIds, selectedSubjects: subNames,
            maxMarks: exam.maxMarks, minMarks: exam.minMarks,
            gradingSystem: exam.gradingSystem,
        });
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.date) { toast.error("Title and Date required"); return; }
        if (form.selectedClassrooms.length === 0) { toast.error("Select at least one classroom"); return; }
        setSaving(true);
        const payload = {
            title: form.title, description: form.description || undefined,
            date: new Date(form.date), type: form.type, category: form.category,
            classrooms: form.selectedClassrooms, subjects: form.selectedSubjects,
            maxMarks: form.maxMarks, minMarks: form.minMarks, gradingSystem: form.gradingSystem,
        };
        const res = editingExam
            ? await updateExamAction(slug, editingExam.id, payload)
            : await createExamAction(slug, payload);
        if (res.success) {
            toast.success(editingExam ? "Exam updated" : "Exam created! Now generate the timetable →");
            setShowDialog(false);
            await loadData();
            if (!editingExam && res.data?.id) {
                setSelectedExamId(res.data.id);
                setActiveTab("builder");
            }
        } else toast.error(res.error || "Failed");
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(confirmDeleteId);
        const res = await deleteExamAction(slug, confirmDeleteId);
        if (res.success) { toast.success("Exam deleted"); await loadData(); }
        else toast.error(res.error || "Failed");
        setDeleting(null);
        setConfirmDeleteId(null);
    };

    // ── Print Timetable ──
    const printTimetable = () => {
        const className = classrooms.find(c => c.id === selectedClassId)?.name || "—";
        const examRows = classExams.map(exam => {
            const entries = exam.scheduleEntries || [];
            const subjectEntries = entries.filter(e => !e.isGapDay);
            const gapEntries = entries.filter(e => e.isGapDay);
            const rows = entries.map(e => {
                const d = new Date(e.date);
                const day = d.toLocaleDateString("en-IN", { weekday: "short" });
                const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                if (e.isGapDay) {
                    return `<tr style="background:#fffbeb"><td style="padding:8px 12px;border:1px solid #ddd;text-align:center;color:#92400e">${day}</td><td style="padding:8px 12px;border:1px solid #ddd;color:#92400e">${dateStr}</td><td colspan="4" style="padding:8px 12px;border:1px solid #ddd;text-align:center;color:#92400e;font-style:italic">☕ ${e.gapLabel || "Study Leave / Revision Day"}</td></tr>`;
                }
                return `<tr><td style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:500">${day}</td><td style="padding:8px 12px;border:1px solid #ddd">${dateStr}</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:700">${e.subject}</td><td style="padding:8px 12px;border:1px solid #ddd">${e.startTime} – ${e.endTime}</td><td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${e.maxMarks}</td><td style="padding:8px 12px;border:1px solid #ddd;font-size:12px;color:#666">${e.syllabus || "—"}</td></tr>`;
            }).join("");

            return `
                <div style="margin-bottom:32px">
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
                        <h2 style="font-size:16px;font-weight:700;margin:0">${exam.title}</h2>
                        <span style="font-size:12px;color:#666">${exam.type} · ${subjectEntries.length} Subjects · ${gapEntries.length} Study Days</span>
                    </div>
                    <table style="width:100%;border-collapse:collapse;font-size:13px">
                        <thead>
                            <tr style="background:#f1f5f9">
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:600;width:60px">Day</th>
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;font-weight:600;width:130px">Date</th>
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;font-weight:600">Subject</th>
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;font-weight:600;width:120px">Time</th>
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;font-weight:600;width:70px">Marks</th>
                                <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;font-weight:600">Syllabus / Topics</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        }).join("");

        const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Exam Timetable – ${className}</title>
    <style>
        @page { size: A4 landscape; margin: 15mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 3px double #334155; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px; }
        .header .subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .class-badge { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 16px; font-weight: 700; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
        .sign-area { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 8px; }
        .sign-box { width: 200px; text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; color: #64748b; }
        @media print { body { padding: 0; } .no-print { display: none !important; } }
    </style>
</head>
<body>
    <div class="no-print" style="text-align:center;margin-bottom:16px">
        <button onclick="window.print()" style="padding:10px 28px;font-size:14px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">🖨️ Print Timetable</button>
        <button onclick="window.close()" style="padding:10px 28px;font-size:14px;background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;font-weight:600;margin-left:8px">✕ Close</button>
    </div>
    <div class="header">
        <h1>📚 Examination Timetable</h1>
        <p class="subtitle">Academic Year 2025–2026</p>
        <div class="class-badge">🎓 ${className}</div>
    </div>
    ${examRows}
    <div class="sign-area">
        <div class="sign-box">Class Teacher</div>
        <div class="sign-box">Vice Principal</div>
        <div class="sign-box">Principal</div>
    </div>
    <div class="footer">
        Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · This is a computer-generated document
    </div>
</body>
</html>`;
        const win = window.open("", "_blank");
        if (win) {
            win.document.write(printHTML);
            win.document.close();
        }
    };

    // ── AI Roster Generation ──
    const openAIDialog = () => {
        const exam = selectedExamData || selectedExamObj;
        if (!exam) return;
        let subs: string[] = [];
        try { subs = JSON.parse(exam.subjects || "[]"); } catch {}
        if (subs.length === 0) subs = masterSubjects.map(s => s.name);

        const subMarks: Record<string, number> = {};
        subs.forEach(s => { subMarks[s] = exam.maxMarks || 100; });

        setAiConfig(prev => ({
            ...prev,
            subjects: subs,
            startDate: exam.startDate ? new Date(exam.startDate).toISOString().split("T")[0] : new Date(exam.date).toISOString().split("T")[0],
            endDate: exam.endDate ? new Date(exam.endDate).toISOString().split("T")[0] : "",
            subjectMaxMarks: subMarks,
        }));
        setPreviewEntries(null);
        setPreviewStats(null);
        setShowAIDialog(true);
    };

    const handleGenerate = async () => {
        if (aiConfig.subjects.length === 0) { toast.error("Select at least one subject"); return; }
        if (!aiConfig.startDate || !aiConfig.endDate) { toast.error("Set start and end dates"); return; }
        setGenerating(true);
        const res = await generateExamRosterAction({
            ...aiConfig,
            subjectPriority: aiConfig.subjects,
        });
        if (res.success && res.data) {
            setPreviewEntries(res.data);
            setPreviewStats(res.stats);
            toast.success(`🎉 Generated ${res.stats?.examDays} exam days + ${res.stats?.gapDays} study leaves`);
        } else toast.error(res.error || "Generation failed");
        setGenerating(false);
    };

    const handleSaveRoster = async () => {
        if (!selectedExamId || !previewEntries) return;
        setSavingRoster(true);
        const res = await saveExamRosterAction(slug, selectedExamId, previewEntries);
        if (res.success) {
            toast.success(`Saved ${res.data?.count} schedule entries!`);
            setShowAIDialog(false);
            setPreviewEntries(null);
            await loadData();
            if (selectedExamId) await loadSelectedExam(selectedExamId);

            // Trigger notifications
            const exam = exams.find(e => e.id === selectedExamId);
            if (exam) {
                let classroomIds: string[] = [];
                try { classroomIds = JSON.parse(exam.classrooms || "[]"); } catch {}
                try {
                    await fetch("/api/exam-notifications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            examId: selectedExamId,
                            title: exam.title,
                            date: exam.date,
                            classroomIds,
                            schoolSlug: slug,
                        }),
                    });
                } catch {}
            }
        } else toast.error(res.error || "Save failed");
        setSavingRoster(false);
    };

    const toggleAiSubject = (name: string) => {
        setAiConfig(prev => ({
            ...prev,
            subjects: prev.subjects.includes(name)
                ? prev.subjects.filter(s => s !== name)
                : [...prev.subjects, name],
        }));
    };

    // ── Helpers ──
    const selectedExamObj = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

    const getClassNames = (json: string) => {
        try { return JSON.parse(json || "[]").map((id: string) => classrooms.find(c => c.id === id)?.name || "?").join(", "); }
        catch { return "-"; }
    };

    const daysUntil = (d: string) => {
        const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
        if (diff === 0) return "Today";
        if (diff === 1) return "Tomorrow";
        if (diff < 0) return `${Math.abs(diff)}d ago`;
        return `In ${diff}d`;
    };

    const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const fmtDateLong = (d: string) => new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const filtered = exams.filter(e => {
        if (filterType !== "ALL" && e.type !== filterType) return false;
        if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });
    const upcoming = filtered.filter(e => new Date(e.date) >= new Date()).sort((a, b) => +new Date(a.date) - +new Date(b.date));
    const past = filtered.filter(e => new Date(e.date) < new Date()).sort((a, b) => +new Date(b.date) - +new Date(a.date));

    // Class-wise filtering — load schedule entries on demand
    const [classExams, setClassExams] = useState<Exam[]>([]);
    const [loadingClassExams, setLoadingClassExams] = useState(false);

    useEffect(() => {
        if (activeTab !== "classview" || !selectedClassId) { setClassExams([]); return; }
        const matching = exams.filter(e => {
            try { return JSON.parse(e.classrooms || "[]").includes(selectedClassId); }
            catch { return false; }
        });
        if (matching.length === 0) { setClassExams([]); return; }

        setLoadingClassExams(true);
        Promise.all(matching.map(e => getExamWithScheduleAction(e.id)))
            .then(results => {
                const loaded = results.filter(r => r.success && r.data).map(r => r.data as Exam);
                setClassExams(loaded);
            })
            .finally(() => setLoadingClassExams(false));
    }, [exams, selectedClassId, activeTab]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* ════════════ CONFIRM DELETE DIALOG ════════════ */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Delete Exam?</h3>
                            <p className="text-sm text-muted-foreground">This will permanently delete the exam and all its schedule entries. This action cannot be undone.</p>
                        </div>
                        <div className="flex border-t">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={!!deleting} className="flex-1 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-l transition-colors disabled:opacity-50">
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showDialog && (
            <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Examination Scheduler</h1>
                    <p className="text-sm text-muted-foreground mt-1">Create exams, generate AI timetables, and manage schedules</p>
                </div>
                <Button onClick={openCreate} className="bg-brand hover:brightness-110">
                    <Plus className="mr-2 h-4 w-4" /> New Exam
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Calendar, label: "Total", value: exams.length, color: "blue" },
                    { icon: Clock, label: "Upcoming", value: upcoming.length, color: "green" },
                    { icon: BookOpen, label: "With Schedule", value: exams.filter(e => e.startDate).length, color: "purple" },
                    { icon: FileSpreadsheet, label: "Tests/Quizzes", value: exams.filter(e => e.type === "TEST").length, color: "orange" },
                ].map((s, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-${s.color}-50`}><s.icon className={`h-5 w-5 text-${s.color}-600`} /></div>
                            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {[
                    { id: "list" as const, label: "All Exams", icon: List },
                    { id: "builder" as const, label: "Timetable Builder", icon: LayoutGrid },
                    { id: "classview" as const, label: "Class-wise View", icon: Users },
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? "bg-white shadow-sm text-brand" : "text-slate-500 hover:text-slate-700"}`}>
                        <t.icon className="h-4 w-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ════════════ TAB 1: EXAM LIST ════════════ */}
            {activeTab === "list" && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search exams..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="TERM">Term Exam</SelectItem>
                                <SelectItem value="TEST">Test / Quiz</SelectItem>
                                <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {upcoming.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Upcoming</h2>
                            <div className="grid gap-3">{upcoming.map(e => <ExamListCard key={e.id} exam={e} slug={slug} classrooms={classrooms} daysUntil={daysUntil(e.date)} fmtDate={fmtDate} onEdit={() => openEdit(e)} onDelete={() => setConfirmDeleteId(e.id)} isDeleting={deleting === e.id} onBuild={() => { setSelectedExamId(e.id); setActiveTab("builder"); }} isUpcoming />)}</div>
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-slate-500 mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Past</h2>
                            <div className="grid gap-3">{past.map(e => <ExamListCard key={e.id} exam={e} slug={slug} classrooms={classrooms} daysUntil={daysUntil(e.date)} fmtDate={fmtDate} onEdit={() => openEdit(e)} onDelete={() => setConfirmDeleteId(e.id)} isDeleting={deleting === e.id} onBuild={() => { setSelectedExamId(e.id); setActiveTab("builder"); }} />)}</div>
                        </div>
                    )}
                    {filtered.length === 0 && <EmptyState onClick={openCreate} />}
                </div>
            )}

            {/* ════════════ TAB 2: TIMETABLE BUILDER ════════════ */}
            {activeTab === "builder" && (
                <div className="space-y-4">
                    {/* Exam selector */}
                    <div className="flex items-center gap-3">
                        <Select value={selectedExamId || "__none__"} onValueChange={(v: string) => setSelectedExamId(v === "__none__" ? null : v)}>
                            <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select an exam..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__" disabled>Select an exam...</SelectItem>
                                {exams.map(e => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.title} — {fmtDate(e.date)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedExamId && (
                            <Button onClick={openAIDialog} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white">
                                <Wand2 className="mr-2 h-4 w-4" /> AI Generate Timetable
                            </Button>
                        )}
                    </div>

                    {!selectedExamId && (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <Sparkles className="mx-auto h-10 w-10 text-purple-300 mb-3" />
                            <p className="font-medium text-muted-foreground">Select an exam above to build its timetable</p>
                            <p className="text-sm text-muted-foreground mt-1">Or <button onClick={openCreate} className="text-brand underline">create a new exam</button> first</p>
                        </div>
                    )}

                    {loadingSchedule && (
                        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
                    )}

                    {selectedExamData && !loadingSchedule && (
                        <div className="space-y-4">
                            {/* Exam info bar */}
                            <Card className="border-l-4 border-l-brand">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedExamData.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span><Calendar className="inline h-3 w-3 mr-1" />{fmtDate(selectedExamData.date)}</span>
                                            <span><Users className="inline h-3 w-3 mr-1" />{getClassNames(selectedExamData.classrooms)}</span>
                                            <Badge variant="outline">{selectedExamData.type}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-brand">{selectedExamData.scheduleEntries?.filter(e => !e.isGapDay).length || 0}</div>
                                        <div className="text-xs text-muted-foreground">Subjects Scheduled</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule Timeline */}
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><GripVertical className="h-3 w-3" /> Drag entries to swap positions</p>
                            </div>
                            {(selectedExamData.scheduleEntries?.length || 0) > 0 ? (
                                <div className="space-y-2">
                                    {selectedExamData.scheduleEntries!.map((entry, idx) => (
                                        <ScheduleEntryCard key={entry.id || idx} entry={entry} idx={idx}
                                            onUpdate={async (entryId, data) => {
                                                // Optimistic update
                                                setSelectedExamData((prev: any) => {
                                                    if (!prev?.scheduleEntries) return prev;
                                                    return { ...prev, scheduleEntries: prev.scheduleEntries.map((e: any) => e.id === entryId ? { ...e, ...data } : e) };
                                                });
                                                const res = await updateScheduleEntryAction(entryId, data);
                                                if (res.success) toast.success("Updated");
                                                else { toast.error(res.error || "Failed"); if (selectedExamId) loadSelectedExam(selectedExamId); }
                                            }}
                                            onSwap={async (fromId, toId) => {
                                                // Optimistic swap: swap dates & sortOrders locally
                                                setSelectedExamData((prev: any) => {
                                                    if (!prev?.scheduleEntries) return prev;
                                                    const entries = [...prev.scheduleEntries];
                                                    const a = entries.find((e: any) => e.id === fromId);
                                                    const b = entries.find((e: any) => e.id === toId);
                                                    if (a && b) {
                                                        const tmpDate = a.date; const tmpSort = a.sortOrder;
                                                        a.date = b.date; a.sortOrder = b.sortOrder;
                                                        b.date = tmpDate; b.sortOrder = tmpSort;
                                                        entries.sort((x: any, y: any) => (x.sortOrder || 0) - (y.sortOrder || 0));
                                                    }
                                                    return { ...prev, scheduleEntries: entries };
                                                });
                                                toast.success("Swapped!");
                                                const res = await swapScheduleEntriesAction(fromId, toId);
                                                if (!res.success) { toast.error(res.error || "Swap failed"); if (selectedExamId) loadSelectedExam(selectedExamId); }
                                            }}
                                            onDelete={async (entryId) => {
                                                // Optimistic delete
                                                setSelectedExamData((prev: any) => {
                                                    if (!prev?.scheduleEntries) return prev;
                                                    return { ...prev, scheduleEntries: prev.scheduleEntries.filter((e: any) => e.id !== entryId) };
                                                });
                                                toast.success("Removed");
                                                const res = await deleteScheduleEntryAction(entryId);
                                                if (!res.success) { toast.error(res.error || "Delete failed"); if (selectedExamId) loadSelectedExam(selectedExamId); }
                                            }}
                                        />
                                    ))}
                                    {/* Add entry manually */}
                                    <Button variant="outline" className="w-full mt-3 border-dashed" onClick={async () => {
                                        if (!selectedExamId) return;
                                        const lastEntry = selectedExamData.scheduleEntries?.[selectedExamData.scheduleEntries.length - 1];
                                        const nextDate = lastEntry ? new Date(new Date(lastEntry.date).getTime() + 86400000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
                                        const res = await addScheduleEntryAction(selectedExamId, { subject: "New Subject", date: nextDate, startTime: "09:00", endTime: "12:00", maxMarks: 100 });
                                        if (res.success) { toast.success("Entry added — edit it below"); loadSelectedExam(selectedExamId); }
                                        else toast.error(res.error || "Failed");
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Entry Manually
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Wand2 className="mx-auto h-8 w-8 text-purple-400 mb-3" />
                                    <p className="font-bold text-muted-foreground">No schedule yet</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">Use AI or manually create the exam schedule</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <Button onClick={openAIDialog} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                            <Wand2 className="mr-2 h-4 w-4" /> AI Generate
                                        </Button>
                                        <Button variant="outline" onClick={async () => {
                                            if (!selectedExamId) return;
                                            const res = await addScheduleEntryAction(selectedExamId, { subject: "New Subject", date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "12:00", maxMarks: 100 });
                                            if (res.success) { toast.success("Entry added — edit it below"); loadSelectedExam(selectedExamId); }
                                            else toast.error(res.error || "Failed");
                                        }}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Manually
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════ TAB 3: CLASS-WISE VIEW ════════════ */}
            {activeTab === "classview" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                    <Select value={selectedClassId || "__none__"} onValueChange={(v: string) => setSelectedClassId(v === "__none__" ? "" : v)}>
                        <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a classroom..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__" disabled>Select a classroom...</SelectItem>
                            {classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {selectedClassId && !loadingClassExams && classExams.length > 0 && (
                        <Button variant="outline" onClick={() => printTimetable()} className="gap-2">
                            <Printer className="h-4 w-4" /> Print Timetable
                        </Button>
                    )}
                    </div>

                    {!selectedClassId && (
                        <div className="text-center py-16 border-2 border-dashed rounded-xl">
                            <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                            <p className="font-medium text-muted-foreground">Select a classroom to view its exam timetable</p>
                        </div>
                    )}

                    {selectedClassId && loadingClassExams && (
                        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
                    )}

                    {selectedClassId && !loadingClassExams && classExams.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                            <p className="text-muted-foreground">No exams assigned to this classroom</p>
                        </div>
                    )}

                    {selectedClassId && !loadingClassExams && classExams.length > 0 && (
                        <div className="space-y-6">
                            {classExams.map(exam => (
                                <Card key={exam.id} className="overflow-hidden">
                                    <div className="bg-gradient-to-r from-brand/10 to-transparent px-5 py-3 border-b flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold">{exam.title}</h3>
                                            <p className="text-xs text-muted-foreground">{fmtDateLong(exam.date)} · {exam.type}</p>
                                        </div>
                                        <Badge>{(exam.scheduleEntries?.filter(e => !e.isGapDay).length || 0)} subjects</Badge>
                                    </div>
                                    <CardContent className="p-0">
                                        {(exam.scheduleEntries?.length || 0) > 0 ? (
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 text-xs text-muted-foreground">
                                                        <th className="text-left px-4 py-2 font-medium">Day</th>
                                                        <th className="text-left px-4 py-2 font-medium">Date</th>
                                                        <th className="text-left px-4 py-2 font-medium">Subject</th>
                                                        <th className="text-left px-4 py-2 font-medium">Time</th>
                                                        <th className="text-left px-4 py-2 font-medium">Marks</th>
                                                        <th className="text-left px-4 py-2 font-medium">Syllabus</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exam.scheduleEntries!.map((e, i) => (
                                                        <tr key={i} className={`border-t ${e.isGapDay ? "bg-amber-50/50" : "hover:bg-slate-50"}`}>
                                                            <td className="px-4 py-2.5 font-medium text-xs text-slate-500">
                                                                {new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" })}
                                                            </td>
                                                            <td className="px-4 py-2.5 font-mono text-xs">
                                                                {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                            </td>
                                                            <td className="px-4 py-2.5">
                                                                {e.isGapDay ? (
                                                                    <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                                                                        <Coffee className="h-3 w-3" /> {e.gapLabel || "Study Leave"}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <span>{SUBJECT_ICONS[e.subject] || "📝"}</span>
                                                                        <span className="font-bold">{e.subject}</span>
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-xs">{e.isGapDay ? "—" : `${e.startTime} – ${e.endTime}`}</td>
                                                            <td className="px-4 py-2.5 text-xs font-medium">{e.isGapDay ? "" : e.maxMarks}</td>
                                                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.syllabus || "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-6 text-center text-muted-foreground text-sm">
                                                No timetable generated yet. Use the Timetable Builder tab.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
            </>
            )}

            {/* ════════════ CREATE/EDIT — FULL PAGE VIEW ════════════ */}
            {showDialog && (
                <div className="space-y-6">
                    {/* Back header */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowDialog(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" title="Back">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{editingExam ? "Edit Exam" : "Schedule New Exam"}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{editingExam ? "Update exam details below" : "Fill in the details to create a new exam"}</p>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-6">
                            {/* Row 1: Title + Date */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-medium">Exam Title <span className="text-red-500">*</span></Label>
                                    <Input placeholder="e.g. Term 2 Finals" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-medium">Start Date <span className="text-red-500">*</span></Label>
                                    <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11" />
                                </div>
                            </div>

                            {/* Row 2: Description */}
                            <div className="space-y-2">
                                <Label className="font-medium">Description</Label>
                                <Input placeholder="Optional description for this exam..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="h-11" />
                            </div>

                            {/* Row 3: Type, Category, Grading */}
                            <div className="grid grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-medium">Type</Label>
                                    <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v })}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TERM">Term Exam</SelectItem>
                                            <SelectItem value="TEST">Test / Quiz</SelectItem>
                                            <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-medium">Category</Label>
                                    <Select value={form.category} onValueChange={(v: string) => setForm({ ...form, category: v })}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACADEMIC">Academic</SelectItem>
                                            <SelectItem value="SPORTS">Sports</SelectItem>
                                            <SelectItem value="ARTS">Arts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-medium">Grading</Label>
                                    <Select value={form.gradingSystem} onValueChange={(v: string) => setForm({ ...form, gradingSystem: v })}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MARKS">Marks</SelectItem>
                                            <SelectItem value="GRADE">Grades</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 4: Max / Pass Marks */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-medium">Max Marks</Label>
                                    <Input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: +e.target.value })} className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-medium">Pass Marks</Label>
                                    <Input type="number" value={form.minMarks} onChange={e => setForm({ ...form, minMarks: +e.target.value })} className="h-11" />
                                </div>
                            </div>

                            {/* Row 5: Classrooms + Subjects side by side */}
                            <div className="grid md:grid-cols-2 gap-5">
                                {/* Classrooms */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-medium"><Users className="h-4 w-4" /> Classrooms <span className="text-red-500">*</span></Label>
                                    <div className="border rounded-xl p-3 max-h-52 overflow-y-auto space-y-1">
                                        {classrooms.map(c => (
                                            <label key={c.id} className="flex items-center gap-2.5 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                                <Checkbox checked={form.selectedClassrooms.includes(c.id)} onCheckedChange={() => setForm(p => ({ ...p, selectedClassrooms: p.selectedClassrooms.includes(c.id) ? p.selectedClassrooms.filter(x => x !== c.id) : [...p.selectedClassrooms, c.id] }))} />
                                                {c.name}
                                            </label>
                                        ))}
                                    </div>
                                    <button className="text-xs text-brand hover:underline" onClick={() => setForm(p => ({ ...p, selectedClassrooms: p.selectedClassrooms.length === classrooms.length ? [] : classrooms.map(c => c.id) }))}>
                                        {form.selectedClassrooms.length === classrooms.length ? "Deselect All" : "Select All"}
                                    </button>
                                    <p className="text-xs text-muted-foreground">{form.selectedClassrooms.length} selected</p>
                                </div>

                                {/* Subjects */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 font-medium"><BookOpen className="h-4 w-4" /> Subjects</Label>
                                    <div className="border rounded-xl p-3 max-h-52 overflow-y-auto space-y-1">
                                        {masterSubjects.map(s => (
                                            <label key={s.id} className="flex items-center gap-2.5 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                                <Checkbox checked={form.selectedSubjects.includes(s.name)} onCheckedChange={() => setForm(p => ({ ...p, selectedSubjects: p.selectedSubjects.includes(s.name) ? p.selectedSubjects.filter(x => x !== s.name) : [...p.selectedSubjects, s.name] }))} />
                                                <span>{SUBJECT_ICONS[s.name] || "📝"}</span> {s.name}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{form.selectedSubjects.length} selected</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Exams
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-brand hover:brightness-110 h-11 px-6 text-base">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingExam ? "Update Exam" : "Create & Build Timetable →"}
                        </Button>
                    </div>
                </div>
            )}

            {/* ════════════ AI ROSTER DIALOG ════════════ */}
            {showAIDialog && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white"><Wand2 className="h-5 w-5" /></div>
                                <div>
                                    <h2 className="text-lg font-bold">AI Exam Timetable Generator</h2>
                                    <p className="text-xs text-muted-foreground">Configure constraints and let AI create the optimal schedule</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIDialog(false)} className="p-1 rounded-lg hover:bg-white/80" title="Close"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={aiConfig.startDate} onChange={e => setAiConfig({ ...aiConfig, startDate: e.target.value })} /></div>
                                <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={aiConfig.endDate} onChange={e => setAiConfig({ ...aiConfig, endDate: e.target.value })} /></div>
                            </div>

                            {/* Time slot */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Exam Start Time</Label><Input type="time" value={aiConfig.dailyStartTime} onChange={e => setAiConfig({ ...aiConfig, dailyStartTime: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Exam End Time</Label><Input type="time" value={aiConfig.dailyEndTime} onChange={e => setAiConfig({ ...aiConfig, dailyEndTime: e.target.value })} /></div>
                            </div>

                            {/* Gap strategy */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gap Between Exams</Label>
                                    <Select value={aiConfig.gapStrategy} onValueChange={(v: any) => setAiConfig({ ...aiConfig, gapStrategy: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">No gap — daily exams</SelectItem>
                                            <SelectItem value="ONE_DAY">1 day study leave</SelectItem>
                                            <SelectItem value="TWO_DAY">2 day study leave</SelectItem>
                                            <SelectItem value="CUSTOM">Custom gap</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {aiConfig.gapStrategy === "CUSTOM" && (
                                    <div className="space-y-2"><Label>Custom Gap (days)</Label><Input type="number" min={0} max={7} value={aiConfig.customGapDays} onChange={e => setAiConfig({ ...aiConfig, customGapDays: +e.target.value })} /></div>
                                )}
                                <div className="space-y-2">
                                    <Label>Subject Ordering</Label>
                                    <Select value={aiConfig.ordering} onValueChange={(v: any) => setAiConfig({ ...aiConfig, ordering: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AS_PROVIDED">As selected below</SelectItem>
                                            <SelectItem value="ALPHABETICAL">Alphabetical</SelectItem>
                                            <SelectItem value="HARDEST_FIRST">Hardest first (drag to reorder)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Checkbox checked={aiConfig.excludeWeekends} onCheckedChange={(v: boolean | "indeterminate") => setAiConfig({ ...aiConfig, excludeWeekends: !!v })} />
                                    <span className="font-medium">Skip Weekends</span>
                                </label>
                            </div>

                            {/* Subject selection with per-subject marks */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-bold"><BookOpen className="h-4 w-4" /> Subjects & Max Marks</Label>
                                <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                    {masterSubjects.map(s => {
                                        const isSelected = aiConfig.subjects.includes(s.name);
                                        return (
                                            <div key={s.id} className={`flex items-center gap-3 p-3 transition-colors ${isSelected ? "bg-blue-50/50" : "opacity-60"}`}>
                                                <Checkbox checked={isSelected} onCheckedChange={() => toggleAiSubject(s.name)} />
                                                <span className="text-sm">{SUBJECT_ICONS[s.name] || "📝"}</span>
                                                <span className={`flex-1 text-sm font-medium ${isSelected ? "text-slate-900" : "text-slate-400"}`}>{s.name}</span>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs text-muted-foreground">Max:</span>
                                                        <Input type="number" className="w-20 h-7 text-xs text-center" value={aiConfig.subjectMaxMarks[s.name] || 100}
                                                            onChange={e => setAiConfig(p => ({ ...p, subjectMaxMarks: { ...p.subjectMaxMarks, [s.name]: +e.target.value } }))} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">{aiConfig.subjects.length} subjects selected</p>
                            </div>

                            {/* Generate button */}
                            <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white h-12 text-base">
                                {generating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                {generating ? "Generating optimal schedule..." : "✨ Generate Exam Timetable"}
                            </Button>

                            {/* Preview */}
                            {previewEntries && (
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-base flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</h3>
                                        {previewStats && (
                                            <div className="flex gap-3 text-xs">
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold">{previewStats.examDays} exam days</span>
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold">{previewStats.gapDays} study leaves</span>
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">{previewStats.totalDays} total days</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 max-h-80 overflow-y-auto">
                                        {previewEntries.map((e, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${e.isGapDay ? "bg-amber-50/60 border-amber-100" : "bg-white border-slate-100"}`}>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</div>
                                                <div className="w-20 text-xs">
                                                    <div className="font-bold">{fmtDate(e.date)}</div>
                                                    <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
                                                </div>
                                                {e.isGapDay ? (
                                                    <div className="flex items-center gap-2 text-amber-600"><Coffee className="h-4 w-4" /><span className="text-sm font-medium">{e.gapLabel}</span></div>
                                                ) : (
                                                    <>
                                                        <span>{SUBJECT_ICONS[e.subject] || "📝"}</span>
                                                        <Badge className={`${SUBJECT_COLORS[e.subject] || DEFAULT_COLOR} font-bold`}>{e.subject}</Badge>
                                                        <span className="text-xs text-muted-foreground">{e.startTime} – {e.endTime}</span>
                                                        <span className="text-xs font-medium ml-auto">Max: {e.maxMarks}</span>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-2xl">
                            <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
                            {previewEntries && (
                                <Button onClick={handleSaveRoster} disabled={savingRoster} className="bg-brand hover:brightness-110">
                                    {savingRoster ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save & Notify Parents
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ──
function ExamListCard({ exam, slug, classrooms, daysUntil, fmtDate, onEdit, onDelete, isDeleting, onBuild, isUpcoming }: any) {
    const hasSchedule = !!exam.startDate;
    const typeColors: Record<string, string> = {
        TERM: "bg-blue-50 text-blue-700", TEST: "bg-purple-50 text-purple-700", UNIT_TEST: "bg-teal-50 text-teal-700",
    };
    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isUpcoming ? "border-l-4 border-l-brand" : "opacity-75"}`}>
            <CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{exam.title}</h3>
                        <Badge variant="outline" className={typeColors[exam.type] || ""}>{exam.type}</Badge>
                        {hasSchedule && <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">📅 Timetable set</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span><Calendar className="inline h-3 w-3 mr-1" />{fmtDate(exam.date)}</span>
                        <span className={`font-bold ${isUpcoming ? "text-brand" : ""}`}>{daysUntil}</span>
                        <span><Users className="inline h-3 w-3 mr-1" />
                            {(() => { try { return JSON.parse(exam.classrooms || "[]").map((id: string) => classrooms.find((c: any) => c.id === id)?.name || "?").join(", "); } catch { return "-"; } })()}
                        </span>
                        <span>Max: {exam.maxMarks}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={onBuild} title="Build Timetable" className="h-8 w-8 text-purple-600 hover:bg-purple-50">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Link href={`/s/${slug}/students/reports/${exam.id}`}>
                        <Button variant="ghost" size="icon" title="Enter Marks" className="h-8 w-8"><FileSpreadsheet className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={onEdit} title="Edit" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} disabled={isDeleting} title="Delete" className="h-8 w-8 text-red-500 hover:bg-red-50">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ScheduleEntryCard({ entry, idx, onUpdate, onSwap, onDelete }: {
    entry: ScheduleEntry; idx: number;
    onUpdate?: (entryId: string, data: Record<string, any>) => void;
    onSwap?: (fromId: string, toId: string) => void;
    onDelete?: (entryId: string) => void;
}) {
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [dragOver, setDragOver] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        if (!entry.id) return;
        e.dataTransfer.setData("entryId", entry.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const fromId = e.dataTransfer.getData("entryId");
        if (fromId && entry.id && fromId !== entry.id && onSwap) {
            onSwap(fromId, entry.id);
        }
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const startEdit = (field: string, currentVal: string) => {
        setEditing(field);
        setEditValue(currentVal || "");
    };

    const saveEdit = (field: string) => {
        setEditing(null);
        if (!entry.id || !onUpdate) return;
        const data: Record<string, any> = {};
        if (field === "maxMarks") data[field] = Number(editValue) || 100;
        else data[field] = editValue;
        onUpdate(entry.id, data);
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
        if (e.key === "Enter") saveEdit(field);
        if (e.key === "Escape") setEditing(null);
    };

    const EditableField = ({ field, label, value, icon, placeholder, className: cn }: { field: string; label: string; value: string; icon: string; placeholder: string; className?: string }) => {
        if (editing === field) {
            return (
                <input
                    autoFocus
                    className={`text-xs border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-brand/30 bg-white ${cn || "w-full max-w-[200px]"}`}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(field)}
                    onKeyDown={e => handleKeyDown(e, field)}
                    placeholder={placeholder}
                    type={field === "maxMarks" ? "number" : field === "startTime" || field === "endTime" ? "time" : "text"}
                />
            );
        }
        return (
            <button
                onClick={() => startEdit(field, value)}
                className="group flex items-center gap-1 text-xs hover:bg-slate-100 rounded-md px-1.5 py-0.5 transition-colors text-left"
                title={`Click to edit ${label}`}
            >
                <span>{icon}</span>
                <span className={value ? "text-slate-700" : "text-slate-400 italic"}>{value || placeholder}</span>
                <Pencil className="h-2.5 w-2.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        );
    };

    if (entry.isGapDay) {
        return (
            <div
                draggable={!!entry.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex items-center gap-3 p-3 rounded-xl border border-dashed transition-all cursor-grab active:cursor-grabbing ${
                    dragOver ? "border-green-400 bg-green-50 ring-2 ring-green-200" : "border-amber-200 bg-amber-50/50"
                }`}
            >
                <GripVertical className="h-4 w-4 text-amber-300 flex-shrink-0" />
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Coffee className="h-5 w-5 text-amber-600" /></div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-amber-700">{entry.gapLabel || "Study Leave"}</p>
                    <p className="text-xs text-amber-600">{new Date(entry.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
                {onDelete && entry.id && (
                    <button onClick={() => onDelete(entry.id!)} className="p-1.5 rounded-lg hover:bg-red-100 text-amber-400 hover:text-red-500 transition-colors" title="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        );
    }

    const color = SUBJECT_COLORS[entry.subject] || DEFAULT_COLOR;
    return (
        <div
            draggable={!!entry.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`transition-all ${dragOver ? "ring-2 ring-green-300 rounded-xl" : ""}`}
        >
            <Card className={`overflow-hidden hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${dragOver ? "border-green-400 bg-green-50/30" : ""}`}>
                <CardContent className="p-0 flex items-stretch">
                    <div className={`w-1.5 ${color.split(" ")[0]}`} />
                    <div className="flex-1 p-4">
                        <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                            <div className="text-center min-w-[50px]">
                                <div className="text-xs font-medium text-muted-foreground">{new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short" })}</div>
                                <div className="text-lg font-black">{new Date(entry.date).getDate()}</div>
                                <div className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString("en-IN", { month: "short" })}</div>
                            </div>
                            <div className="h-12 w-px bg-slate-200" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{SUBJECT_ICONS[entry.subject] || "📝"}</span>
                                    {onUpdate ? (
                                        <EditableField field="subject" label="Subject" value={entry.subject} icon="" placeholder="Subject name" className="w-[160px]" />
                                    ) : (
                                        <h4 className="font-bold">{entry.subject}</h4>
                                    )}
                                    <Badge variant="outline" className={`${color} text-[10px]`}>Max: {entry.maxMarks}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span><Clock className="inline h-3 w-3 mr-1" />{entry.startTime} – {entry.endTime}</span>
                                </div>
                            </div>
                            {onDelete && entry.id && (
                                <button onClick={() => onDelete(entry.id!)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-300 hover:text-red-500 transition-colors flex-shrink-0" title="Remove entry">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {/* Editable fields row */}
                        {onUpdate && (
                            <div className="mt-3 pt-3 border-t border-dashed flex flex-wrap items-center gap-x-4 gap-y-2">
                                <EditableField field="syllabus" label="Syllabus" value={entry.syllabus || ""} icon="📚" placeholder="Add syllabus / topics..." />
                                <EditableField field="room" label="Room" value={entry.room || ""} icon="🏫" placeholder="Room" />
                                <EditableField field="invigilator" label="Invigilator" value={entry.invigilator || ""} icon="👨‍🏫" placeholder="Invigilator" />
                                <EditableField field="startTime" label="Start Time" value={entry.startTime || ""} icon="⏰" placeholder="09:00" className="w-[100px]" />
                                <EditableField field="endTime" label="End Time" value={entry.endTime || ""} icon="⏱️" placeholder="12:00" className="w-[100px]" />
                                <EditableField field="maxMarks" label="Max Marks" value={String(entry.maxMarks || 100)} icon="💯" placeholder="100" className="w-[80px]" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyState({ onClick }: { onClick: () => void }) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium text-muted-foreground">No exams found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first exam to get started</p>
            <Button onClick={onClick} className="bg-brand hover:brightness-110"><Plus className="mr-2 h-4 w-4" /> Schedule Exam</Button>
        </div>
    );
}
