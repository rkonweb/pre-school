"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Download,
    Phone,
    MessageCircle,
    Calendar,
    Eye,
    MoreVertical,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Users,
    Sparkles,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadsAction } from "@/app/actions/lead-actions";
import { searchLeadsElasticAction } from "@/app/actions/search-actions";
import { SearchInput } from "@/components/ui/SearchInput";
import { LeadStatusBadge } from "@/components/dashboard/leads/LeadComponents";
import { LeadScoreChip, RiskAlertBadge, NextBestActionCard } from "@/components/dashboard/ai/AIComponents";
import { AIProvider, useAI } from "@/context/AIContext";
import Link from "next/link";

export default function LeadListPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [leads, setLeads] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLeads();
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, statusFilter, searchTerm]);

    async function loadLeads() {
        setIsLoading(true);
        let res;
        if (searchTerm && searchTerm.length >= 2) {
            res = await searchLeadsElasticAction(slug, searchTerm, { status: statusFilter });
        } else {
            res = await getLeadsAction(slug, {
                status: statusFilter,
                searchTerm: searchTerm
            });
        }

        if (res.success) setLeads(res.leads || []);
        setIsLoading(false);
    }



    return (
        <AIProvider>
            <div className="flex flex-col gap-6 pb-10">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                                Lead List
                            </h1>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                            {leads.length} total enquiries found
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="h-10 px-4 border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                        <button className="h-10 px-6 bg-zinc-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-all">
                            <Users className="h-4 w-4" />
                            Bulk Assign
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="relative flex-1">
                        <SearchInput
                            onSearch={(term) => setSearchTerm(term)}
                            placeholder="Search by name or mobile (Elasticsearch)..."
                            className="w-full"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-brand"
                    >
                        <option value="all">All Stages</option>
                        <option value="NEW">New Lead</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="TOUR_SCHEDULED">Tour Scheduled</option>
                        <option value="TOUR_COMPLETED">Tour Completed</option>
                    </select>
                    <button className="h-10 w-10 flex items-center justify-center border border-zinc-200 rounded-xl hover:bg-zinc-50">
                        <Filter className="h-4 w-4 text-zinc-500" />
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-zinc-50/50 text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-zinc-100">
                                <tr>
                                    <th className="px-8 py-5">Parent & Child</th>
                                    <th className="px-8 py-5">Score & Risk</th>
                                    <th className="px-8 py-5">AI Insight</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Assigned To</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <LeadTableBody isLoading={isLoading} leads={leads} slug={slug} router={router} />
                        </table>
                    </div>
                </div>
            </div>
        </AIProvider>
    );
}

function LeadTableBody({ isLoading, leads, slug, router }: any) {
    const { getNBA, getRisks, generateMockScore } = useAI();

    return (
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading ? (
                <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto" />
                    </td>
                </tr>
            ) : leads.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                        <p className="text-zinc-400 font-bold">No leads found matching your filters.</p>
                    </td>
                </tr>
            ) : (
                leads.map((lead: any) => {
                    const score = lead.score || generateMockScore();
                    const nba = getNBA(lead.id);
                    const risks = getRisks(lead.id);

                    return (
                        <tr key={lead.id} className="group hover:bg-zinc-50/80 transition-all cursor-pointer" onClick={() => router.push(`/s/${slug}/admissions/inquiry/${lead.id}`)}>
                            <td className="px-8 py-6">
                                <div>
                                    <p className="font-black text-zinc-900 dark:text-zinc-50 text-base">{lead.parentName}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{lead.childName} • {lead.mobile}</p>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex flex-col gap-2 items-start">
                                    <LeadScoreChip score={score} />
                                    {risks.map((r: any, i: number) => <RiskAlertBadge key={i} risk={r} />)}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                                    <span className="text-xs font-bold text-zinc-700">{nba.label}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <LeadStatusBadge status={lead.status} />
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-black uppercase text-zinc-500">
                                        {lead.counsellor?.firstName?.[0] || "U"}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-600">{lead.counsellor?.firstName || "Unassigned"}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                    <button className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                                        <Phone className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="h-8 w-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="h-8 w-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
        </tbody>
    );
}
