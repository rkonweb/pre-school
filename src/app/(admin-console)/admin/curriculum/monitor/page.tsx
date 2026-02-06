"use client";

import { useState } from "react";
import {
    Globe,
    ShieldAlert,
    Search,
    Filter,
    ChevronRight,
    MoreVertical,
    Lock,
    Unlock,
    Eye,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";

interface SchoolUsage {
    id: string;
    schoolName: string;
    location: string;
    activeWorksheets: number;
    totalPrints: number;
    lastSync: string;
    isLocked: boolean;
}

const MOCK_SCHOOLS: SchoolUsage[] = [
    { id: "S1", schoolName: "Bright Beginnings - Central", location: "New York, NY", activeWorksheets: 12, totalPrints: 1450, lastSync: "5 mins ago", isLocked: true },
    { id: "S2", schoolName: "Little Stars Academy", location: "London, UK", activeWorksheets: 8, totalPrints: 890, lastSync: "12 mins ago", isLocked: true },
    { id: "S3", schoolName: "KinderCare South", location: "Austin, TX", activeWorksheets: 15, totalPrints: 2100, lastSync: "Just now", isLocked: false },
    { id: "S4", schoolName: "Panda Preschool", location: "Singapore", activeWorksheets: 5, totalPrints: 420, lastSync: "1 hour ago", isLocked: true },
];

export default function SuperAdminWorksheetsPage() {
    const [schools, setSchools] = useState(MOCK_SCHOOLS);

    const toggleOverride = (id: string) => {
        setSchools(prev => prev.map(s =>
            s.id === id ? { ...s, isLocked: !s.isLocked } : s
        ));
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                        <Globe className="h-8 w-8 text-blue-600" />
                        Global Curriculum Monitor
                    </h2>
                    <p className="text-zinc-500">Super Admin visibility into worksheet usage and security overrides.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
                        <Activity className="h-4 w-4" />
                        Live Network Map
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Active Schools" value="482" icon={Globe} color="blue" />
                <StatCard title="Live Worksheets" value="1,240" icon={ShieldAlert} color="orange" />
                <StatCard title="Total Prints (24h)" value="15.4k" icon={ChevronRight} color="green" />
                <StatCard title="Active Overrides" value="12" icon={Unlock} color="purple" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Member Schools Activity</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search school or ID..."
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>
                        <button className="rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
                            <Filter className="h-4 w-4 text-zinc-500" />
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/50">
                                <th className="px-6 py-4 font-bold">School Details</th>
                                <th className="px-6 py-4 font-bold">Usage Status</th>
                                <th className="px-6 py-4 font-bold">Security Lock</th>
                                <th className="px-6 py-4 font-bold">Last Sync</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                            {schools.map((school) => (
                                <tr key={school.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-50">{school.schoolName}</div>
                                        <div className="text-xs text-zinc-500">{school.location}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 uppercase">Live Docs</p>
                                                <p className="font-bold">{school.activeWorksheets}</p>
                                            </div>
                                            <div className="h-8 w-px bg-zinc-100 dark:bg-zinc-800" />
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 uppercase">Prints</p>
                                                <p className="font-bold">{school.totalPrints.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleOverride(school.id)}
                                            className={cn(
                                                "flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                                                school.isLocked
                                                    ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-600/30"
                                            )}
                                        >
                                            {school.isLocked ? (
                                                <><Lock className="h-3 w-3" /> System Lock Active</>
                                            ) : (
                                                <><Unlock className="h-3 w-3" /> Override Enabled</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-500">
                                        {school.lastSync}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
