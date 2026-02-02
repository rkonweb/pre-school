"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSuperAdminDashboardDataAction } from "@/app/actions/admin-dashboard-actions";
import { toast } from "sonner";

// Define Types
type DashboardStats = {
    totalTenants: number;
    totalStudents: number;
    monthlyRevenue: number;
    systemIncidents: number;
};

type RecentSchool = {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    studentCount: number;
    brandColor: string;
    status: string;
};

interface SuperAdminContextType {
    stats: DashboardStats | null;
    recentSchools: RecentSchool[];
    isLoading: boolean;
    refreshData: () => Promise<void>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentSchools, setRecentSchools] = useState<RecentSchool[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            // setIsLoading(true); // Don't reset loading on refresh to avoid flicker, usually
            const res = await getSuperAdminDashboardDataAction();
            if (res.success && res.stats) {
                setStats(res.stats);
                setRecentSchools(res.recentSchools || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <SuperAdminContext.Provider value={{ stats, recentSchools, isLoading, refreshData: fetchData }}>
            {children}
        </SuperAdminContext.Provider>
    );
}

export function useSuperAdminData() {
    const context = useContext(SuperAdminContext);
    if (!context) throw new Error("useSuperAdminData must be used within SuperAdminProvider");
    return context;
}
