"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, Calendar as CalendarIcon, FileSpreadsheet, Filter, CheckSquare, Square, Printer, Search, Edit3, Trash2, X } from "lucide-react";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { getExamsAction, deleteExamAction } from "@/app/actions/exam-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import BulkReportPrinter from "@/components/reports/BulkReportPrinter";

export default function ReportsDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [exams, setExams] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYearId, setSelectedYearId] = useState<string>("all");

    // Filter states
    const [filterClass, setFilterClass] = useState("all");
    const [reportType, setReportType] = useState<"annual" | "exam">("annual");
    const [selectedExam, setSelectedExam] = useState<string>("all");

    // Selection state
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    const isInitialMount = useRef(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setIsLoading(true);
        const [classesRes, yearsRes] = await Promise.all([
            getClassroomsAction(slug),
            getAcademicYearsAction(slug)
        ]);

        let yearId = "all";

        if (yearsRes.success && yearsRes.data) {
            // Calculate which year is actually current based on today's date
            const today = new Date();
            const actualCurrentYear = yearsRes.data.find((y: any) => {
                const start = new Date(y.startDate);
                const end = new Date(y.endDate);
                return today >= start && today <= end;
            });

            // Update the years data to mark the actual current year
            const yearsWithCorrectCurrent = yearsRes.data.map((y: any) => ({
                ...y,
                isCurrent: actualCurrentYear ? y.id === actualCurrentYear.id : y.isCurrent
            }));

            setAcademicYears(yearsWithCorrectCurrent);

            // Logic to match AcademicYearSelector.tsx
            const cookieValue = getCookie(`academic_year_${slug}`);
            let yearIdFromCookie = yearsWithCorrectCurrent.find((y: any) => y.id === cookieValue);

            const current = yearIdFromCookie || actualCurrentYear || yearsRes.data.find((y: any) => y.isCurrent) || yearsRes.data[0];
            const defaultId = current?.id || "all";

            yearId = defaultId;
            setSelectedYearId(defaultId);
        } else if (!yearsRes.success) {
            toast.error("Failed to load academic years: " + yearsRes.error);
        }

        if (classesRes.success) setClassrooms(classesRes.data || []);

        // Fetch exams for the specific year immediately
        const examsRes = await getExamsAction(slug, undefined, {
            academicYearId: yearId !== "all" ? yearId : undefined
        });

        if (examsRes.success) setExams(examsRes.data || []);

        setIsLoading(false);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!isLoading) {
                refreshExams();
            }
        }
    }, [selectedYearId]);

    const refreshExams = async () => {
        setIsLoading(true); // Optional: show loading state when switching years
        const res = await getExamsAction(slug, undefined, {
            academicYearId: selectedYearId !== "all" ? selectedYearId : undefined
        });
        if (res.success) setExams(res.data || []);
        setIsLoading(false);
    };

    const handleSearch = async (query: string, classId: string = filterClass) => {
        setSearchQuery(query);
        setIsSearching(true);

        const res = await getStudentsAction(slug, {
            search: query,
            filters: {
                class: classId !== "all" ? classrooms.find(c => c.id === classId)?.name : "all",
                academicYearId: selectedYearId !== "all" ? selectedYearId : undefined
            },
            limit: 50
        });

        if (res.success) {
            setSearchResults(res.students || []);
        } else {
            toast.error(res.error || "Search failed");
        }
        setIsSearching(false);
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedStudents.length === searchResults.length && searchResults.length > 0) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(searchResults.map(s => s.id));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all marks associated with this exam.")) return;
        const res = await deleteExamAction(slug, id);
        if (res.success) {
            toast.success("Exam deleted");
            loadInitialData();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Progress Reports</h1>
                    <p className="text-muted-foreground">Manage exams, tests, and student reports.</p>
                </div>
                {/* Global Actions if needed */}
            </div>

            <Tabs defaultValue="exams" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="exams">Manage Exams</TabsTrigger>
                        <TabsTrigger value="students">Student Reports</TabsTrigger>
                    </TabsList>

                    {/* Add Exam Button only visible on exams tab ideally, but keeping strictly separated */}
                    <StandardActionButton
                        asChild
                        variant="primary"
                        icon={Plus}
                        label="Create Exam"
                        permission={{ module: 'exams', action: 'create' }}
                    >
                        <Link href={`/s/${slug}/students/reports/create`} />
                    </StandardActionButton>
                </div>

                <TabsContent value="exams" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                            <CardTitle>Recent Exams</CardTitle>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Year:</label>
                                <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                                    <SelectTrigger className="w-[180px] h-8 text-xs font-bold">
                                        <SelectValue placeholder="Select Year">
                                            {selectedYearId === "all" ? "All Years" : academicYears.find(y => y.id === selectedYearId)?.name}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {academicYears.map(y => (
                                            <SelectItem key={y.id} value={y.id}>{y.name} {y.isCurrent && "(Current)"}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-4">Loading...</div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No exams found for the selected year.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-brand/10 rounded-lg text-brand mt-1">
                                                    {exam.category === 'SPORTS' ? <BarChart className="h-5 w-5" /> :
                                                        exam.category === 'ARTS' ? <BarChart className="h-5 w-5" /> :
                                                            <FileSpreadsheet className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{exam.title}</h3>
                                                        <Badge variant="outline">{exam.type}</Badge>
                                                        <Badge variant="secondary" className="text-xs">{exam.category}</Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {format(new Date(exam.date), "PPP")}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {exam._count?.results || 0} results recorded
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StandardActionButton
                                                    asChild
                                                    variant="view"
                                                    label="Enter Marks"
                                                    size="sm"
                                                    permission={{ module: 'exams', action: 'edit' }}
                                                >
                                                    <Link href={`/s/${slug}/students/reports/${exam.id}`} />
                                                </StandardActionButton>
                                                <StandardActionButton
                                                    asChild
                                                    variant="edit"
                                                    icon={Edit3}
                                                    label="Edit"
                                                    size="sm"
                                                    permission={{ module: 'exams', action: 'edit' }}
                                                >
                                                    <Link href={`/s/${slug}/students/reports/${exam.id}/edit`} />
                                                </StandardActionButton>
                                                <StandardActionButton
                                                    variant="delete"
                                                    icon={Trash2}
                                                    label="Delete"
                                                    size="sm"
                                                    onClick={() => handleDelete(exam.id)}
                                                    permission={{ module: 'exams', action: 'delete' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students" className="space-y-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="px-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Bulk Progress Reports</CardTitle>
                                    <p className="text-sm text-muted-foreground">Filter students by class and assessment to print reports in bulk.</p>
                                </div>
                                {selectedStudents.length > 0 && (
                                    <StandardActionButton
                                        onClick={() => setIsPrinting(true)}
                                        variant="primary"
                                        icon={Printer}
                                        label={`Print ${selectedStudents.length} Reports`}
                                        className="shadow-lg shadow-brand/20"
                                    />
                                )}
                            </div>
                        </CardHeader>

                        {isPrinting && (
                            <BulkReportPrinter
                                studentIds={selectedStudents}
                                schoolSlug={slug}
                                reportType={reportType}
                                selectedExamId={selectedExam}
                                academicYearId={selectedYearId !== "all" ? selectedYearId : undefined}
                                academicYearName={selectedYearId !== "all" ? academicYears.find(y => y.id === selectedYearId)?.name : undefined}
                                onClose={() => setIsPrinting(false)}
                            />
                        )}

                        <CardContent className="px-0 space-y-6">
                            {/* Filter Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white border rounded-2xl shadow-sm">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Academic Year</label>
                                    <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                                        <SelectTrigger className="rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                            <SelectValue placeholder="All Years">
                                                {selectedYearId === "all" ? "All Years" : academicYears.find(y => y.id === selectedYearId)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            {academicYears.map(y => (
                                                <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Report Type</label>
                                    <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                                        <SelectTrigger className="rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                            <SelectValue>
                                                {reportType === "annual" ? "Annual Summary" : "Specific Assessment"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="annual">Annual Summary</SelectItem>
                                            <SelectItem value="exam">Specific Assessment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Class</label>
                                    <Select value={filterClass} onValueChange={(v: string) => { setFilterClass(v); handleSearch(searchQuery, v); }}>
                                        <SelectTrigger className="rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                            <SelectValue placeholder="All Classes">
                                                {filterClass === "all" ? "All Classes" : classrooms.find(c => c.id === filterClass)?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Classes</SelectItem>
                                            {classrooms.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {reportType === "exam" && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Assessment</label>
                                        <Select value={selectedExam} onValueChange={setSelectedExam}>
                                            <SelectTrigger className="rounded-xl border-zinc-200 bg-zinc-50 font-bold">
                                                <SelectValue placeholder="Select Assessment">
                                                    {selectedExam === "all" ? "All Recent" : exams.find(e => e.id === selectedExam)?.title}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Recent</SelectItem>
                                                {exams.map(e => (
                                                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-1.5 md:col-span-1">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Quick Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            placeholder="Student name..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b bg-zinc-50/50">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={searchResults.length > 0 && selectedStudents.length === searchResults.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="rounded-md border-zinc-300"
                                        />
                                        <span className="text-sm font-bold text-zinc-600">
                                            {selectedStudents.length} selected
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-400 font-medium italic">
                                        Showing {searchResults.length} students
                                    </span>
                                </div>

                                <div className="divide-y">
                                    {isSearching ? (
                                        <div className="text-center py-12 text-zinc-400 font-medium animate-pulse">Searching students...</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        checked={selectedStudents.includes(student.id)}
                                                        onCheckedChange={() => toggleStudentSelection(student.id)}
                                                        className="rounded-md border-zinc-300"
                                                    />
                                                    <StudentAvatar
                                                        src={student.avatar}
                                                        name={student.name}
                                                        className="h-10 w-10 ring-2 ring-zinc-100 ring-offset-1"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-zinc-900 group-hover:text-brand transition-colors">{cleanName(student.name)}</h4>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                            {student.class} • Adm: {student.admissionNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StandardActionButton
                                                        asChild
                                                        variant="ghost"
                                                        label="Single Report"
                                                        size="sm"
                                                        className="font-bold text-xs"
                                                    >
                                                        <Link href={`/s/${slug}/students/reports/student/${student.id}`} />
                                                    </StandardActionButton>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-zinc-400 italic">
                                            {searchQuery || filterClass !== "all" ? "No students found matching filters" : "Select a class or search to see students"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
