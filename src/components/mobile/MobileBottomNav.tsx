"use client";

import React from "react";
import Link from "next/link";
import {
    Home,
    MessageSquare,
    Activity,
    User,
    Bus,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    slug: string;
    activeTab: "HOME" | "ACTIVITY" | "CHAT" | "PROFILE";
    preview?: boolean;
}

export const MobileBottomNav = ({
    slug,
    activeTab,
    preview = false
}: MobileBottomNavProps) => {
    const previewQuery = preview ? "?preview=true" : "";

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 pointer-events-none z-50">
            <div className="bg-summer-navy rounded-[32px] p-2 flex justify-between items-center shadow-2xl pointer-events-auto border border-white/10 backdrop-blur-md">
                <Link
                    href={`/${slug}/parent/mobile/dashboard${previewQuery}`}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all",
                        activeTab === "HOME" ? "scale-110" : "opacity-40"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        activeTab === "HOME" ? "bg-summer-teal text-white shadow-lg shadow-teal-500/20" : "text-white"
                    )}>
                        <Home className="w-6 h-6" />
                    </div>
                </Link>

                <Link
                    href={`/${slug}/parent/mobile/activity${previewQuery}`}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all",
                        activeTab === "ACTIVITY" ? "scale-110" : "opacity-40"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        activeTab === "ACTIVITY" ? "bg-summer-teal text-white shadow-lg shadow-teal-500/20" : "text-white"
                    )}>
                        <Activity className="w-6 h-6" />
                    </div>
                </Link>

                <Link
                    href={`/${slug}/parent/mobile/chat${previewQuery}`}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all",
                        activeTab === "CHAT" ? "scale-110" : "opacity-40"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        activeTab === "CHAT" ? "bg-summer-teal text-white shadow-lg shadow-teal-500/20" : "text-white"
                    )}>
                        <MessageSquare className="w-6 h-6" />
                    </div>
                </Link>

                <Link
                    href={`/${slug}/parent/mobile/dashboard${previewQuery}`} // Profile tab for later
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all",
                        activeTab === "PROFILE" ? "scale-110" : "opacity-40"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        activeTab === "PROFILE" ? "bg-summer-teal text-white shadow-lg shadow-teal-500/20" : "text-white"
                    )}>
                        <User className="w-6 h-6" />
                    </div>
                </Link>
            </div>
        </div>
    );
};
