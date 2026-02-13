"use client";

import { useEffect, useState } from "react";
import { getStaffClassAccessAction, updateStaffClassAccessBulkAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import { Lock, Unlock, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffClassAccessProps {
    staffId: string;
    classrooms: any[]; // Assuming standard shape
}

export function StaffClassAccess({ staffId, classrooms }: StaffClassAccessProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadAccess();
    }, [staffId]);

    async function loadAccess() {
        try {
            const res = await getStaffClassAccessAction(staffId);
            if (res.success && res.access) {
                const map: Record<string, boolean> = {};
                res.access.forEach((a: any) => {
                    map[a.classroomId] = true;
                });
                setAccessMap(map);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load class access");
        } finally {
            setIsLoading(false);
        }
    }

    const toggleAccess = (classId: string) => {
        setAccessMap(prev => ({
            ...prev,
            [classId]: !prev[classId]
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateStaffClassAccessBulkAction(staffId, accessMap);
            if (res.success) {
                toast.success("Access permissions updated");
            } else {
                toast.error(res.error || "Failed to update permissions");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Class Access Control</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Specify which classes this staff member can access.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-sm text-zinc-500">Loading access permissions...</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {classrooms.map((classroom) => {
                        const hasAccess = accessMap[classroom.id] || false;
                        return (
                            <div
                                key={classroom.id}
                                onClick={() => toggleAccess(classroom.id)}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 py-4 transition-all flex items-center justify-between",
                                    hasAccess
                                        ? "border-brand/20 bg-brand/5 dark:border-brand/30 dark:bg-brand/10"
                                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                        hasAccess ? "bg-brand/10 text-brand" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                                    )}>
                                        {hasAccess ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className={cn("text-sm font-medium", hasAccess ? "text-brand" : "text-zinc-700 dark:text-zinc-300")}>
                                            {classroom.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {classroom._count?.students || 0} Students
                                        </p>
                                    </div>
                                </div>
                                {hasAccess && (
                                    <div className="text-brand">
                                        <Check className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {classrooms.length === 0 && (
                        <div className="col-span-full py-8 text-center text-sm text-zinc-500">
                            No classes available to assign.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
