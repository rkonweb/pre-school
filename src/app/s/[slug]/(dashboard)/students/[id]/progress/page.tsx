"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudentProgressAction } from "@/app/actions/analytics-actions";
import { getStudentHealthHistoryAction, addHealthRecordAction } from "@/app/actions/health-actions";
import { getStudentActivitiesAction, addActivityRecordAction } from "@/app/actions/activity-actions";
import { getStudentAction } from "@/app/actions/student-actions";
import { toast } from "sonner";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Activity, BookOpen, HeartPulse, Trophy, Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming exists

export default function StudentProgressPage() {
    const params = useParams();
    const slug = params.slug as string;
    const studentId = params.id as string;

    const [student, setStudent] = useState<any>(null);
    const [progressData, setProgressData] = useState<any>(null);
    const [healthData, setHealthData] = useState<any[]>([]);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [stuRes, progRes, healthRes, actRes] = await Promise.all([
            getStudentAction(slug, studentId),
            getStudentProgressAction(studentId),
            getStudentHealthHistoryAction(studentId),
            getStudentActivitiesAction(studentId)
        ]);

        if (stuRes.success) setStudent(stuRes.data);
        if (progRes.success) setProgressData(progRes.data);
        if (healthRes.success) setHealthData(healthRes.data);
        if (actRes.success) setActivityData(actRes.data);
        setLoading(false);
    };

    if (loading || !student) return <div className="p-8 text-center">Loading Student Profile...</div>;

    // Prepare Radar Data
    const academicScore = progressData?.academicTrend?.length > 0
        ? progressData.academicTrend[progressData.academicTrend.length - 1].percentage
        : 0;
    const attendanceScore = progressData?.attendance?.percentage || 0;
    const sportsCount = activityData.filter(a => a.category === 'SPORTS').length; // heuristic
    const artsCount = activityData.filter(a => a.category === 'ARTS').length; // heuristic
    const sportsScore = Math.min(sportsCount * 20, 100); // 5 activities = 100%
    const artsScore = Math.min(artsCount * 20, 100);

    const radarData = [
        { subject: 'Academics', A: academicScore, fullMark: 100 },
        { subject: 'Attendance', A: attendanceScore, fullMark: 100 },
        { subject: 'Sports', A: sportsScore, fullMark: 100 },
        { subject: 'Arts', A: artsScore, fullMark: 100 },
        { subject: 'Social', A: 80, fullMark: 100 }, // Placeholder or derived from remarks
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Holistic Progress Report</h1>
                    <p className="text-muted-foreground">Comprehensive view of {student.firstName}'s development.</p>
                </div>
                <div className="flex gap-2">
                    {/* Add Record Buttons */}
                    <AddActivityDialog schoolSlug={slug} studentId={studentId} onSuccess={loadData} />
                    <AddHealthDialog schoolSlug={slug} studentId={studentId} onSuccess={loadData} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Student" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Attendance & Stats</CardTitle>
                        <CardDescription>Current Academic Year</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <div className="text-5xl font-bold text-green-600 mb-2">{progressData?.attendance?.percentage}%</div>
                            <p className="text-sm text-muted-foreground">Attendance</p>
                            <div className="flex justify-center gap-4 mt-6 text-sm">
                                <div>
                                    <span className="font-bold block">{progressData?.attendance?.presentDays}</span> Present
                                </div>
                                <div>
                                    <span className="font-bold block text-blue-600">{activityData.length}</span> Activities
                                </div>
                                <div>
                                    <span className="font-bold block text-orange-600">{healthData.length}</span> Checkups
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="academic" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="academic" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Academics</TabsTrigger>
                    <TabsTrigger value="activities" className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Co-Curricular</TabsTrigger>
                    <TabsTrigger value="health" className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Health</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {progressData?.academicTrend?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={progressData.academicTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="exam" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No academic data yet</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activities" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activityData.map((act) => (
                                    <div key={act.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{act.title}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline">{act.category}</Badge>
                                                    <Badge className={act.type === 'AWARD' ? 'bg-yellow-500' : 'bg-blue-500'}>{act.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{act.description}</p>
                                            </div>
                                        </div>
                                        {act.achievement && (
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-yellow-600 block">{act.achievement}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(act.date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {activityData.length === 0 && <div className="text-center py-8 text-muted-foreground">No activities recorded.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>Growth Chart (Height/Weight)</CardTitle></CardHeader>
                        <CardContent className="h-[300px]">
                            {healthData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[...healthData].reverse()}>
                                        {/* reverse to show chronological left to right if desc */}
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="recordedAt" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip labelFormatter={(str) => new Date(str).toLocaleDateString()} />
                                        <Line yAxisId="left" type="monotone" dataKey="height" stroke="#16a34a" name="Height (cm)" />
                                        <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#ea580c" name="Weight (kg)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No health records found</div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        {healthData.map((rec) => (
                            <Card key={rec.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-base">Checkup: {new Date(rec.recordedAt).toLocaleDateString()}</CardTitle>
                                        <Badge variant="outline">BMI: {rec.bmi || '-'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="grid grid-cols-2">
                                        <span className="text-muted-foreground">Vision (L/R):</span>
                                        <span>{rec.visionLeft || '-'}/{rec.visionRight || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <span className="text-muted-foreground">Dental:</span>
                                        <span>{rec.dentalStatus || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block mb-1">General Health:</span>
                                        <p className="bg-slate-50 p-2 rounded text-xs">{rec.generalHealth || 'No remarks'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AddActivityDialog({ schoolSlug, studentId, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("SPORTS");
    const [type, setType] = useState("PARTICIPATION");
    const [date, setDate] = useState("");
    const [desc, setDesc] = useState("");
    const [achievement, setAchievement] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const res = await addActivityRecordAction(schoolSlug, studentId, { title, category, type, date, description: desc, achievement });
        if (res.success) {
            toast.success("Activity added");
            setOpen(false);
            onSuccess();
        } else {
            toast.error("Failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add Activity</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Activity Record</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Inter-School Debate" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SPORTS">Sports</SelectItem><SelectItem value="ARTS">Arts</SelectItem><SelectItem value="CLUB">Club</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Type</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PARTICIPATION">Participation</SelectItem><SelectItem value="AWARD">Award</SelectItem></SelectContent></Select></div>
                    </div>
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
                    {type === 'AWARD' && <div className="space-y-2"><Label>Achievement</Label><Input value={achievement} onChange={e => setAchievement(e.target.value)} placeholder="e.g. First Place" /></div>}
                    <div className="space-y-2"><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} /></div>
                    <Button type="submit" className="w-full">Save</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddHealthDialog({ schoolSlug, studentId, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [general, setGeneral] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // Calc BMI logic if needed, or backend
        const bmi = (height && weight) ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1) : null;

        const res = await addHealthRecordAction(schoolSlug, studentId, {
            height, weight, generalHealth: general, bmi: bmi ? Number(bmi) : undefined
        });
        if (res.success) {
            toast.success("Health record added");
            setOpen(false);
            onSuccess();
        } else {
            toast.error("Failed");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add Health</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} required /></div>
                    </div>
                    <div className="space-y-2"><Label>General Health / Remarks</Label><Textarea value={general} onChange={e => setGeneral(e.target.value)} /></div>
                    <Button type="submit" className="w-full">Save</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
