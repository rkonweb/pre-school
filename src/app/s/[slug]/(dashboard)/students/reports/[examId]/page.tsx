"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExamByIdAction } from "@/app/actions/exam-actions";
import { getExamResultsAction, recordMarksAction } from "@/app/actions/result-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";

import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MarksEntryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const examId = params.examId as string;

    const [exam, setExam] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);

    // Selection State
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");

    // Data State
    const [students, setStudents] = useState<any[]>([]);
    // Structure: { studentId: { subjectName: { marks, grade, status, remarks } } }
    const [marksData, setMarksData] = useState<Record<string, Record<string, { marks: string, grade: string, status: string, remarks: string }>>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            loadStudentMarks();
        }
    }, [selectedClassId]);

    const loadInitialData = async () => {
        setLoading(true);
        const [examRes, subjectsRes, classesRes] = await Promise.all([
            getExamByIdAction(examId),
            getMasterDataAction("SUBJECT"),
            getClassroomsAction(slug)
        ]);

        if (examRes.success && examRes.data) {
            setExam(examRes.data);

            // Handle Subjects: Prioritize exam specific subjects
            let availableSubjects: any[] = [];
            try {
                const examSubjects = JSON.parse(examRes.data.subjects || "[]");
                if (Array.isArray(examSubjects) && examSubjects.length > 0) {
                    availableSubjects = examSubjects.map((name: string, i: number) => ({
                        id: `exam-sub-${i}`,
                        name
                    }));
                }
            } catch (e) {
                console.error("Error parsing exam subjects", e);
            }

            // Fallback to master data if no specific subjects defined
            if (availableSubjects.length === 0 && subjectsRes.success) {
                availableSubjects = subjectsRes.data || [];
            }

            setSubjects(availableSubjects);
            if (availableSubjects.length > 0) {
                setSelectedSubject(availableSubjects[0].name);
            }

            // Parse exam.classrooms to filter classesRes
            try {
                const allowedIds = JSON.parse(examRes.data.classrooms || "[]");
                if (classesRes.success && classesRes.data) {
                    const filtered = classesRes.data.filter((c: any) => allowedIds.includes(c.id));
                    setClassrooms(filtered);
                    if (filtered.length > 0) setSelectedClassId(filtered[0].id);
                }
            } catch (e) {
                console.error("Error parsing classrooms", e);
            }
        }

        setLoading(false);
    };

    const loadStudentMarks = async () => {
        setLoading(true);
        // Fetch Results for ALL subjects in this class
        const resultsRes = await getExamResultsAction(examId, selectedClassId);

        // Fetch Class Students
        const { getClassroomAction } = await import("@/app/actions/classroom-actions");
        const clsRes = await getClassroomAction(selectedClassId, slug);

        if (clsRes.success && clsRes.classroom) {
            setStudents(clsRes.classroom.students);

            // Map existing results
            const initialMarks: Record<string, Record<string, { marks: string, grade: string, status: string, remarks: string }>> = {};

            // Initialize empty structure for all students
            clsRes.classroom.students.forEach((s: any) => {
                initialMarks[s.id] = {};
            });

            if (resultsRes.success && resultsRes.data) {
                resultsRes.data.forEach((r: any) => {
                    if (!initialMarks[r.studentId]) initialMarks[r.studentId] = {};
                    initialMarks[r.studentId][r.subject] = {
                        marks: r.marks?.toString() || "",
                        grade: r.grade || "",
                        status: r.status || "",
                        remarks: r.remarks || ""
                    };
                });
            }
            setMarksData(initialMarks);
        }
        setLoading(false);
    };

    const calculateGrade = (marks: number, maxMarks: number) => {
        if (!maxMarks || maxMarks === 0) return "";
        const percentage = (marks / maxMarks) * 100;

        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 40) return "D";
        return "E";
    };

    const calculateStatus = (marks: number, minMarks: number) => {
        if (marks >= minMarks) return "PASSED";
        return "FAILED";
    };

    const handleMarkChange = (studentId: string, subject: string, field: 'marks' | 'grade' | 'status' | 'remarks', value: string) => {
        setMarksData((prev) => {
            const currentSub = prev[studentId]?.[subject] || { marks: "", grade: "", status: "", remarks: "" };
            let updated = { ...currentSub, [field]: value };

            if (field === 'marks') {
                const numVal = parseFloat(value);
                if (value !== "" && !isNaN(numVal) && exam?.maxMarks) {
                    updated.grade = calculateGrade(numVal, exam.maxMarks);
                    updated.status = calculateStatus(numVal, exam.minMarks || 0);
                } else {
                    updated.grade = "";
                    updated.status = "";
                }
            }

            return {
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [subject]: updated
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const payload: any[] = [];

        Object.keys(marksData).forEach(studentId => {
            Object.keys(marksData[studentId]).forEach(subject => {
                const data = marksData[studentId][subject];
                if (data.marks !== "" || data.remarks !== "") {
                    payload.push({
                        studentId,
                        subject,
                        marks: data.marks ? parseFloat(data.marks) : null,
                        grade: data.grade || null,
                        status: data.status || null,
                        remarks: data.remarks || null
                    });
                }
            });
        });

        const res = await recordMarksAction(slug, examId, payload);
        if (res.success) {
            toast.success("Marks saved successfully");
        } else {
            toast.error(res.error || "Failed to save marks");
        }
        setSaving(false);
    };

    if (!exam) return <div className="p-8 text-center">Loading Exam Details...</div>;

    const currentSubject = subjects.find(s => s.name === selectedSubject);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/s/${slug}/students/reports`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{exam.type}</Badge>
                            <Badge variant="secondary">{formatDate(exam.date)}</Badge>
                            {exam.category === 'ACADEMIC' && typeof exam.minMarks !== 'undefined' && exam.minMarks > 0 &&
                                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                    Pass Marks: {exam.minMarks}
                                </Badge>
                            }
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving || students.length === 0} className="bg-brand hover:brightness-110">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Marks
                </Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class">
                                        {classrooms.find(c => c.id === selectedClassId)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Subject</Label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject">
                                        {selectedSubject || "Select Subject"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => (
                                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedClassId && selectedSubject ? (
                        loading ? (
                            <div className="text-center py-8">Loading Students...</div>
                        ) : (
                            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                                <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
                                    <div className="font-bold text-slate-900">{selectedSubject}</div>
                                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border">Max: {exam.maxMarks}</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white text-slate-500 font-medium border-b">
                                            <tr>
                                                <th className="p-3 w-64">Student</th>
                                                <th className="p-3 w-32">Marks</th>
                                                <th className="p-3 w-32">Grade</th>
                                                <th className="p-3 w-32">Status</th>
                                                <th className="p-3">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y relative">
                                            {students.map(student => {
                                                const data = marksData[student.id]?.[selectedSubject] || { marks: "", grade: "", status: "", remarks: "" };
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/50">
                                                        <td className="p-3 font-medium text-slate-700">
                                                            {student.firstName} {student.lastName}
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                type="number"
                                                                className="h-8 w-24"
                                                                placeholder="-"
                                                                value={data.marks}
                                                                onChange={(e) => handleMarkChange(student.id, selectedSubject, 'marks', e.target.value)}
                                                                tabIndex={1}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                className="h-8 w-24 bg-slate-50 text-slate-500 font-semibold"
                                                                placeholder="-"
                                                                value={data.grade}
                                                                readOnly
                                                                tabIndex={-1}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className={`flex items-center justify-center h-8 px-3 rounded-md border text-xs font-semibold ${data.status === 'PASSED'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : data.status === 'FAILED'
                                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                                    : 'bg-gray-50 text-gray-400 border-gray-200'
                                                                }`}>
                                                                {data.status || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                className="h-8"
                                                                placeholder="Optional remarks..."
                                                                value={data.remarks}
                                                                onChange={(e) => handleMarkChange(student.id, selectedSubject, 'remarks', e.target.value)}
                                                                tabIndex={3}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {students.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">No students found in this class.</div>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            Please select a Class and Subject to enter marks.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
}
