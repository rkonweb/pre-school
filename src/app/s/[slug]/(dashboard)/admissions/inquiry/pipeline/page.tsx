"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Phone,
    MessageCircle,
    MoreVertical,
    Plus,
    Loader2,
    ChevronLeft,
    LayoutGrid,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadsAction, updateLeadAction } from "@/app/actions/lead-actions";
import { LeadStatusBadge, LEAD_STATUSES } from "@/components/dashboard/leads/LeadComponents";
import { LeadScoreChip, RiskAlertBadge } from "@/components/dashboard/ai/AIComponents";
import { AIProvider, useAI } from "@/context/AIContext";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PipelinePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [leads, setLeads] = useState<any[]>([]);

    useEffect(() => {
        loadLeads();
    }, [slug]);

    async function loadLeads() {
        setIsLoading(true);
        const res = await getLeadsAction(slug);
        if (res.success) setLeads(res.leads || []);
        setIsLoading(false);
    }

    async function updateLeadStatus(leadId: string, newStatus: string) {
        const res = await updateLeadAction(slug, leadId, { status: newStatus });
        if (res.success) {
            loadLeads();
        } else {
            alert(res.error || "Failed to update status");
        }
    }

    const columns = [
        { id: "NEW", label: "New Leads" },
        { id: "CONTACTED", label: "Contacted" },
        { id: "INTERESTED", label: "Interested" },
        { id: "TOUR_SCHEDULED", label: "Tour Scheduled" },
        { id: "ENROLLED", label: "Enrolled" },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <AIProvider>
            <div className="flex flex-col gap-6 h-screen max-h-[calc(100vh-120px)] overflow-hidden">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                                Pipeline
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/s/${slug}/admissions/new`}
                            className="h-10 px-4 bg-brand text-[var(--secondary-color)] rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand/20 transition-all hover:scale-[1.02]"
                        >
                            <Plus className="h-4 w-4" />
                            New Enquiry
                        </Link>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 flex gap-6 overflow-x-auto pb-6 no-scrollbar h-full px-2">
                    {columns.map(column => {
                        const columnLeads = leads.filter(l => l.status === column.id);
                        return (
                            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4 h-full">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{column.label}</h3>
                                        <span className="text-[10px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full font-black">
                                            {columnLeads.length}
                                        </span>
                                    </div>
                                    <button className="p-1 hover:bg-zinc-100 rounded-md">
                                        <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
                                    </button>
                                </div>

                                <div className="flex-1 bg-zinc-50/50 rounded-[40px] p-3 border border-zinc-100 overflow-y-auto no-scrollbar flex flex-col gap-3">
                                    <PipelineColumnContent leads={columnLeads} updateLeadStatus={updateLeadStatus} slug={slug} columns={columns} columnId={column.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AIProvider>
    );
}

function PipelineColumnContent({ leads, updateLeadStatus, slug, columns, columnId }: any) {
    const { getNBA, getRisks } = useAI();

    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-200 opacity-50">
                <LayoutGrid className="h-8 w-8 mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest">No leads</p>
            </div>
        );
    }

    return (
        <>
            {leads.map((lead: any) => {
                const score = lead.score || 50; // Default to 50 if missing
                const nba = getNBA(lead.id);
                const risks = getRisks(lead.id);

                return (
                    <div key={lead.id} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-2">
                                <LeadScoreChip score={score} size="sm" />
                                {risks.map((r: any, i: number) => <RiskAlertBadge key={i} risk={r} />)}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-zinc-300 hover:text-zinc-600">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-2xl shadow-xl border-zinc-100">
                                    <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pointer-events-none opacity-50">Move to Stage</DropdownMenuItem>
                                    {columns.filter((c: any) => c.id !== columnId).map((c: any) => (
                                        <DropdownMenuItem
                                            key={c.id}
                                            className="text-xs font-bold rounded-xl"
                                            onClick={() => updateLeadStatus(lead.id, c.id)}
                                        >
                                            {c.label}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem asChild>
                                        <Link href={`/s/${slug}/admissions/inquiry/${lead.id}`} className="text-xs font-bold rounded-xl text-brand hover:bg-brand/5">View Details</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Link href={`/s/${slug}/admissions/inquiry/${lead.id}`} className="block mb-4 group-hover:translate-x-1 transition-transform">
                            <p className="font-black text-zinc-900 leading-none mb-1">{lead.parentName}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lead.childName}</p>
                        </Link>

                        {/* AI Mini NBA */}
                        <div className="mb-4">
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-brand tracking-widest mb-1.5 opacity-80">
                                <Sparkles className="h-2.5 w-2.5" /> Recommended
                            </div>
                            <p className="text-xs font-bold text-zinc-700 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                {nba.label}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                            <div className="flex items-center gap-1.5">
                                <div className="h-6 w-6 rounded-lg bg-zinc-100 flex items-center justify-center text-[8px] font-black uppercase text-zinc-400">
                                    {lead.source?.[0] || 'D'}
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{lead.source || 'Direct'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:scale-110 transition-all">
                                    <Phone className="h-3 w-3" />
                                </button>
                                <button className="h-7 w-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:scale-110 transition-all">
                                    <MessageCircle className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}
