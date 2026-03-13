"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Save, Check } from "lucide-react";
import { toast } from "sonner";
import {
    getUserModulePermissionsAction,
    updateUserModulePermissionsAction,
    assignRoleToUserAction,
    UserModulePermission
} from "@/app/actions/role-actions";
import { cn } from "@/lib/utils";

interface StaffRolePermissionsProps {
    staffId: string;
    schoolSlug: string;
    roles: { id: string; name: string; permissions: string }[];
    initialRoleId?: string | null;
}

const CRUD_PERMISSIONS = [
    { key: "view",   label: "View",   desc: "Can read & view data" },
    { key: "create", label: "Create", desc: "Can add new records" },
    { key: "edit",   label: "Edit",   desc: "Can update records" },
    { key: "delete", label: "Delete", desc: "Can remove records" },
    { key: "manage", label: "Manage", desc: "Full control & settings" },
] as const;
type CrudKey = typeof CRUD_PERMISSIONS[number]["key"];

const GLOBAL_PERM_KEY = "__global__";

export function StaffRolePermissions({ staffId, schoolSlug, roles, initialRoleId }: StaffRolePermissionsProps) {
    const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId || "none");
    const [globalPerm, setGlobalPerm] = useState<Record<CrudKey, boolean>>({
        view: false, create: false, edit: false, delete: false, manage: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const selectedRole = roles.find(r => r.id === selectedRoleId);

    const loadPermissions = useCallback(async () => {
        const res = await getUserModulePermissionsAction(staffId);
        if (res.success && res.permissions) {
            const saved = res.permissions[GLOBAL_PERM_KEY] as UserModulePermission | undefined;
            if (saved) {
                setGlobalPerm({
                    view:   !!saved.view,
                    create: !!saved.create,
                    edit:   !!saved.edit,
                    delete: !!saved.delete,
                    manage: !!saved.manage,
                });
            } else {
                setGlobalPerm({ view: false, create: false, edit: false, delete: false, manage: false });
            }
        }
        setHasChanges(false);
    }, [staffId]);

    useEffect(() => { loadPermissions(); }, [loadPermissions]);

    const handleRoleChange = async (roleId: string) => {
        setSelectedRoleId(roleId);
        const res = await assignRoleToUserAction(schoolSlug, staffId, roleId === "none" ? null : roleId);
        if (res.success) toast.success("Role assigned");
        else toast.error(res.error || "Failed to assign role");
    };

    const togglePerm = (key: CrudKey) => {
        setGlobalPerm(prev => {
            const next = { ...prev, [key]: !prev[key] };
            // Auto-enable view if any other permission is enabled
            if (key !== "view" && next[key]) next.view = true;
            return next;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const permRecord: Record<string, UserModulePermission> = {
            [GLOBAL_PERM_KEY]: {
                module: GLOBAL_PERM_KEY,
                ...globalPerm
            }
        };
        const res = await updateUserModulePermissionsAction(schoolSlug, staffId, permRecord);
        if (res.success) {
            toast.success("Permissions saved");
            setHasChanges(false);
        } else {
            toast.error(res.error || "Failed to save");
        }
        setIsSaving(false);
    };

    const enabledCount = Object.values(globalPerm).filter(Boolean).length;

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Roles & Permissions</h2>
                        <p className="text-xs text-zinc-500">Assign a role and set their access level</p>
                    </div>
                </div>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-[var(--secondary-color)] rounded-lg hover:brightness-110 font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
                    >
                        {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save</>}
                    </button>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Role Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assigned Role</label>
                    <select
                        value={selectedRoleId}
                        onChange={e => handleRoleChange(e.target.value)}
                        title="Assign role"
                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand outline-none transition-all text-sm font-medium"
                    >
                        <option value="none">No Role Assigned</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>

                {/* CRUD Permissions — shown only when a role is selected */}
                {selectedRole && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                    Access Level for <span className="text-brand">{selectedRole.name}</span>
                                </p>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    {enabledCount === 0 ? "No access granted" : `${enabledCount} permission${enabledCount > 1 ? "s" : ""} enabled`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {CRUD_PERMISSIONS.map(({ key, label, desc }) => {
                                const enabled = globalPerm[key];
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => togglePerm(key)}
                                        title={desc}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                                            enabled
                                                ? "bg-brand/10 border-brand text-brand"
                                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                                            enabled ? "bg-brand text-white shadow-sm shadow-brand/30" : "bg-zinc-100 dark:bg-zinc-800"
                                        )}>
                                            {enabled
                                                ? <Check className="h-4 w-4" />
                                                : <span className="text-[10px] font-bold text-zinc-400">{label[0]}</span>
                                            }
                                        </div>
                                        <span className={cn("text-xs font-bold uppercase tracking-wide", enabled ? "text-brand" : "text-zinc-400")}>
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {hasChanges && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-brand text-[var(--secondary-color)] rounded-lg hover:brightness-110 font-semibold text-sm transition-colors shadow-sm shadow-brand/20 disabled:opacity-70"
                                >
                                    {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Permissions</>}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
