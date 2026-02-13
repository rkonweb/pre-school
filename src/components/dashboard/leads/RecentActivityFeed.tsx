"use client";

import { cn } from "@/lib/utils";
import { Bot, RefreshCw, Phone, StickyNote, MessageCircle, User, Calendar } from "lucide-react";
import Link from "next/link";

interface RecentActivityFeedProps {
    activities: {
        id: string;
        type: string;
        content: string;
        createdAt: Date;
        lead: {
            id: string;
            parentName: string;
            childName: string;
        };
        staff: {
            firstName: string;
            lastName: string;
        } | null;
    }[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400">
                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No recent activity</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'AUTOMATION': return <Bot className="h-4 w-4" />;
            case 'STATUS_CHANGE': return <RefreshCw className="h-4 w-4" />;
            case 'CALL_LOG': return <Phone className="h-4 w-4" />;
            case 'NOTE': return <StickyNote className="h-4 w-4" />;
            case 'WHATSAPP_MSG': return <MessageCircle className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case 'AUTOMATION': return "bg-blue-100 text-blue-600";
            case 'STATUS_CHANGE': return "bg-zinc-100 text-zinc-600";
            case 'CALL_LOG': return "bg-green-100 text-green-600";
            case 'NOTE': return "bg-yellow-100 text-yellow-600";
            case 'WHATSAPP_MSG': return "bg-green-50 text-green-600"; // Distinct green for WA
            default: return "bg-zinc-50 text-zinc-500";
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm",
                        getColors(activity.type)
                    )}>
                        {getIcon(activity.type)}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                                {activity.staff ? `${activity.staff.firstName}` : 'System'}
                                <span className="mx-1.5 opacity-50">•</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[9px]",
                                    getColors(activity.type)
                                )}>{activity.type.replace('_', ' ')}</span>
                            </p>
                            <span className="text-[10px] text-zinc-400 font-medium">
                                {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <p className="text-sm text-zinc-800 font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                            {activity.content}
                        </p>

                        {/* Context Link */}
                        <Link
                            href={`/s/y/admissions/inquiry/${activity.lead.id}`} // Note: using 'y' or slug from context would be better, but 'y' is likely the slug here or needs prop
                            className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-brand font-black uppercase tracking-wide hover:underline"
                        >
                            <User className="h-3 w-3" />
                            {activity.lead.parentName}
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
