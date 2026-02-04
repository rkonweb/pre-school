"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getParentDashboardDataAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";

interface ParentContextType {
    school: any;
    parentProfile: any;
    students: any[];
    studentStats: Record<string, any>;
    conversations: any[];
    unreadMessages: number;
    isLoading: boolean;
    refreshData: () => Promise<void>;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export function ParentProvider({
    children,
    slug,
    phone
}: {
    children: React.ReactNode;
    slug: string;
    phone: string;
}) {
    const [school, setSchool] = useState<any>(null);
    const [parentProfile, setParentProfile] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [studentStats, setStudentStats] = useState<Record<string, any>>({});
    const [conversations, setConversations] = useState<any[]>([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!phone || !slug) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const res = await getParentDashboardDataAction(slug, phone);

            if (res.success) {
                setSchool(res.school);
                setParentProfile(res.profile);
                setStudents(res.students || []);
                setConversations(res.conversations || []);
                setUnreadMessages(res.unreadMessages || 0);

                // Map stats
                const statsMap: Record<string, any> = {};
                (res.students || []).forEach((s: any) => {
                    statsMap[s.id] = s.stats;
                });
                setStudentStats(statsMap);
            }
        } catch (error) {
            console.error("ParentProvider Fetch Error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, [slug, phone]);

    // Initial Fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ParentContext.Provider value={{
            school,
            parentProfile,
            students,
            studentStats,
            conversations,
            unreadMessages,
            isLoading,
            refreshData: fetchData
        }}>
            {children}
        </ParentContext.Provider>
    );
}

export function useParentData() {
    const context = useContext(ParentContext);
    if (context === undefined) {
        throw new Error("useParentData must be used within a ParentProvider");
    }
    return context;
}
