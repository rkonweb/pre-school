"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Search,
    Calendar,
    UserPlus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Eye,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    getAdmissionsAction,
    updateAdmissionStageAction,
    getAdmissionStatsAction,
    deleteAdmissionAction
} from "@/app/actions/admission-actions";

const STAGES = [
    { id: "INQUIRY", label: "Inquiries", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { id: "APPLICATION", label: "Applications", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
    { id: "INTERVIEW", label: "Interviews", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
    { id: "ENROLLED", label: "Enrolled", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
];

import { useRolePermissions } from "@/hooks/useRolePermissions";

export default function AdmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { can, isLoading: isPermsLoading } = useRolePermissions();

    const [activeStage, setActiveStage] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const [admRes, statRes] = await Promise.all([
            getAdmissionsAction(slug),
            getAdmissionStatsAction(slug)
        ]);

        if (admRes.success) setApplicants(admRes.admissions || []);
        if (statRes.success) setStats(statRes.stats);
        setIsLoading(false);
    }

    const handleStageUpdate = async (id: string, newStage: string) => {
        const res = await updateAdmissionStageAction(slug, id, newStage);
        if (res.success) {
            loadData();
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}'s inquiry?`)) {
            const res = await deleteAdmissionAction(slug, id);
            if (res.success) {
                loadData();
            } else {
                alert(res.error || "Failed to delete");
            }
        }
    };

    const filteredApplicants = applicants.filter(app =>
        (activeStage === "all" || app.stage === activeStage) &&
        (app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.parentName && app.parentName.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (!mounted || isPermsLoading) return null;

    if (isLoading && applicants.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    const canCreate = can('admissions', 'create');
    const canView = can('admissions', 'view');
    const canEdit = can('admissions', 'edit');
    const canDelete = can('admissions', 'delete');

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
                <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                <p>You do not have permission to view admissions.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        Admissions Pipeline
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">
                        Real-time enrollment tracking for {slug}
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href={`/s/${slug}/admissions/new`}
                        className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <UserPlus className="h-4 w-4" />
                        New Inquiry
                    </Link>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Inquiries" value={stats?.newInquiries || "0"} subValue="Pending follow-up" icon={AlertCircle} color="brand" />
                <StatCard title="Applications" value={stats?.applications || "0"} subValue="In review" icon={Clock} color="purple" />
                <StatCard title="Interviews" value={stats?.interviews || "0"} subValue="Scheduled" icon={Calendar} color="orange" />
                <StatCard title="Enrolled" value={stats?.enrolled || "0"} subValue="Successfully converted" icon={CheckCircle2} color="green" />
            </div>

            {/* Pipeline Content */}
            <div className="flex flex-col gap-6">
                <div className="flex overflow-x-auto gap-2 pb-px border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveStage("all")}
                        className={cn(
                            "px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
                            activeStage === "all" ? "text-brand border-brand" : "text-zinc-500 border-transparent hover:text-zinc-700"
                        )}
                    >
                        All Pipeline
                    </button>
                    {STAGES.map(stage => (
                        <button
                            key={stage.id}
                            onClick={() => setActiveStage(stage.id)}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2",
                                activeStage === stage.id ? "text-brand border-brand" : "text-zinc-500 border-transparent hover:text-zinc-700"
                            )}
                        >
                            {stage.label}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-black">
                                {applicants.filter(a => a.stage === stage.id).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Student or parent name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-950"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-zinc-50/50 text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-zinc-100">
                                <tr>
                                    <th className="px-8 py-5">Applicant</th>
                                    <th className="px-8 py-5">Target Grade</th>
                                    <th className="px-8 py-5">Pipeline Stage</th>
                                    <th className="px-8 py-5">Guardian</th>
                                    <th className="px-8 py-5">Priority</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredApplicants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center">
                                                    <Search className="h-8 w-8 text-zinc-200" />
                                                </div>
                                                <p className="text-zinc-400 font-bold">No applicants found in this stage.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplicants.map((app) => (
                                        <tr key={app.id} className="group hover:bg-zinc-50/80 transition-all">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-black text-zinc-900 dark:text-zinc-50 text-base">{app.studentName}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{app.studentAge} years old</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">
                                                    {app.enrolledGrade || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={app.stage || "INQUIRY"}
                                                    onChange={(e) => handleStageUpdate(app.id, e.target.value)}
                                                    disabled={!canEdit}
                                                    className={cn(
                                                        "rounded-full px-4 py-1.5 text-[10px] font-black tracking-wider uppercase border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                                                        STAGES.find(s => s.id === app.stage)?.color
                                                    )}
                                                >
                                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-zinc-700 dark:text-zinc-300">{app.parentName}</p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">{app.parentPhone || app.parentEmail || "No contact"}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                                    app.priority === "HIGH" ? "bg-red-50 text-red-600" : app.priority === "MEDIUM" ? "bg-orange-50 text-orange-600" : "bg-zinc-50 text-zinc-400"
                                                )}>
                                                    {app.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/s/${slug}/admissions/${app.id}`}
                                                        className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(app.id, app.studentName)}
                                                            className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all"
                                                            title="Delete Inquiry"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
