"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Users, Receipt, AlertCircle, ChevronRight, GraduationCap, X } from "lucide-react";
import { toast } from "sonner";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { promoteStudentsAction } from "@/app/actions/student-promotion-actions";
import { Badge } from "@/components/ui/badge";
// Separator removed due to potential module resolution issues

export default function PromoteStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isPromoting, setIsPromoting] = useState(false);
    const [isStudentsLoading, setIsStudentsLoading] = useState(false);

    // Form State
    const [sourceClassId, setSourceClassId] = useState("");
    const [targetClassId, setTargetClassId] = useState("");
    const [targetYearId, setTargetYearId] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    // Computed Options for Academic Year
    const yearOptions = useMemo(() => {
        if (academicYears.length === 0) return [];

        // Find current year
        const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
        const options = [...academicYears];

        // Ensure next year exists
        try {
            // Check formatted like "2025-2026"
            const name = currentYear.name;
            const parts = name.split("-");
            if (parts.length === 2) {
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);
                const nextYearName = `${start + 1}-${end + 1}`;

                const exists = academicYears.find(y => y.name === nextYearName);
                if (!exists) {
                    // Add purely for selection, ID will be special to trigger creation
                    options.push({
                        id: `NEW:${nextYearName}`,
                        name: nextYearName,
                        isCurrent: false,
                        isNew: true
                    });
                }
            }
        } catch (e) {
            console.error("Error calculating next year", e);
        }

        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [academicYears]);

    // Effect: Set default Target Year
    useEffect(() => {
        if (yearOptions.length > 0 && !targetYearId) {
            // Prioritize the "New" year or the one after current
            const nextYearOption = yearOptions.find(y => y.isNew);
            if (nextYearOption) {
                setTargetYearId(nextYearOption.id);
            } else {
                // If no new option needed (exists), find the one causing "next year" logic
                const current = academicYears.find(y => y.isCurrent);
                if (current) {
                    const parts = current.name.split("-");
                    if (parts.length === 2) {
                        const nextName = `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}`;
                        const exist = yearOptions.find(y => y.name === nextName);
                        if (exist) setTargetYearId(exist.id);
                    }
                }
            }
        }
    }, [yearOptions, targetYearId]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [classesRes, yearsRes] = await Promise.all([
            getClassroomsAction(slug),
            getAcademicYearsAction(slug)
        ]);

        if (classesRes.success) setClassrooms(classesRes.data || []);
        if (yearsRes.success) setAcademicYears(yearsRes.data || []);
        setIsLoading(false);
    };

    // Load students when Source Class changes
    useEffect(() => {
        if (sourceClassId) {
            loadStudents();
        } else {
            setStudents([]);
            setSelectedStudents([]);
            // Auto-select target class (logic: next sequential class if possible?)
            // Just clearing target class to be safe, or leave it.
        }
    }, [sourceClassId]);

    const loadStudents = async () => {
        setIsStudentsLoading(true);
        const res = await getStudentsAction(slug, {
            filters: {
                class: classrooms.find(c => c.id === sourceClassId)?.name,
                status: "ACTIVE"
            },
            limit: 200
        });

        if (res.success) {
            setStudents(res.students || []);
            // Default select all
            setSelectedStudents(res.students?.map((s: any) => s.id) || []);
        }
        setIsStudentsLoading(false);
    };

    const handlePromote = async () => {
        // DEBUG ALERTS
        window.alert("Button clicked! handlePromote triggered.");

        if (!targetClassId || !targetYearId || selectedStudents.length === 0) {
            window.alert(`Validation failed: class=${targetClassId}, year=${targetYearId}, students=${selectedStudents.length}`);
            return;
        }

        const targetClassName = classrooms.find(c => c.id === targetClassId)?.name;
        window.alert(`Attempting promotion to ${targetClassName}...`);

        setIsPromoting(true);
        try {
            const res = await promoteStudentsAction({
                schoolSlug: slug,
                studentIds: selectedStudents,
                targetClassroomId: targetClassId,
                targetAcademicYearId: targetYearId
            });

            window.alert(`Action returned: success=${res.success}`);

            if (res.success) {
                toast.success(res.message);
                router.push(`/s/${slug}/students`);
            } else {
                toast.error(res.error || "Promotion failed");
            }
        } catch (err: any) {
            console.error("Promotion Exception:", err);
            window.alert(`Exception occurred: ${err.message}`);
            toast.error("An unexpected error occurred during promotion.");
        } finally {
            setIsPromoting(false);
            window.alert("isPromoting set back to false.");
        }
    };




    const toggleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(s => s !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const sourceClassName = classrooms.find(c => c.id === sourceClassId)?.name;

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Promote Students</h1>
                <p className="text-muted-foreground mt-2 text-lg">Move students to the next grade and prepare records for the upcoming academic year.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Configuration */}
                <Card className="lg:col-span-4 shadow-lg border-zinc-200/60 sticky top-6">
                    <CardHeader className="bg-zinc-50/50 border-b pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-brand" />
                            Promotion Settings
                        </CardTitle>
                        <CardDescription>Configure the move parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Step 1: Source */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">FROM (Current)</Label>
                            <Select value={sourceClassId} onValueChange={setSourceClassId}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-zinc-200">
                                    <SelectValue placeholder="Select Source Class">
                                        {sourceClassId ? classrooms.find(c => c.id === sourceClassId)?.name : "Select Source Class"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-white p-2 rounded-full border shadow-sm text-zinc-400">
                                <ArrowRight className="h-4 w-4 rotate-90" />
                            </div>
                        </div>

                        {/* Step 2: Target */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">TO (Next)</Label>
                            <Select value={targetClassId} onValueChange={setTargetClassId}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-zinc-200">
                                    <SelectValue placeholder="Select Target Class">
                                        {targetClassId ? classrooms.find(c => c.id === targetClassId)?.name : "Select Target Class"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-px bg-zinc-200" />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Target Academic Year</Label>
                                {targetYearId && targetYearId.startsWith("NEW:") && (
                                    <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-50">New Year</Badge>
                                )}
                            </div>
                            <Select value={targetYearId} onValueChange={setTargetYearId}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-zinc-200">
                                    <SelectValue placeholder="Select Year">
                                        {targetYearId
                                            ? yearOptions.find(y => y.id === targetYearId)?.name + (yearOptions.find(y => y.id === targetYearId)?.isNew ? " (Create New)" : "")
                                            : "Select Year"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map(y => (
                                        <SelectItem key={y.id} value={y.id}>
                                            {y.name} {(y as any).isNew ? "(Create New)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Students will be moved into this academic year.
                            </p>
                        </div>



                        <StandardActionButton
                            onClick={handlePromote}
                            variant="primary"
                            icon={Users}
                            label={`Promote ${selectedStudents.length} Students`}
                            loading={isPromoting}
                            loadingLabel="Promoting..."
                            disabled={!targetClassId || !targetYearId || selectedStudents.length === 0}
                            className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-brand/20 mt-4"
                            permission={{ module: 'students.profiles', action: 'edit' }}
                        />
                    </CardContent>
                </Card>


                {/* RIGHT COLUMN: Student Selection */}
                <Card className="lg:col-span-8 shadow-sm border-zinc-200 bg-white">
                    <CardHeader className="border-b bg-zinc-50/30 flex flex-row items-center justify-between py-4">
                        <div>
                            <CardTitle className="text-lg">Students List</CardTitle>
                            <CardDescription>
                                {sourceClassId ? `Finding students in ${sourceClassName}` : "Select a source class to populate list"}
                            </CardDescription>
                        </div>
                        {students.length > 0 && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-lg shadow-sm">
                                <Checkbox
                                    checked={selectedStudents.length === students.length && students.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    id="select-all"
                                    className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                                />
                                <Label htmlFor="select-all" className="cursor-pointer text-sm font-semibold select-none">
                                    Select All ({selectedStudents.length})
                                </Label>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {isStudentsLoading ? (
                            <div className="space-y-4 p-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-16 bg-zinc-100 rounded-xl w-full animate-pulse" />
                                ))}
                            </div>
                        ) : students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-zinc-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">No students found</h3>
                                <p className="text-zinc-500 max-w-sm mt-1">
                                    {sourceClassId ? "There are no active students in the selected source class." : "Please select a source class from the panel on the left to view students."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        className={`flex items-center justify-between p-4 transition-all duration-200 cursor-pointer ${selectedStudents.includes(student.id) ? "bg-brand/5" : "hover:bg-zinc-50"
                                            }`}
                                        onClick={() => toggleStudent(student.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={() => toggleStudent(student.id)}
                                                    className="data-[state=checked]:bg-brand data-[state=checked]:border-brand h-5 w-5"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        student.name[0]
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-zinc-900">{student.name}</div>
                                                    <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                                                        Adm: {student.admissionNumber || "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 px-3 py-1">
                                                Ready for Promotion
                                            </Badge>
                                            <ChevronRight className="h-4 w-4 text-zinc-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
