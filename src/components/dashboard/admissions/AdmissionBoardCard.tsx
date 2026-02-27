"use client";

import { cn } from "@/lib/utils";
import {
    Phone,
    MessageCircle,
    Eye,
    User,
    Baby,
    Sparkles,
    Calendar,
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { LeadScoreChip, RiskAlertBadge } from "../ai/AIComponents";
import { LeadStatusBadge } from "../leads/LeadComponents";
import { useAI } from "@/context/AIContext";
import { useEffect } from "react";

interface AdmissionBoardCardProps {
    admission: any;
    slug: string;
}

export function AdmissionBoardCard({ admission, slug }: AdmissionBoardCardProps) {
    const { getRisks, fetchLeadIntelligence, leadIntelligence } = useAI();
    const risks = getRisks(admission.id);
    const intelligence = leadIntelligence[admission.id];

    useEffect(() => {
        if (!intelligence) {
            fetchLeadIntelligence(slug, admission.id);
        }
    }, [slug, admission.id, intelligence, fetchLeadIntelligence]);

    return (
        <div className="group relative bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand/20 transition-all cursor-grab active:cursor-grabbing">
            {/* AI Indicators */}
            <div className="flex items-center justify-between mb-3">
                <LeadScoreChip score={intelligence?.propensity ?? admission.score ?? 50} size="sm" />
                <div className="flex gap-1">
                    {risks.length > 0 && (
                        <RiskAlertBadge
                            risk={risks[0]}
                        />
                    )}
                    <button
                        className="h-6 w-6 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-400"
                        title="Options"
                    >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div>
                    <h4 className="font-black text-zinc-900 text-sm truncate uppercase tracking-tight">
                        {admission.studentName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Baby className="h-3 w-3 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                            {admission.enrolledGrade || "Grade N/A"} • {admission.studentAge} yrs
                        </span>
                    </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Guardian</span>
                        <span className="text-[9px] font-black text-zinc-900 uppercase tracking-widest truncate max-w-[100px]">{admission.parentName}</span>
                    </div>
                    {admission.lastMeaningfulActionAt && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-zinc-400">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>Last active: {new Date(admission.lastMeaningfulActionAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                {/* Status & Priority */}
                <div className="flex items-center justify-between pt-2">
                    <LeadStatusBadge status={admission.marketingStatus || 'NEW'} className="scale-90 origin-left" />
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        admission.priority === "HIGH" ? "bg-red-50 text-red-600" : admission.priority === "MEDIUM" ? "bg-orange-50 text-orange-600" : "bg-zinc-50 text-zinc-400"
                    )}>
                        {admission.priority}
                    </span>
                </div>
            </div>

            {/* Quick Actions overlay on hover */}
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                    href={`/s/${slug}/admissions/${admission.id}`}
                    className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                    title="View Full Profile"
                >
                    <Eye className="h-4 w-4" />
                </Link>
                <button
                    className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-green-500/20"
                    title="WhatsApp Message"
                >
                    <MessageCircle className="h-4 w-4" />
                </button>
                <button
                    className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-brand/20"
                    title="Call Parent"
                >
                    <Phone className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
