"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExamAction } from "@/app/actions/exam-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Calendar, BookOpen, Users } from "lucide-react";
import { getCookie } from "@/lib/cookies";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateExamPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(false);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("TERM"); // TERM, TEST
    const [category, setCategory] = useState("ACADEMIC"); // ACADEMIC, SPORTS, ARTS
    const [maxMarks, setMaxMarks] = useState(100);
    const [minMarks, setMinMarks] = useState(35);
    const [description, setDescription] = useState("");

    // Selection State
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Dropdown State
    const [classDropdownOpen, setClassDropdownOpen] = useState(false);
    const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [classesRes, subjectsRes] = await Promise.all([
            getClassroomsAction(slug),
            getMasterDataAction("SUBJECT")
        ]);

        if (classesRes.success) setClassrooms(classesRes.data || []);
        if (subjectsRes.success) setAvailableSubjects(subjectsRes.data || []);
    };

    const handleClassToggle = (id: string) => {
        if (selectedClasses.includes(id)) {
            setSelectedClasses(selectedClasses.filter(c => c !== id));
        } else {
            setSelectedClasses([...selectedClasses, id]);
        }
    };

    const removeClass = (id: string) => {
        setSelectedClasses(selectedClasses.filter(c => c !== id));
    };

    const handleSubjectToggle = (subjectName: string) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(selectedSubjects.filter(s => s !== subjectName));
        } else {
            setSelectedSubjects([...selectedSubjects, subjectName]);
        }
    };

    const removeSubject = (subject: string) => {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClasses.length === 0) {
            toast.error("Please select at least one participating class.");
            return;
        }

        if (category === "ACADEMIC" && selectedSubjects.length === 0) {
            toast.error("Please add at least one subject for an Academic exam.");
            return;
        }

        setLoading(true);
        const academicYearId = getCookie(`academic_year_${slug}`) || undefined;
        const res = await createExamAction(slug, {
            title,
            date: new Date(date),
            type,
            category,
            classrooms: selectedClasses,
            subjects: selectedSubjects,
            maxMarks: category === 'ACADEMIC' ? Number(maxMarks) : 0,
            minMarks: category === 'ACADEMIC' ? Number(minMarks) : 0,
            description,
            academicYearId
        });

        if (res.success) {
            toast.success("Exam created successfully");
            router.push(`/s/${slug}/students/reports`);
        } else {
            toast.error(res.error || "Failed to create exam");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href={`/s/${slug}/students/reports`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create new Assessment</h1>
                    <p className="text-muted-foreground text-sm">Configure exam details, subjects, and participants.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">

                {/* Main Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand" /> Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Exam Title</Label>
                            <Input placeholder="e.g. Mid-Term Examination 2024" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category">
                                            {category === "ACADEMIC" ? "Academic" :
                                                category === "SPORTS" ? "Sports" :
                                                    category === "ARTS" ? "Arts" : "Co-Curricular"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                        <SelectItem value="SPORTS">Sports</SelectItem>
                                        <SelectItem value="ARTS">Arts</SelectItem>
                                        <SelectItem value="CO_CURRICULAR">Co-Curricular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Exam Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type">
                                            {type === "TERM" ? "Term Exam" :
                                                type === "TEST" ? "Unit Test / Assessment" : "Competition"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TERM">Term Exam</SelectItem>
                                        <SelectItem value="TEST">Unit Test / Assessment</SelectItem>
                                        <SelectItem value="COMPETITION">Competition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {category === 'ACADEMIC' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Max Marks</Label>
                                        <Input type="number" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Min Pass Marks</Label>
                                        <Input type="number" value={minMarks} onChange={e => setMinMarks(Number(e.target.value))} required />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input placeholder="Brief description of the curriculum covered..." value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Configuration */}
                <div className="space-y-6">

                    {/* Participating Classes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Participants</CardTitle>
                            <CardDescription>Which classes are taking this exam?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between text-left font-normal"
                                    onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                                >
                                    <span>
                                        {selectedClasses.length > 0
                                            ? `${selectedClasses.length} classes selected`
                                            : "Select Classes"}
                                    </span>
                                    <Users className="h-4 w-4 ml-2 opacity-50" />
                                </Button>

                                {classDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
                                        {classrooms.length === 0 ? (
                                            <div className="p-2 text-sm text-center text-muted-foreground">No classes found</div>
                                        ) : (
                                            classrooms.map(c => (
                                                <div key={c.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-sm cursor-pointer" onClick={() => {
                                                    handleClassToggle(c.id);
                                                    // Don't close to allow multi-select
                                                }}>
                                                    <Checkbox
                                                        checked={selectedClasses.includes(c.id)}
                                                        onCheckedChange={() => handleClassToggle(c.id)}
                                                        id={`cls-${c.id}`}
                                                    />
                                                    <label htmlFor={`cls-${c.id}`} className="text-sm cursor-pointer flex-1">
                                                        {c.name}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Backdrop to close */}
                            {classDropdownOpen && (
                                <div className="fixed inset-0 z-0 bg-transparent" onClick={() => setClassDropdownOpen(false)} />
                            )}

                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedClasses.map(id => {
                                    const cls = classrooms.find(c => c.id === id);
                                    return (
                                        <Badge key={id} variant="secondary">
                                            {cls?.name}
                                            <button type="button" className="ml-1 hover:text-red-500" onClick={() => removeClass(id)}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subjects */}
                    {category === "ACADEMIC" && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Subjects</CardTitle>
                                <CardDescription>Add subjects to be graded.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between text-left font-normal"
                                        onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                                    >
                                        <span>
                                            {selectedSubjects.length > 0
                                                ? `${selectedSubjects.length} subjects selected`
                                                : "Select Subjects"}
                                        </span>
                                        <BookOpen className="h-4 w-4 ml-2 opacity-50" />
                                    </Button>

                                    {subjectDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
                                            {availableSubjects.length === 0 ? (
                                                <div className="p-2 text-sm text-center text-muted-foreground">No subjects found</div>
                                            ) : (
                                                availableSubjects.map(s => (
                                                    <div key={s.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-sm cursor-pointer" onClick={() => {
                                                        handleSubjectToggle(s.name);
                                                        // Don't close to allow multi-select
                                                    }}>
                                                        <Checkbox
                                                            checked={selectedSubjects.includes(s.name)}
                                                            onCheckedChange={() => handleSubjectToggle(s.name)}
                                                            id={`sub-${s.id}`}
                                                        />
                                                        <label htmlFor={`sub-${s.id}`} className="text-sm cursor-pointer flex-1">
                                                            {s.name}
                                                        </label>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Backdrop to close */}
                                {subjectDropdownOpen && (
                                    <div className="fixed inset-0 z-0 bg-transparent" onClick={() => setSubjectDropdownOpen(false)} />
                                )}

                                <div className="space-y-2">
                                    {selectedSubjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubjects.map(sub => (
                                                <Badge key={sub} variant="outline" className="pl-2 pr-1 py-1 bg-brand/5 border-brand/20 text-brand">
                                                    {sub}
                                                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-transparent text-brand" onClick={() => removeSubject(sub)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">No subjects added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Button type="submit" size="lg" className="w-full bg-brand hover:brightness-110" disabled={loading}>
                        {loading ? "Creating Assessment..." : "Create Assessment"}
                    </Button>
                </div>

            </form>
        </div>
    );
}
