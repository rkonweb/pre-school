"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Save,
    Printer,
    CheckCircle2,
    BookOpen,
    GraduationCap,
    Users,
    Search,
    ChevronDown,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

// Actions
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { safeSaveReportCardAction, getReportCardsForClassAction } from "@/app/actions/academics-actions";
import { getSchoolDetailsAction } from "@/app/actions/payroll-actions"; // Reuse for logo/details

interface SubjectMark {
    subject: string;
    marksObtained: string;
    maxMarks: string;
    grade: string;
}

export default function ReportCardsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("Term 1");
    const [students, setStudents] = useState<any[]>([]);
    const [reportCards, setReportCards] = useState<any[]>([]);
    const [school, setSchool] = useState<any>(null);

    // Form State: studentId -> { marks: SubjectMark[], comments: string }
    const [formData, setFormData] = useState<Record<string, { marks: SubjectMark[], comments: string }>>({});

    const terms = ["Term 1", "Term 2", "Final"];
    const defaultSubjects = ["English", "Mathematics", "Science", "Social Studies", "Second Language"];

    useEffect(() => {
        loadInitialData();
    }, [slug]);

    useEffect(() => {
        if (selectedClassId) {
            loadClassData();
        } else {
            setStudents([]);
            setReportCards([]);
            setFormData({});
        }
    }, [selectedClassId, selectedTerm]);

    async function loadInitialData() {
        setIsLoading(true);
        const [classesRes, schoolRes] = await Promise.all([
            getClassroomsAction(slug),
            getSchoolDetailsAction(slug)
        ]);
        if (classesRes.success) setClasses(classesRes.data);
        if (schoolRes.success) setSchool(schoolRes.data);
        setIsLoading(false);
    }

    async function loadClassData() {
        setIsLoading(true);
        try {
            const [studentsRes, rcRes] = await Promise.all([
                getStudentsAction(slug, selectedClassId),
                getReportCardsForClassAction(slug, selectedClassId, selectedTerm)
            ]);

            if (studentsRes.success) {
                setStudents(studentsRes.data);

                // Initialize form data
                const initialForm: Record<string, { marks: SubjectMark[], comments: string }> = {};
                const rcs = rcRes.success ? rcRes.data : [];
                setReportCards(rcs);

                studentsRes.data.forEach((student: any) => {
                    const existingRc = rcs.find((rc: any) => rc.studentId === student.id);
                    if (existingRc && existingRc.marks) {
                        try {
                            const parsedMarks = JSON.parse(existingRc.marks);
                            initialForm[student.id] = {
                                marks: parsedMarks,
                                comments: existingRc.comments || ""
                            };
                        } catch (e) {
                            initialForm[student.id] = buildDefaultForm();
                        }
                    } else {
                        initialForm[student.id] = buildDefaultForm();
                    }
                });

                setFormData(initialForm);
            }
        } catch (error) {
            console.error("Load Class Data Error:", error);
            toast.error("Failed to load class data");
        } finally {
            setIsLoading(false);
        }
    }

    function buildDefaultForm() {
        return {
            marks: defaultSubjects.map(sub => ({
                subject: sub,
                marksObtained: "",
                maxMarks: "100",
                grade: ""
            })),
            comments: ""
        };
    }

    const calculateGrade = (obtained: string, max: string) => {
        const o = parseFloat(obtained);
        const m = parseFloat(max);
        if (isNaN(o) || isNaN(m) || m === 0) return "";
        const percentage = (o / m) * 100;
        if (percentage >= 90) return "A1";
        if (percentage >= 80) return "A2";
        if (percentage >= 70) return "B1";
        if (percentage >= 60) return "B2";
        if (percentage >= 50) return "C1";
        if (percentage >= 40) return "C2";
        if (percentage >= 33) return "D";
        return "E (Needs Improvement)";
    };

    const handleMarkChange = (studentId: string, subjectIndex: number, field: keyof SubjectMark, value: string) => {
        setFormData(prev => {
            const studentData = prev[studentId];
            const updatedMarks = [...studentData.marks];
            updatedMarks[subjectIndex] = { ...updatedMarks[subjectIndex], [field]: value };

            // Auto-calculate grade if obtained/max changes
            if (field === "marksObtained" || field === "maxMarks") {
                updatedMarks[subjectIndex].grade = calculateGrade(
                    updatedMarks[subjectIndex].marksObtained,
                    updatedMarks[subjectIndex].maxMarks
                );
            }

            return {
                ...prev,
                [studentId]: {
                    ...studentData,
                    marks: updatedMarks
                }
            };
        });
    };

    const handleCommentChange = (studentId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                comments: value
            }
        }));
    };

    const handleSaveStudent = async (studentId: string) => {
        const data = formData[studentId];
        if (!data) return;

        setIsSaving(true);
        const marksString = JSON.stringify(data.marks);
        const res = await safeSaveReportCardAction(slug, studentId, "", selectedTerm, marksString, data.comments);
        if (res.success) {
            toast.success("Saved successfully");
            // Reload silently to fetch fresh RC ID if needed for printing
            const rcRes = await getReportCardsForClassAction(slug, selectedClassId, selectedTerm);
            if (rcRes.success) setReportCards(rcRes.data);
        } else {
            toast.error(res.error || "Failed to save");
        }
        setIsSaving(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        let successCount = 0;
        let failCount = 0;

        for (const student of students) {
            const data = formData[student.id];
            if (data) {
                const marksString = JSON.stringify(data.marks);
                const res = await safeSaveReportCardAction(slug, student.id, "", selectedTerm, marksString, data.comments);
                if (res.success) successCount++;
                else failCount++;
            }
        }

        if (failCount === 0) {
            toast.success(`Successfully saved all ${successCount} report cards`);
        } else {
            toast.warning(`Saved ${successCount}, Failed ${failCount}`);
        }

        // Reload to get fresh IDs
        const rcRes = await getReportCardsForClassAction(slug, selectedClassId, selectedTerm);
        if (rcRes.success) setReportCards(rcRes.data);

        setIsSaving(false);
    };

    // Printing Logic (Single Student)
    const [printingStudentId, setPrintingStudentId] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrintStart = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ReportCard_${selectedTerm}`,
        onAfterPrint: () => setPrintingStudentId(null),
    });

    const triggerPrint = (studentId: string) => {
        setPrintingStudentId(studentId);
        // We use setTimeout to ensure React has flushed the DOM with the correct student ID in the hidden absolute div
        setTimeout(() => {
            handlePrintStart();
        }, 100);
    };


    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        Report <span className="text-indigo-600">Cards</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Generate dynamic academic transcripts and continuous evaluation records.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-[1.5rem] shadow-sm ring-4 ring-zinc-500/5">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-transparent text-xs font-black px-4 py-2 focus:outline-none appearance-none cursor-pointer uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800" />
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="bg-transparent text-xs font-black px-4 py-2 focus:outline-none appearance-none cursor-pointer uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
                        >
                            {terms.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving || !selectedClassId || students.length === 0}
                        className="bg-indigo-600 text-white hover:bg-indigo-500 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Syncing Grid..." : "Cloud Save Grid"}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {!selectedClassId ? (
                <div className="py-32 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                    <div className="p-8 bg-white dark:bg-zinc-900 rounded-full shadow-2xl mb-6">
                        <BookOpen className="h-16 w-16 text-indigo-200" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight italic uppercase">Select a Class Configuration</h3>
                    <p className="text-sm text-zinc-500 mt-2 max-w-md">Initialize the data grid by selecting a target classroom and academic term mapping from the control bar above.</p>
                </div>
            ) : isLoading ? (
                <div className="py-20 flex justify-center items-center">
                    <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : students.length === 0 ? (
                <div className="py-20 text-center text-zinc-500">No students enrolled in this class.</div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 sticky left-0 bg-zinc-50 dark:bg-zinc-950/90 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        Scholar ID
                                    </th>
                                    {/* Generate column headers for each subject up to the max subjects in the class. For simplicity, assuming exactly 5 subjects per student based on defaultForm. */}
                                    <th colSpan={defaultSubjects.length} className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-center border-l dark:border-zinc-800">
                                        Academic Assessments ({selectedTerm})
                                    </th>
                                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 border-l dark:border-zinc-800">
                                        Principal's Remarks
                                    </th>
                                    <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {students.map((student) => {
                                    const studentForm = formData[student.id];
                                    if (!studentForm) return null;

                                    return (
                                        <tr key={student.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                                            {/* Student Card */}
                                            <td className="px-8 py-6 bg-white dark:bg-zinc-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-indigo-50/50 dark:group-hover:bg-zinc-800/80 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-[1rem] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 outline outline-2 outline-indigo-200 dark:outline-indigo-500/30 flex items-center justify-center font-black italic shadow-inner">
                                                        {student.firstName[0]}{student.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">{student.firstName} {student.lastName}</div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-1 flex items-center gap-1">
                                                            <Award className="h-3 w-3 text-indigo-400" />
                                                            Roll: {student.rollNo || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Subjects Entry */}
                                            <td colSpan={defaultSubjects.length} className="px-4 py-4 border-l dark:border-zinc-800 relative z-0">
                                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                    {studentForm.marks.map((sub, idx) => (
                                                        <div key={idx} className="flex-none w-36 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-[1rem] border border-zinc-200 dark:border-zinc-800 space-y-2 group-hover:border-indigo-200 transition-colors">
                                                            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center truncate">{sub.subject}</div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={sub.marksObtained}
                                                                    onChange={(e) => handleMarkChange(student.id, idx, "marksObtained", e.target.value)}
                                                                    placeholder="0"
                                                                    className="w-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-2 text-center font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                                />
                                                                <span className="text-zinc-300 font-bold">/</span>
                                                                <input
                                                                    type="text"
                                                                    value={sub.maxMarks}
                                                                    onChange={(e) => handleMarkChange(student.id, idx, "maxMarks", e.target.value)}
                                                                    placeholder="100"
                                                                    className="w-12 bg-transparent text-center font-mono text-xs text-zinc-400 outline-none hover:bg-zinc-100 rounded"
                                                                />
                                                            </div>
                                                            {sub.grade && (
                                                                <div className="text-center text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 w-fit mx-auto px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                                                                    Grade: {sub.grade}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Comments */}
                                            <td className="px-6 py-6 border-l dark:border-zinc-800 align-top">
                                                <textarea
                                                    value={studentForm.comments}
                                                    onChange={(e) => handleCommentChange(student.id, e.target.value)}
                                                    placeholder="Add pedagogical remarks..."
                                                    className="w-48 h-20 resize-none bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1rem] p-3 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveStudent(student.id)}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-indigo-100 text-zinc-500 hover:text-indigo-600 transition-colors"
                                                        title="Save this record"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerPrint(student.id)}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-500 hover:text-emerald-600 transition-colors"
                                                        title="Print PDF Report Card"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Hidden Print Wrapper */}
            <div className="hidden">
                <div ref={printRef}>
                    {printingStudentId && (
                        <PrintableReportCard
                            student={students.find(s => s.id === printingStudentId)}
                            formData={formData[printingStudentId]}
                            school={school}
                            term={selectedTerm}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}


function PrintableReportCard({ student, formData, school, term }: { student: any, formData: any, school: any, term: string }) {
    if (!student || !formData) return null;

    const totalObtained = formData.marks.reduce((acc: number, curr: SubjectMark) => acc + (parseFloat(curr.marksObtained) || 0), 0);
    const totalMax = formData.marks.reduce((acc: number, curr: SubjectMark) => acc + (parseFloat(curr.maxMarks) || 0), 0);
    const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

    return (
        <div className="max-w-[800px] mx-auto p-12 bg-white text-zinc-900 font-sans border-8 border-indigo-900 relative">
            {/* Aesthetic Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-[100%] z-0" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-tr-[100%] z-0" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between border-b-4 border-indigo-900 pb-8 mb-8">
                    <div className="flex items-center gap-6">
                        {school?.logo ? (
                            <img src={school.logo} alt="School Logo" className="h-24 w-auto object-contain" />
                        ) : (
                            <div className="h-20 w-20 bg-indigo-900 flex items-center justify-center text-white text-4xl font-black italic rounded-xl">{school?.name?.[0]}</div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black text-indigo-900 uppercase tracking-tighter italic">{school?.name}</h1>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Official Academic Transcript</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-indigo-900 text-white px-6 py-2 rounded-lg font-black uppercase tracking-[0.2em] text-[10px] inline-block mb-2">
                            {term} Evaluation
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Academic Year 2025-26</p>
                    </div>
                </div>

                {/* Profile Banner */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-center gap-8 shadow-sm">
                    <div className="h-24 w-24 rounded-2xl bg-white border-4 border-indigo-200 overflow-hidden shadow-sm flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${student.avatar})` }}>
                        {!student.avatar && <Users className="h-10 w-10 text-indigo-200" />}
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 flex-1">
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Scholar Name</p>
                            <p className="text-xl font-black italic text-indigo-950 tracking-tight">{student.firstName} {student.lastName}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Scholar ID</p>
                            <p className="font-mono font-black text-zinc-700">{student.id.split('_').pop()?.toUpperCase() || 'STU-1029'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Class Code</p>
                            <p className="font-bold text-zinc-800 uppercase">Primary / Unit A</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Roll Number</p>
                            <p className="font-bold text-zinc-800">{student.rollNo || "24"}</p>
                        </div>
                    </div>
                </div>

                {/* Subjects Grid */}
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900 mb-4 border-l-4 border-indigo-500 pl-3">Scholastic Performance</h3>
                <div className="mb-8 overflow-hidden rounded-2xl border-2 border-zinc-200">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <th className="py-4 px-6 border-b border-zinc-200">Subject Area</th>
                                <th className="py-4 px-6 border-b border-zinc-200 text-center">Max Marks</th>
                                <th className="py-4 px-6 border-b border-zinc-200 text-center">Obtained</th>
                                <th className="py-4 px-6 border-b border-zinc-200 text-center bg-indigo-50 text-indigo-600">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-sm">
                            {formData.marks.map((sub: SubjectMark, i: number) => (
                                <tr key={i} className="font-medium">
                                    <td className="py-4 px-6 italic font-bold text-zinc-800">{sub.subject}</td>
                                    <td className="py-4 px-6 text-center text-zinc-500 font-mono">{sub.maxMarks}</td>
                                    <td className="py-4 px-6 text-center font-black font-mono text-indigo-900">{sub.marksObtained || '-'}</td>
                                    <td className="py-4 px-6 text-center bg-indigo-50/50">
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black text-xs">
                                            {sub.grade || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-indigo-900 text-white font-black">
                            <tr>
                                <td className="py-4 px-6 uppercase tracking-widest text-xs">Total Scope</td>
                                <td className="py-4 px-6 text-center font-mono">{totalMax}</td>
                                <td className="py-4 px-6 text-center font-mono">{totalObtained}</td>
                                <td className="py-4 px-6 text-center bg-indigo-950 text-indigo-200">{overallPercentage}%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Co-Scholastic & Comments */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900 mb-3 border-l-4 border-indigo-500 pl-3">Grading Key</h3>
                        <div className="bg-zinc-50 p-4 rounded-xl text-[9px] font-bold uppercase tracking-widest text-zinc-500 space-y-2 border border-zinc-100">
                            <div className="flex justify-between"><span className="text-emerald-600">A1: 91 - 100%</span> <span>Outstanding</span></div>
                            <div className="flex justify-between"><span className="text-emerald-500">A2: 81 - 90%</span> <span>Excellent</span></div>
                            <div className="flex justify-between"><span className="text-indigo-500">B1: 71 - 80%</span> <span>Very Good</span></div>
                            <div className="flex justify-between"><span className="text-indigo-400">B2: 61 - 70%</span> <span>Good</span></div>
                            <div className="flex justify-between"><span className="text-amber-500">C1: 51 - 60%</span> <span>Satisfactory</span></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-900 mb-3 border-l-4 border-indigo-500 pl-3">Principal's Remarks</h3>
                        <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 min-h-[140px] italic text-indigo-900 font-medium leading-relaxed">
                            "{formData.comments || "Demonstrates consistent academic effort and participates well in curricular activities."}"
                        </div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="pt-12 mt-12 border-t-2 border-dashed border-zinc-200 flex justify-between px-10">
                    <div className="text-center">
                        <div className="h-16 w-32 border-b-2 border-zinc-300 mx-auto mb-2 relative">
                            {/* Dummy Signature Curve */}
                            <svg className="absolute bottom-1 w-full h-8 opacity-40 text-zinc-800" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path d="M0 10 Q 20 20 40 10 T 80 5 T 100 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Class Instructor</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 border-b-2 border-zinc-300 mx-auto mb-2 flex items-center justify-center">
                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-rose-300 text-[8px] font-black text-rose-300 uppercase tracking-widest flex items-center justify-center transform -rotate-12 opacity-60">School<br />Seal</div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Institution Head</p>
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 border-b-2 border-zinc-300 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Parent / Guardian</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center bg-indigo-900 text-indigo-200 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.3em]">
                    System Generated Cryptographic Artifact • {new Date().toISOString().split('T')[0]}
                </div>
            </div>
        </div>
    );
}
