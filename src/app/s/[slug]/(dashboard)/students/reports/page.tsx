"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, Calendar as CalendarIcon, FileSpreadsheet } from "lucide-react";
import { getExamsAction, deleteExamAction } from "@/app/actions/exam-actions";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function ReportsDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [exams, setExams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        setIsLoading(true);
        const res = await getExamsAction(slug);
        if (res.success) {
            setExams(res.data || []);
        } else {
            toast.error(res.error || "Failed to load exams");
        }
        setIsLoading(false);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            setIsSearching(true);
            const { searchStudentsAction } = await import("@/app/actions/student-actions");
            const res = await searchStudentsAction(slug, query);
            if (res.success) {
                setSearchResults(res.students || []);
            }
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all marks associated with this exam.")) return;
        const res = await deleteExamAction(slug, id);
        if (res.success) {
            toast.success("Exam deleted");
            loadExams();
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
                    <Link href={`/s/${slug}/students/reports/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Exam
                        </Button>
                    </Link>
                </div>

                <TabsContent value="exams" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Exams</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-4">Loading...</div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No exams created yet. Click "Create Exam" to start.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600 mt-1">
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
                                                <Link href={`/s/${slug}/students/reports/${exam.id}`}>
                                                    <Button variant="outline" size="sm">Enter Marks</Button>
                                                </Link>
                                                <Link href={`/s/${slug}/students/reports/${exam.id}/edit`}>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </Link>
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(exam.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Student</CardTitle>
                            <p className="text-sm text-muted-foreground">Search for a student to view their comprehensive progress report.</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative">
                                <Input
                                    placeholder="Search by name or admission number..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-4 h-12 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                {isSearching ? (
                                    <div className="text-center py-4 text-muted-foreground">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {searchResults.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden">
                                                        {student.avatar ? (
                                                            <img src={student.avatar} alt={student.firstName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                                                {student.firstName[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{student.firstName} {student.lastName}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">Adm: {student.admissionNumber || "N/A"} • Parent: {student.parentName}</p>
                                                    </div>
                                                </div>
                                                <Link href={`/s/${slug}/students/reports/student/${student.id}`}>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                                        View Report
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 2 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No students found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground italic">
                                        Start typing to search...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
