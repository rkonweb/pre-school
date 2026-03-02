"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Briefcase,
    Calendar,
    ChevronRight,
    Search,
    UserPlus,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Mail,
    Phone,
    FileText,
    Linkedin,
    MoreHorizontal,
    Star,
    Sparkles,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

// Actions
import { getJobPostingsAction, updateApplicationStatusAction } from "@/app/actions/hr-actions";

type ApplicationStatus = "PENDING" | "SCREENING" | "INTERVIEWING" | "OFFERED" | "HIRED" | "REJECTED";

const columns: { id: ApplicationStatus; title: string; color: string; bg: string; icon: any }[] = [
    { id: "PENDING", title: "New Inbox", color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", icon: Clock },
    { id: "SCREENING", title: "AI Screening", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/10", icon: Sparkles },
    { id: "INTERVIEWING", title: "Interviewing", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/10", icon: Briefcase },
    { id: "OFFERED", title: "Offer Extended", color: "text-brand", bg: "bg-brand/10 dark:bg-brand/20", icon: Star },
    { id: "HIRED", title: "Hired", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/10", icon: CheckCircle2 },
    { id: "REJECTED", title: "Rejected", color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-500/10", icon: XCircle }
];

export default function RecruitmentBoardPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [postings, setPostings] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const res = await getJobPostingsAction();
        if (res.success) {
            setPostings(res.data || []);
        } else {
            toast.error(res.error || "Failed to load recruitment data");
        }
        setIsLoading(false);
    }

    async function handleStatusChange(appId: string, newStatus: ApplicationStatus) {
        // Optimistic update
        setPostings(prev => prev.map(job => ({
            ...job,
            JobApplication: job.JobApplication.map((app: any) =>
                app.id === appId ? { ...app, status: newStatus } : app
            )
        })));

        const res = await updateApplicationStatusAction(appId, newStatus, slug);
        if (res.success) {
            toast.success("Applicant stage updated");
        } else {
            toast.error("Failed to move applicant");
            loadData(); // Revert
        }
    }

    // Flatten all applications matching filters
    const allApps = postings
        .filter(p => selectedJob === "ALL" || p.id === selectedJob)
        .flatMap(p => p.JobApplication.map((app: any) => ({ ...app, jobTitle: p.title })))
        .filter(app => `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    // Kanban Drag & Drop State (Simulated via drop targets)
    const [draggedApp, setDraggedApp] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedApp(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, status: ApplicationStatus) => {
        e.preventDefault();
        if (draggedApp) {
            const app = allApps.find(a => a.id === draggedApp);
            if (app && app.status !== status) {
                handleStatusChange(draggedApp, status);
            }
            setDraggedApp(null);
        }
    };

    return (
        <div className="p-8 h-[calc(100vh-2rem)] flex flex-col space-y-8 animate-in fade-in duration-700 max-w-[1800px] mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between shrink-0">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        Active <span className="text-brand">Recruitment</span>
                        <div className="h-2 w-2 rounded-full bg-brand animate-pulse hidden md:block" />
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Applicant Tracking System (ATS) pipeline and pipeline management.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-brand transition-colors" />
                        <input
                            type="text"
                            placeholder="Search talent pool..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all w-full md:w-64 shadow-inner"
                        />
                    </div>

                    <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm ring-4 ring-zinc-500/5">
                        <Filter className="h-4 w-4 text-zinc-400 ml-3 mr-2 hidden lg:block" />
                        <select
                            value={selectedJob}
                            title="Filter by Job Role"
                            onChange={(e) => setSelectedJob(e.target.value)}
                            className="bg-transparent text-[11px] font-black uppercase tracking-widest px-3 py-2 pr-8 focus:outline-none appearance-none cursor-pointer text-zinc-600 dark:text-zinc-300"
                        >
                            <option value="ALL">All Active Roles</option>
                            {postings.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <Link href={`/s/${slug}/hr/recruitment/new`} className="bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-zinc-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-95">
                        <UserPlus className="h-4 w-4" />
                        New Posting
                    </Link>
                </div>
            </div>

            {/* Kanban Board Area */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex gap-6 h-full min-w-max px-1">
                        {columns.map(col => {
                            const columnApps = allApps.filter(a => a.status === col.id);
                            const Icon = col.icon;
                            return (
                                <div
                                    key={col.id}
                                    className="w-[360px] h-full flex flex-col bg-zinc-50//50 dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    {/* Column Header */}
                                    <div className="p-6 shrink-0 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shadow-inner", col.bg, col.color)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
                                                {col.title}
                                            </h3>
                                        </div>
                                        <div className="h-6 min-w-[24px] px-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-sm">
                                            {columnApps.length}
                                        </div>
                                    </div>

                                    {/* Cards Container */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {columnApps.length === 0 && (
                                            <div className="h-32 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                Drop here
                                            </div>
                                        )}
                                        {columnApps.map(app => (
                                            <div
                                                key={app.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, app.id)}
                                                className="bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative"
                                            >
                                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    <button className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-zinc-500 font-black italic text-lg border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner">
                                                        {app.firstName[0]}{app.lastName[0]}
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50 leading-none">{app.firstName} {app.lastName}</h4>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand mt-1.5 truncate max-w-[180px]">
                                                            {app.jobTitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                                        <span className="truncate">{app.email}</span>
                                                    </div>
                                                    {app.phone && (
                                                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                                            <span>{app.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {app.resumeUrl && (
                                                            <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-brand hover:bg-brand/10 transition-colors border border-zinc-200 dark:border-zinc-800" title="View Resume">
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {app.linkedin && (
                                                            <a href={app.linkedin} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors border border-zinc-200 dark:border-zinc-800" title="LinkedIn Profile">
                                                                <Linkedin className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                        {format(new Date(app.createdAt), "MMM dd")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
