"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExamByIdAction, updateExamAction } from "@/app/actions/exam-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, X, FileText } from "lucide-react";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import Link from "next/link";

export default function EditExamPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const examId = params.examId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        type: "TERM",
        category: "ACADEMIC",
        classroomIds: [] as string[],
        subjectNames: [] as string[],
        maxMarks: 100,
        minMarks: 0,
        description: "",
        questionPaperUrl: ""
    });

    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [originalQuestionPaperUrl, setOriginalQuestionPaperUrl] = useState<string>(""); // Track original for deletion on save

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [examRes, classesRes, subjectsRes] = await Promise.all([
            getExamByIdAction(examId),
            getClassroomsAction(slug),
            getMasterDataAction("SUBJECT")
        ]);

        if (classesRes.success) setClassrooms(classesRes.data || []);
        if (subjectsRes.success) setSubjects(subjectsRes.data || []);

        if (examRes.success && examRes.data) {
            const exam = examRes.data;
            let clsIds: string[] = [];
            let subNames: string[] = [];

            try {
                clsIds = JSON.parse(exam.classrooms);
            } catch { }
            try {
                subNames = JSON.parse(exam.subjects);
            } catch { }

            setFormData({
                title: exam.title,
                date: new Date(exam.date).toISOString().split('T')[0],
                type: exam.type,
                category: exam.category,
                classroomIds: clsIds,
                subjectNames: subNames,
                maxMarks: exam.maxMarks,
                minMarks: exam.minMarks || 0,
                description: exam.description || "",
                questionPaperUrl: (exam as any).questionPaperUrl || ""
            });
            // Store original URL to track if file was removed
            setOriginalQuestionPaperUrl((exam as any).questionPaperUrl || "");
        } else {
            toast.error("Failed to load exam details");
            router.push(`/s/${slug}/students/reports`);
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.error("Please upload a PDF file");
            e.target.value = '';
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`File size exceeds 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            e.target.value = '';
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("folder", "worksheets");
        data.append("schoolSlug", slug);

        try {
            // Dynamically import to avoid server-side issues
            const { uploadFileAction } = await import("@/app/actions/upload-actions");
            const res = await uploadFileAction(data) as any;

            if (res.success && res.url) {
                setFormData(prev => ({ ...prev, questionPaperUrl: res.url! }));
                setUploadedFileName(file.name);
                toast.success(`File "${file.name}" uploaded successfully`);
            } else {
                toast.error(res.error || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    // Handle file removal - just clears from form, actual deletion happens on save
    const handleRemoveFile = () => {
        setFormData(prev => ({ ...prev, questionPaperUrl: "" }));
        setUploadedFileName("");
        toast.info("File will be removed when you save the exam");
    };




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            console.log("📝 Save initiated:");
            console.log("   Original URL:", originalQuestionPaperUrl || "(none)");
            console.log("   Current URL:", formData.questionPaperUrl || "(none)");

            // Check if file was removed or replaced - delete old file from Drive
            if (originalQuestionPaperUrl && originalQuestionPaperUrl !== formData.questionPaperUrl) {
                console.log("🗑️ Deleting old file from storage:", originalQuestionPaperUrl);
                try {
                    const { deleteFileAction } = await import("@/app/actions/upload-actions");
                    const deleteResult = await deleteFileAction(originalQuestionPaperUrl, slug);
                    console.log("   Delete result:", deleteResult);
                } catch (deleteError) {
                    console.error("Failed to delete old file:", deleteError);
                    // Continue with save even if delete fails
                }
            } else {
                console.log("   No file deletion needed");
            }

            const res = await updateExamAction(slug, examId, {
                ...formData,
                date: new Date(formData.date),
                classrooms: formData.classroomIds,
                subjects: formData.subjectNames,
                gradingSystem: "MARKS",
                questionPaperUrl: formData.questionPaperUrl
            });

            if (res.success) {
                toast.success("Exam updated successfully");
                router.push(`/s/${slug}/students/reports`);
            } else {
                toast.error(res.error || "Failed to update exam");
            }
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error?.message || "Save failed. Please check your internet connection.");
        } finally {
            setSaving(false);
        }
    };

    const toggleClassroom = (id: string) => {
        setFormData(prev => ({
            ...prev,
            classroomIds: prev.classroomIds.includes(id)
                ? prev.classroomIds.filter(c => c !== id)
                : [...prev.classroomIds, id]
        }));
    };

    const toggleSubject = (name: string) => {
        setFormData(prev => ({
            ...prev,
            subjectNames: prev.subjectNames.includes(name)
                ? prev.subjectNames.filter(s => s !== name)
                : [...prev.subjectNames, name]
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <StandardActionButton
                    asChild
                    variant="ghost"
                    icon={ArrowLeft}
                    iconOnly
                    tooltip="Back to Reports"
                >
                    <Link href={`/s/${slug}/students/reports`} />
                </StandardActionButton>
                <h1 className="text-2xl font-bold tracking-tight">Edit Exam</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Exam Details</CardTitle>
                    <CardDescription>Update the details for this examination.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Exam Title</Label>
                                <Input
                                    placeholder="e.g. Mid Term Assessment"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={formData.type} onValueChange={(v: string) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue>
                                            {formData.type === "TERM" ? "Term Exam" :
                                                formData.type === "TEST" ? "Unit Test" : "Assessment"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TERM">Term Exam</SelectItem>
                                        <SelectItem value="TEST">Unit Test</SelectItem>
                                        <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(v: string) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger>
                                        <SelectValue>
                                            {formData.category === "ACADEMIC" ? "Academic" :
                                                formData.category === "SPORTS" ? "Sports" :
                                                    formData.category === "ARTS" ? "Arts" : "Co-Scholastic"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                        <SelectItem value="SPORTS">Sports</SelectItem>
                                        <SelectItem value="ARTS">Arts</SelectItem>
                                        <SelectItem value="CO_SCHOLASTIC">Co-Scholastic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Applicable Classrooms</Label>
                            <div className="border rounded-md p-4 max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
                                {classrooms.map(cls => (
                                    <div key={cls.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`cls-${cls.id}`}
                                            checked={formData.classroomIds.includes(cls.id)}
                                            onChange={() => toggleClassroom(cls.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor={`cls-${cls.id}`} className="text-sm cursor-pointer">{cls.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.category === 'ACADEMIC' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Applicable Subjects</Label>
                                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto grid grid-cols-2 gap-2">
                                        {subjects.map(sub => (
                                            <div key={sub.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`sub-${sub.id}`}
                                                    checked={formData.subjectNames.includes(sub.name)}
                                                    onChange={() => toggleSubject(sub.name)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={`sub-${sub.id}`} className="text-sm cursor-pointer">{sub.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Marks</Label>
                                        <Input
                                            type="number"
                                            value={formData.maxMarks}
                                            onChange={e => setFormData({ ...formData, maxMarks: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Min Pass Marks</Label>
                                        <Input
                                            type="number"
                                            value={formData.minMarks}
                                            onChange={e => setFormData({ ...formData, minMarks: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Question Paper Upload */}
                        <div className="space-y-2">
                            <Label>Question Paper (PDF)</Label>
                            {!formData.questionPaperUrl ? (
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                                            {uploadedFileName || "Question Paper"}
                                        </p>
                                        <a
                                            href={formData.questionPaperUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-600 hover:text-green-700 underline"
                                        >
                                            View / Download
                                        </a>
                                    </div>
                                    <StandardActionButton
                                        type="button"
                                        variant="ghost"
                                        icon={X}
                                        iconOnly
                                        onClick={handleRemoveFile}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        tooltip="Remove file"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <StandardActionButton
                                asChild
                                variant="ghost"
                                label="Cancel"
                            >
                                <Link href={`/s/${slug}/students/reports`} />
                            </StandardActionButton>
                            <StandardActionButton
                                type="submit"
                                variant="primary"
                                icon={Save}
                                label="Update Exam"
                                loading={saving}
                                loadingLabel="Updating..."
                                disabled={uploading}
                                permission={{ module: 'exams', action: 'edit' }}
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
