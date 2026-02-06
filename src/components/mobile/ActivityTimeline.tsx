"use client";

import React from "react";
import { ActivityCard, ActivityType } from "./ActivityCard";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";

interface Activity {
    id: string;
    type: ActivityType;
    category?: string;
    title: string;
    content?: string;
    timestamp: string | Date;
    author?: string;
    attachments?: string[];
    metadata?: any;
}

interface ActivityTimelineProps {
    activities: Activity[];
    loading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    activities,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-24 bg-slate-100 rounded-3xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Group activities by date
    const grouped = activities.reduce((acc: Record<string, Activity[]>, activity) => {
        const dateKey = format(new Date(activity.timestamp), "yyyy-MM-dd");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(activity);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const getDateLabel = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isToday(d)) return "Today";
        if (isYesterday(d)) return "Yesterday";
        return format(d, "EEEE, MMMM do");
    };

    return (
        <div className="relative min-h-[500px] w-full max-w-md mx-auto px-6 py-6 pb-32">

            {sortedDates.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl text-slate-300">📅</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No activities yet</h3>
                    <p className="text-slate-500 text-sm mt-2 px-10">
                        We haven't recorded any updates for this period.
                    </p>
                </div>
            )}

            {sortedDates.map((dateStr) => (
                <div key={dateStr} className="mb-8 last:mb-0">
                    <div className="sticky top-0 z-20 py-4 mb-2 flex bg-white/5 backdrop-blur-sm -mx-2 px-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
                            {getDateLabel(dateStr)}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {grouped[dateStr].map((activity, idx) => (
                            <ActivityCard
                                key={activity.id}
                                {...activity}
                                index={idx}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
