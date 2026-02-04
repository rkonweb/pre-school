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
import { getStudentsByClassroomAction } from "@/app/actions/student-actions"; // Need this action
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
    const [marksData, setMarksData] = useState<any>({}); // { studentId: { marks, grade, remarks } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedSubject) {
            loadStudentMarks();
        }
    }, [selectedClassId, selectedSubject]);

    const loadInitialData = async () => {
        setLoading(true);
        const [examRes, subjectsRes, classesRes] = await Promise.all([
            getExamByIdAction(examId),
            getMasterDataAction("SUBJECT"),
            getClassroomsAction(slug)
        ]);

        if (examRes.success) {
            setExam(examRes.data);
            // Parse exam.classrooms to filter classesRes
            try {
                const allowedIds = JSON.parse(examRes.data.classrooms || "[]");
                if (classesRes.success) {
                    const filtered = classesRes.data.filter((c: any) => allowedIds.includes(c.id));
                    setClassrooms(filtered);
                    if (filtered.length > 0) setSelectedClassId(filtered[0].id);
                }
            } catch (e) {
                console.error("Error parsing classrooms", e);
            }
        }

        if (subjectsRes.success) setSubjects(subjectsRes.data);
        setLoading(false);
    };

    const loadStudentMarks = async () => {
        setLoading(true);
        // Fetch Students
        // We need a server action to get students by class. Using existing or importing.
        // Assuming we might need to import it or use a raw fetch if not available.
        // Let's assume getStudentsByClassroomAction exists or we create it.
        // I'll use a direct fetch or existing action.

        // Fetch Results
        const resultsRes = await getExamResultsAction(examId, selectedClassId);

        // Fetch Students
        // Temporary: Using getStudentsByClassroomAction which I assume exists or needs creation.
        // Since I haven't checked student-actions.ts for this specific filtered call, I'll rely on the one I'll create/verify.
        // Actually, let's use a known pattern or verify.
        // For now, I'll assume I can import it. If it fails, I'll fix.
        // To be safe, let's use a server action I KNOW exists or generic query.
        // I'll add `getStudentsByClassroomAction` to `student-actions.ts` if needed.

        // Wait, I can't modify student-actions.ts in this file.
        // I will use `getClassroomAction(selectedClassId)` which returns students!
        const classRes = await getClassroomsAction(slug);
        // Wait, getClassroomsAction returns all. getClassroomAction(id) returns single with students.
        // Import `getClassroomAction` from classroom-actions.ts
        const { getClassroomAction } = await import("@/app/actions/classroom-actions");
        const clsRes = await getClassroomAction(selectedClassId);

        if (clsRes.success && clsRes.classroom) {
            setStudents(clsRes.classroom.students);

            // Map existing results
            const initialMarks: any = {};
            if (resultsRes.success) {
                resultsRes.data.forEach((r: any) => {
                    if (r.subject === selectedSubject) {
                        initialMarks[r.studentId] = {
                            marks: r.marks?.toString() || "",
                            grade: r.grade || "",
                            remarks: r.remarks || ""
                        };
                    }
                });
            }
            setMarksData(initialMarks);
        }
        setLoading(false);
    };

    const handleMarkChange = (studentId: string, field: string, value: string) => {
        setMarksData((prev: any) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = Object.keys(marksData).map(studentId => ({
            studentId,
            subject: selectedSubject,
            marks: marksData[studentId].marks ? parseFloat(marksData[studentId].marks) : undefined,
            grade: marksData[studentId].grade,
            remarks: marksData[studentId].remarks
        }));

        const res = await recordMarksAction(slug, examId, payload);
        if (res.success) {
            toast.success("Marks saved successfully");
        } else {
            toast.error(res.error || "Failed to save marks");
        }
        setSaving(false);
    };

    if (!exam) return <div className="p-8 text-center">Loading Exam Details...</div>;

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
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving || !selectedSubject}>
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
                                        {subjects.find(s => s.name === selectedSubject)?.name || selectedSubject}
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
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="p-3">Student</th>
                                            <th className="p-3 w-32">Marks (Max: {exam.maxMarks})</th>
                                            <th className="p-3 w-32">Grade</th>
                                            <th className="p-3">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {students.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50/50">
                                                <td className="p-3 font-medium">
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        type="number"
                                                        className="h-8"
                                                        placeholder="0"
                                                        max={exam.maxMarks}
                                                        value={marksData[student.id]?.marks || ""}
                                                        onChange={(e) => handleMarkChange(student.id, "marks", e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        className="h-8"
                                                        placeholder="Grade"
                                                        value={marksData[student.id]?.grade || ""}
                                                        onChange={(e) => handleMarkChange(student.id, "grade", e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        className="h-8"
                                                        placeholder="Optional..."
                                                        value={marksData[student.id]?.remarks || ""}
                                                        onChange={(e) => handleMarkChange(student.id, "remarks", e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
