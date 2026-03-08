"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Star, Users, Trophy, Search, 
    Filter, TrendingUp, Award, Clock, History, Activity
} from "lucide-react";
import { 
    SectionHeader, Btn, tableStyles, SortIcon
} from "@/components/ui/erp-ui";
import { 
    getActivityPerformanceAction, 
    createActivityPerformanceAction,
    getActivitiesAction,
    getActivityEnrollmentsAction
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { ErpModal, ErpInput, ErpCard, StatusChip } from "@/components/ui/erp-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedActivity, setSelectedActivity] = useState<string>("all");
    const [showEvalModal, setShowEvalModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortCol, setSortCol] = useState("student");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const loadData = async () => {
        setIsLoading(true);
        const [enRes, perfRes, actRes] = await Promise.all([
            getActivityEnrollmentsAction(slug),
            getActivityPerformanceAction(slug),
            getActivitiesAction(slug)
        ]);
        if (enRes.success) setEnrollments(enRes.data);
        if (perfRes.success) setPerformanceData(perfRes.data);
        if (actRes.success) setActivities(actRes.data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const getLatestPerformance = (studentId: string, activityId: string) => {
        return performanceData.find(p => p.studentId === studentId && p.activityId === activityId);
    };

    const handleAddEvaluation = async (formData: any) => {
        setIsSubmitting(true);
        const res = await createActivityPerformanceAction(slug, formData);
        if (res.success) {
            toast.success("Evaluation saved successfully");
            setShowEvalModal(false);
            loadData();
        } else {
            toast.error(res.error || "Failed to save evaluation");
        }
        setIsSubmitting(false);
    };

    // Calculate KPIs
    const totalStudents = enrollments.length;
    const evaluatedStudents = new Set(performanceData.map(p => p.studentId)).size;
    const averageRating = performanceData.length > 0 
        ? (performanceData.reduce((acc, curr) => acc + curr.skillRating, 0) / performanceData.length).toFixed(1)
        : "N/A";

    const filtered = enrollments.filter(e => {
        const matchesSearch = e.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              e.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              e.activity.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesActivity = selectedActivity === "all" || e.activity.id === selectedActivity;
        return matchesSearch && matchesActivity;
    }).sort((a, b) => {
        let valA = "";
        let valB = "";

        if (sortCol === "student") {
            valA = `${a.student.firstName} ${a.student.lastName}`;
            valB = `${b.student.firstName} ${b.student.lastName}`;
        } else if (sortCol === "activity") {
            valA = a.activity.name;
            valB = b.activity.name;
        } else if (sortCol === "level") {
            const latestA = getLatestPerformance(a.student.id, a.activity.id);
            const latestB = getLatestPerformance(b.student.id, b.activity.id);
            valA = latestA?.level || a.skillLevel || "Beginner";
            valB = latestB?.level || b.skillLevel || "Beginner";
        }

        if (sortDir === "asc") return valA.localeCompare(valB);
        return valB.localeCompare(valA);
    });

    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Performance Tracking"
                subtitle="Evaluate student skill development and track achievements."
                icon={Star}
                action={
                    <Btn 
                        icon={TrendingUp} 
                        onClick={() => {}} // TODO: Add evaluation modal
                    >Add Evaluation</Btn>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Total Enrolled</p>
                        <h3 className="text-2xl font-black text-zinc-900">{totalStudents}</h3>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Students Evaluated</p>
                        <h3 className="text-2xl font-black text-zinc-900">{evaluatedStudents}</h3>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Avg Growth Score</p>
                        <h3 className="text-2xl font-black text-zinc-900">{averageRating}</h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border-2 border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search students or activities..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 transition-all outline-none font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-auto relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
                    <select
                        aria-label="Filter by activity program"
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                        className="w-full md:w-auto pl-11 pr-10 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Activities</option>
                        {activities.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border-2 border-zinc-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th style={tableStyles.th} className="pl-8" onClick={() => handleSort("student")}>
                                    Student <SortIcon col="student" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={tableStyles.th} onClick={() => handleSort("activity")}>
                                    Activity <SortIcon col="activity" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={tableStyles.th} onClick={() => handleSort("level")}>
                                    Level <SortIcon col="level" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={{ ...tableStyles.th, cursor: 'default' }}>Growth Score</th>
                                <th style={{ ...tableStyles.th, cursor: 'default' }}>Latest Eval</th>
                                <th style={{ ...tableStyles.th, textAlign: 'center', cursor: 'default' }} className="pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((en, idx) => {
                                const latest = getLatestPerformance(en.student.id, en.activity.id);
                                return (
                                    <tr 
                                        key={en.id} 
                                        style={idx % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                        className="group hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td style={tableStyles.td} className="pl-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full border-2 border-zinc-100 overflow-hidden bg-zinc-50 flex-shrink-0">
                                                    <img 
                                                        src={en.student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${en.student.firstName}`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-zinc-900 leading-tight">{en.student.firstName} {en.student.lastName}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 tracking-tight">{en.student.studentId || "No ID"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td} className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center">
                                                    <Trophy className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                                                </div>
                                                <span className="text-[13px] font-bold text-zinc-600 uppercase tracking-tighter">{en.activity.name}</span>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td} className="py-4">
                                            <StatusChip 
                                                label={latest?.level || en.skillLevel || "Beginner"} 
                                                color={latest?.level === "Advanced" ? "purple" : "amber"}
                                            />
                                        </td>
                                        <td style={tableStyles.td} className="py-4">
                                            <div className="flex items-center gap-0.5">
                                                {[1,2,3,4,5].map(i => (
                                                    <Star key={i} className={cn("w-3 h-3 transition-all", i <= (latest?.skillRating || 3) ? "text-amber-400 fill-amber-400 scale-110" : "text-zinc-200 fill-zinc-200")} />
                                                ))}
                                            </div>
                                        </td>
                                        <td style={tableStyles.td} className="py-4 text-[12px] font-bold text-zinc-400 whitespace-nowrap">
                                            {latest ? new Date(latest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Not evaluated"}
                                        </td>
                                        <td style={tableStyles.td} className="py-4 pr-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedEnrollment(en);
                                                        setShowHistoryModal(true);
                                                    }}
                                                    title="View Progress History"
                                                    className="p-2.5 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                                                >
                                                    <History className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedEnrollment(en);
                                                        setShowEvalModal(true);
                                                    }}
                                                    title="Assess Student Growth"
                                                    className="p-2.5 bg-zinc-900 text-white rounded-xl hover:bg-amber-500 transition-all shadow-lg hover:shadow-amber-100"
                                                >
                                                    <TrendingUp className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 bg-zinc-50/30">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center">
                            <Users className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No matching students found</p>
                    </div>
                )}
            </div>

            <EvaluationModal
                open={showEvalModal}
                onClose={() => setShowEvalModal(false)}
                onSubmit={handleAddEvaluation}
                loading={isSubmitting}
                enrollment={selectedEnrollment}
            />

            <HistoryModal
                open={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                enrollment={selectedEnrollment}
                performanceData={performanceData}
            />
        </div>
    );
}

function EvaluationModal({ open, onClose, onSubmit, loading, enrollment }: any) {
    const [formData, setFormData] = useState({
        studentId: "",
        activityId: "",
        skillRating: 3,
        level: "Developing",
        comments: "",
        coachRemarks: ""
    });

    useEffect(() => {
        if (enrollment) {
            setFormData(prev => ({
                ...prev,
                studentId: enrollment.student.id,
                activityId: enrollment.activity.id,
                level: enrollment.skillLevel || "Developing"
            }));
        }
    }, [enrollment]);

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title="Growth Assessment"
            subtitle={`Evaluating ${enrollment?.student?.firstName}'s progress in ${enrollment?.activity?.name}.`}
            icon={TrendingUp}
            footer={
                <div className="flex gap-3">
                    <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                    <Btn loading={loading} onClick={() => onSubmit(formData)}>Save Evaluation</Btn>
                </div>
            }
        >
            <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col items-center gap-3 p-6 bg-zinc-50 rounded-[32px] border-2 border-zinc-100">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Growth Score</span>
                    <div className="flex items-center gap-3">
                        {[1,2,3,4,5].map(i => (
                            <button 
                                key={i}
                                onClick={() => setFormData({ ...formData, skillRating: i })}
                                className="transition-transform active:scale-90"
                            >
                                <Star 
                                    className={cn(
                                        "w-8 h-8 transition-all", 
                                        i <= formData.skillRating ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200"
                                    )} 
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase px-1">Proficiency Level</label>
                        <select 
                            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all appearance-none"
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Developing">Developing</option>
                            <option value="Skilled">Skilled</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase px-1">Coach Reflection</label>
                    <textarea 
                        className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-4 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all min-h-[120px] resize-none"
                        placeholder="Provide detailed feedback on performance, participation, and areas for improvement..."
                        value={formData.comments}
                        onChange={e => setFormData({ ...formData, comments: e.target.value })}
                    />
                </div>
            </div>
        </ErpModal>
    );
}

function HistoryModal({ open, onClose, enrollment, performanceData }: any) {
    if (!enrollment) return null;

    const history = performanceData
        .filter((p: any) => p.studentId === enrollment.student.id && p.activityId === enrollment.activity.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title="Performance History"
            subtitle={`Historical evaluations for ${enrollment.student.firstName} in ${enrollment.activity.name}`}
            icon={History}
            maxWidth={700}
        >
            <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 font-bold text-sm bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
                        No evaluations recorded yet.
                    </div>
                ) : (
                    history.map((record: any, index: number) => (
                        <div key={record.id} className="relative flex gap-4 p-5 bg-white rounded-3xl border-2 border-zinc-100 shadow-sm hover:border-amber-500/20 transition-all group">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                    <Star className="w-5 h-5 fill-amber-500" />
                                </div>
                                {index !== history.length - 1 && (
                                    <div className="w-0.5 h-full bg-zinc-100 rounded-full my-1" />
                                )}
                            </div>
                            <div className="flex flex-col gap-3 flex-1 pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-zinc-900">{new Date(record.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-black uppercase tracking-wider">{record.level}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={cn("w-3.5 h-3.5", i <= record.skillRating ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200")} />
                                    ))}
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl text-sm font-bold text-zinc-600 italic leading-relaxed border border-zinc-100">
                                    "{record.comments}"
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ErpModal>
    );
}
