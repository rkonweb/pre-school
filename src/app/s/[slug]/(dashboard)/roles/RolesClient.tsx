"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    Users,
    Plus,
    Trash2,
    Edit,
    Check,
    X,
    ChevronRight,
    ChevronDown,
    Search,
    Lock,
    Save
} from "lucide-react";
import { toast } from "sonner";
import {
    createRoleAction,
    deleteRoleAction,
    updateRoleAction,
    assignRoleToUserAction,
    getUserClassAccessAction,
    updateClassAccessAction,
    removeClassAccessAction,
    getManagedStaffAction,
    updateManagedStaffAction,
    seedDefaultRolesAction
} from "@/app/actions/role-actions";
import { cn } from "@/lib/utils";
import { MODULES, RolePermission } from "@/lib/permissions-config";

interface RolesClientProps {
    schoolSlug: string;
    initialRoles: any[];
    initialTeachers: any[];
    classrooms: any[];
}

export default function RolesClient({
    schoolSlug,
    initialRoles,
    initialTeachers,
    classrooms
}: RolesClientProps) {
    const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
    const [roles, setRoles] = useState(initialRoles);

    // Role Form State
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [newRolePermissions, setNewRolePermissions] = useState<RolePermission[]>([]);
    const [isSubmittingRole, setIsSubmittingRole] = useState(false);

    const togglePermission = (module: any, action: any) => {
        setNewRolePermissions(prev => {
            const existing = prev.find(p => p.module === module);
            let updatedActions = existing ? [...existing.actions] : [];

            // Helper to remove action
            const remove = (act: any) => {
                updatedActions = updatedActions.filter(a => a !== act);
            };

            // Helper to add action
            const add = (act: any) => {
                if (!updatedActions.includes(act)) updatedActions.push(act);
            };

            // Toggle logic
            if (updatedActions.includes(action)) {
                remove(action);
            } else {
                add(action);
            }

            // Enforce Mutual Exclusivity for Scopes
            // Scopes: View(All)/Manage(All) vs Manage Selected vs Manage Own
            const isScopeAction = ["view", "manage", "manage_own", "manage_selected"].includes(action);

            if (isScopeAction && updatedActions.includes(action)) {
                if (action === "manage_own") {
                    remove("manage_selected");
                    remove("view");
                    remove("manage");
                } else if (action === "manage_selected") {
                    remove("manage_own");
                    remove("view");
                    remove("manage");
                } else if (action === "view") {
                    remove("manage_own");
                    remove("manage_selected");
                    // Manage includes View, so if View is clicked, keep Manage? 
                    // Usually Manage > View. If I click View, I usually want just View.
                    // If I have Manage, I implicitly have View.
                    // But here we are just managing the checkboxes.
                    if (updatedActions.includes("manage")) {
                        // If manage is already there, view is redundant but harmless.
                        // But if we want strict scope:
                        // Keep both if "Manage" implies "View All" + "Edit All".
                        // So "View" and "Manage" can coexist (Manage implies View).
                        // But they definitely conflict with Own/Selected.
                    }
                } else if (action === "manage") {
                    remove("manage_own");
                    remove("manage_selected");
                    add("view"); // Manage usually implies View
                }
            }

            // If actions empty, remove module
            if (updatedActions.length === 0) {
                return prev.filter(p => p.module !== module);
            }

            if (existing) {
                return prev.map(p => p.module === module ? { ...p, actions: updatedActions } : p);
            } else {
                return [...prev, { module, actions: updatedActions }];
            }
        });
    };

    // Permission Management State
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [teacherAccess, setTeacherAccess] = useState<any[]>([]);
    const [isLoadingAccess, setIsLoadingAccess] = useState(false);
    const [accessChanges, setAccessChanges] = useState<Record<string, any>>({}); // Key: classroomId, Value: permissions
    const [isSavingAccess, setIsSavingAccess] = useState(false);

    // Staff Attendance Access State
    const [managedStaff, setManagedStaff] = useState<any[]>([]);
    const [isLoadingStaffAccess, setIsLoadingStaffAccess] = useState(false);
    const [staffAccessChanges, setStaffAccessChanges] = useState<string[]>([]);
    const [isSavingStaffAccess, setIsSavingStaffAccess] = useState(false);

    const router = useRouter();
    const [allTeachers, setAllTeachers] = useState(initialTeachers);

    // Filter
    const [teacherSearch, setTeacherSearch] = useState("");

    const teachers = allTeachers.filter(t =>
        (t.firstName + " " + t.lastName).toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email?.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setIsSubmittingRole(true);

        let res;
        if (editingRoleId) {
            res = await updateRoleAction(schoolSlug, editingRoleId, {
                name: newRoleName,
                description: newRoleDesc,
                permissions: newRolePermissions as any
            });
        } else {
            res = await createRoleAction(schoolSlug, {
                name: newRoleName,
                description: newRoleDesc,
                permissions: newRolePermissions as any
            });
        }

        setIsSubmittingRole(false);

        if (res.success) {
            if (editingRoleId) {
                setRoles(roles.map(r => r.id === editingRoleId ? res.role : r));
                toast.success("Role updated successfully");
            } else {
                setRoles([...roles, res.role]);
                toast.success("Role created successfully");
            }
            setIsCreatingRole(false);
            setEditingRoleId(null);
            setNewRoleName("");
            setNewRoleDesc("");
            setNewRolePermissions([]);
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save role");
        }
    };

    const handleEditRole = (role: any) => {
        setEditingRoleId(role.id);
        setNewRoleName(role.name);
        setNewRoleDesc(role.description || "");

        let existingPerms = [];
        try {
            existingPerms = typeof role.permissions === 'string'
                ? JSON.parse(role.permissions)
                : role.permissions;
        } catch (e) { console.error(e); }

        setNewRolePermissions(existingPerms);
        setIsCreatingRole(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        const res = await deleteRoleAction(schoolSlug, roleId);
        if (res.success) {
            setRoles(roles.filter(r => r.id !== roleId));
            toast.success("Role deleted");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const loadTeacherAccess = async (userId: string) => {
        setIsLoadingAccess(true);
        setSelectedTeacherId(userId);
        setAccessChanges({});
        const res = await getUserClassAccessAction(userId);
        if (res.success) {
            setTeacherAccess(res.access || []);
        }
        setIsLoadingAccess(false);

        // Also load staff attendance access
        await loadStaffAttendanceAccess(userId);
    };

    const loadStaffAttendanceAccess = async (userId: string) => {
        setIsLoadingStaffAccess(true);
        const res = await getManagedStaffAction(userId);
        if (res.success) {
            setManagedStaff(res.managedStaff || []);
            setStaffAccessChanges(res.managedStaff?.map((s: any) => s.staffId) || []);
        }
        setIsLoadingStaffAccess(false);
    };

    const handleAccessChange = (classroomId: string, field: string, value: boolean) => {
        setAccessChanges(prev => {
            const current = prev[classroomId] ||
                teacherAccess.find(a => a.classroomId === classroomId) ||
                { canRead: false, canWrite: false, canEdit: false, canDelete: false };

            const updated = { ...current, [field]: value };

            // Auto-enable READ if others are enabled
            if ((field === 'canWrite' || field === 'canEdit' || field === 'canDelete') && value === true) {
                updated.canRead = true;
            }

            return { ...prev, [classroomId]: updated };
        });
    };

    const saveAccessChanges = async () => {
        if (!selectedTeacherId) return;
        setIsSavingAccess(true);

        const promises = Object.entries(accessChanges).map(async ([classroomId, perms]) => {
            // If all false, could delete, but upsert handles false/false/false/false fine.
            // Ideally we might want to remove entry if ALL are false to keep DB clean, but explicit "No Access" row is also fine.
            // For now, simple upsert.
            return updateClassAccessAction(selectedTeacherId, classroomId, {
                canRead: !!perms.canRead,
                canWrite: !!perms.canWrite,
                canEdit: !!perms.canEdit,
                canDelete: !!perms.canDelete
            });
        });

        await Promise.all(promises);

        // Reload
        await loadTeacherAccess(selectedTeacherId);
        setIsSavingAccess(false);
        toast.success("Permissions updated");
    };

    const saveStaffAccessChanges = async () => {
        if (!selectedTeacherId) return;
        setIsSavingStaffAccess(true);
        const res = await updateManagedStaffAction(selectedTeacherId, staffAccessChanges);
        if (res.success) {
            toast.success("Staff attendance access updated");
            await loadStaffAttendanceAccess(selectedTeacherId);
        } else {
            toast.error(res.error || "Failed to save staff access");
        }
        setIsSavingStaffAccess(false);
    };

    const handleAssignRole = async (userId: string, roleId: string) => {
        const res = await assignRoleToUserAction(schoolSlug, userId, roleId === "none" ? null : roleId);
        if (res.success) {
            toast.success("Role assigned");

            // Optimistic update
            setAllTeachers(prev => prev.map(t =>
                t.id === userId ? { ...t, customRoleId: roleId === "none" ? null : roleId } : t
            ));

            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Roles & Permissions</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage teacher roles and class-level access permissions.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab("roles")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "roles"
                            ? "border-brand text-brand"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    )}
                >
                    Role Management
                </button>
                <button
                    onClick={() => setActiveTab("permissions")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "permissions"
                            ? "border-brand text-brand"
                            : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    )}
                >
                    Teacher Access Maps
                </button>
            </div>

            {activeTab === "roles" && (
                <div className="space-y-4">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={async () => {
                                if (!confirm("Add standard roles? Existing roles with same name will be skipped.")) return;
                                const res = await seedDefaultRolesAction(schoolSlug);
                                if (res.success) {
                                    toast.success(`Done: ${res.created} created, ${res.updated || 0} updated`);
                                    router.refresh();
                                } else {
                                    toast.error(res.error || "Failed to seed roles");
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium text-sm transition-colors border border-zinc-200 dark:border-zinc-700"
                        >
                            <Shield className="h-4 w-4" /> Add Defaults
                        </button>
                        <button
                            onClick={() => {
                                setIsCreatingRole(!isCreatingRole);
                                setEditingRoleId(null);
                                setNewRoleName("");
                                setNewRoleDesc("");
                                setNewRolePermissions([]);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:brightness-110 font-medium text-sm transition-colors shadow-sm shadow-brand/20"
                        >
                            <Plus className="h-4 w-4" /> Create Custom Role
                        </button>
                    </div>

                    {isCreatingRole && (
                        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 shadow-lg">
                            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <h3 className="font-bold text-lg">{editingRoleId ? "Edit Role" : "Create New Role"}</h3>
                                <button onClick={() => setIsCreatingRole(false)} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Role Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role Name</label>
                                    <input
                                        placeholder="e.g. Finance Manager"
                                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand outline-none transition-all"
                                        value={newRoleName}
                                        onChange={e => setNewRoleName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                                    <input
                                        placeholder="Brief description of responsibilities"
                                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand outline-none transition-all"
                                        value={newRoleDesc}
                                        onChange={e => setNewRoleDesc(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Permission Matrix */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-brand" /> Module Permissions
                                </h4>
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                                    <table className="w-full text-sm">
                                        <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Module</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">View</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Create / Add</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Edit</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Delete</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Manage / Exp</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Manage Own</th>
                                                <th className="px-4 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400 w-28">Manage Selected</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                            {(() => {
                                                const renderModuleRow = (module: any, depth = 0) => (
                                                    <Fragment key={module.key}>
                                                        <tr className={cn(
                                                            "transition-colors",
                                                            module.subModules ? "bg-zinc-50 dark:bg-zinc-900/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                                                            depth > 0 && "border-l-4 border-l-transparent hover:border-l-brand"
                                                        )}>
                                                            <td className="px-4 py-2" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
                                                                <div className="flex items-center gap-2">
                                                                    {depth > 0 && <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />}
                                                                    <div>
                                                                        <div className={cn("font-medium", depth === 0 ? "text-zinc-900 dark:text-zinc-200" : "text-sm text-zinc-800 dark:text-zinc-300")}>
                                                                            {module.label}
                                                                        </div>
                                                                        <div className={cn("text-zinc-500", depth === 0 ? "text-xs" : "text-[10px]")}>
                                                                            {module.description}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {[
                                                                { keys: ["view"] },
                                                                { keys: ["create", "send", "mark"] },
                                                                { keys: ["edit", "review"] },
                                                                { keys: ["delete"] },
                                                                { keys: ["manage", "export"] }
                                                            ].map((col, idx) => {
                                                                const validAction = col.keys.find(k => module.permissions.includes(k as any));
                                                                const isUnsupported = !validAction;
                                                                const isChecked = validAction && newRolePermissions.find(p => p.module === module.key)?.actions.includes(validAction as any);

                                                                return (
                                                                    <td key={idx} className={cn("px-4 py-2 text-center", depth > 0 && "bg-zinc-50/50 dark:bg-zinc-900/30")}>
                                                                        {!isUnsupported ? (
                                                                            <div className="flex flex-col items-center justify-center gap-1">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="rounded border-zinc-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                                                                                    checked={!!isChecked}
                                                                                    onChange={() => togglePermission(module.key, validAction)}
                                                                                />
                                                                                {validAction !== "create" && validAction !== "view" && validAction !== "edit" && validAction !== "delete" && validAction !== "manage" && (
                                                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-tighter font-bold">{validAction}</span>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-zinc-200 dark:text-zinc-800 text-xs">-</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className={cn("px-4 py-2 text-center", depth > 0 && "bg-zinc-50/50 dark:bg-zinc-900/30")}>
                                                                {module.permissions.includes("manage_own" as any) ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                                                                        checked={!!newRolePermissions.find(p => p.module === module.key)?.actions.includes("manage_own" as any)}
                                                                        onChange={() => togglePermission(module.key, "manage_own")}
                                                                    />
                                                                ) : <span className="text-zinc-200 dark:text-zinc-800 text-xs">-</span>}
                                                            </td>
                                                            <td className={cn("px-4 py-2 text-center", depth > 0 && "bg-zinc-50/50 dark:bg-zinc-900/30")}>
                                                                {module.permissions.includes("manage_selected" as any) ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                                                                        checked={!!newRolePermissions.find(p => p.module === module.key)?.actions.includes("manage_selected" as any)}
                                                                        onChange={() => togglePermission(module.key, "manage_selected")}
                                                                    />
                                                                ) : <span className="text-zinc-200 dark:text-zinc-800 text-xs">-</span>}
                                                            </td>
                                                        </tr>
                                                        {module.subModules?.map((sub: any) => renderModuleRow(sub, depth + 1))}
                                                    </Fragment>
                                                );
                                                return MODULES.map(m => renderModuleRow(m));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <button
                                    onClick={() => setIsCreatingRole(false)}
                                    className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-brand text-white font-medium rounded-lg hover:brightness-110 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmittingRole ? (
                                        <><span>Saving...</span></>
                                    ) : (
                                        <><span>{editingRoleId ? "Update Role" : "Create Role"}</span> <Check className="h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Role Name</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Users Assigned</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">No custom roles defined yet.</td>
                                    </tr>
                                ) : roles.map((role) => (
                                    <tr key={role.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <td className="px-4 py-3 font-medium">{role.name}</td>
                                        <td className="px-4 py-3 text-zinc-500">{role.description || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                                {role._count?.users || 0} Users
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDeleteRole(role.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete Role"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditRole(role)}
                                                className="text-brand hover:brightness-110 p-1"
                                                title="Edit Role"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "permissions" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Teacher List */}
                    <div className="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex flex-col h-[600px]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800"
                                    placeholder="Search teachers..."
                                    value={teacherSearch}
                                    onChange={e => setTeacherSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {teachers.map(teacher => (
                                <button
                                    key={teacher.id}
                                    onClick={() => loadTeacherAccess(teacher.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                        selectedTeacherId === teacher.id
                                            ? "bg-brand/10 ring-1 ring-brand/20"
                                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {teacher.avatar ? (
                                            <img src={teacher.avatar} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-zinc-500">{teacher.firstName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate">{teacher.firstName} {teacher.lastName}</p>
                                        <p className="text-xs text-zinc-500 truncate">{teacher.email}</p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "ml-auto h-4 w-4 text-zinc-400 transition-transform",
                                        selectedTeacherId === teacher.id ? "rotate-90 text-brand" : ""
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Access Matrix */}
                    <div className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex flex-col h-[600px]">
                        {!selectedTeacherId ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
                                <Users className="h-12 w-12 mb-4 opacity-20" />
                                <p>Select a teacher to configure their class access permissions.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold">Access Control Matrix</h3>
                                            <p className="text-xs text-zinc-500">
                                                Define what {teachers.find(t => t.id === selectedTeacherId)?.firstName} can do in each class.
                                            </p>
                                        </div>
                                        {Object.keys(accessChanges).length > 0 && (
                                            <button
                                                onClick={saveAccessChanges}
                                                disabled={isSavingAccess}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:brightness-110 shadow-sm disabled:opacity-50"
                                            >
                                                {isSavingAccess ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                                            </button>
                                        )}
                                    </div>

                                    {/* Global Role Assignment */}
                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assigned Role</label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="w-full bg-transparent font-medium text-sm outline-none cursor-pointer"
                                                    value={teachers.find(t => t.id === selectedTeacherId)?.customRoleId || "none"}
                                                    onChange={(e) => handleAssignRole(selectedTeacherId!, e.target.value)}
                                                >
                                                    <option value="none">No Specific Role (Restricted Access)</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="h-3 w-3 text-zinc-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {isLoadingAccess ? (
                                        <div className="flex justify-center p-8"><span className="loading loading-spinner">Loading...</span></div>
                                    ) : (
                                        <>
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-900 shadow-sm z-10">
                                                    <tr>
                                                        <th className="text-left px-4 py-3 font-medium">Classroom</th>
                                                        <th className="text-center px-2 py-3 w-20">Read</th>
                                                        <th className="text-center px-2 py-3 w-20">Write</th>
                                                        <th className="text-center px-2 py-3 w-20">Edit</th>
                                                        <th className="text-center px-2 py-3 w-20">Delete</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                                    {classrooms.map(cls => {
                                                        // Merge current saved access with pending changes
                                                        const saved = teacherAccess.find(a => a.classroomId === cls.id);
                                                        const changed = accessChanges[cls.id];
                                                        const current = changed || saved || { canRead: false, canWrite: false, canEdit: false, canDelete: false };
                                                        const hasAccess = current.canRead || current.canWrite || current.canEdit || current.canDelete;

                                                        return (
                                                            <tr key={cls.id} className={cn("hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50", hasAccess && "bg-brand/10")}>
                                                                <td className="px-4 py-3 font-medium">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("w-1 h-8 rounded-full", hasAccess ? "bg-brand" : "bg-zinc-300 dark:bg-zinc-700")} />
                                                                        <span>{cls.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center px-2 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-brand focus:ring-brand h-4 w-4"
                                                                        checked={!!current.canRead}
                                                                        onChange={(e) => handleAccessChange(cls.id, 'canRead', e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td className="text-center px-2 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-green-600 focus:ring-green-500 h-4 w-4"
                                                                        checked={!!current.canWrite}
                                                                        onChange={(e) => handleAccessChange(cls.id, 'canWrite', e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td className="text-center px-2 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                                                                        checked={!!current.canEdit}
                                                                        onChange={(e) => handleAccessChange(cls.id, 'canEdit', e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td className="text-center px-2 py-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-zinc-300 text-red-600 focus:ring-red-500 h-4 w-4"
                                                                        checked={!!current.canDelete}
                                                                        onChange={(e) => handleAccessChange(cls.id, 'canDelete', e.target.checked)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-sm">Staff Attendance Access</h4>
                                                        <p className="text-[10px] text-zinc-500">Enable granular attendance management for specific staff members.</p>
                                                    </div>
                                                    <button
                                                        onClick={saveStaffAccessChanges}
                                                        disabled={isSavingStaffAccess}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
                                                    >
                                                        {isSavingStaffAccess ? "Saving..." : <><Save className="h-3.5 w-3.5" /> Save Staff Mapping</>}
                                                    </button>
                                                </div>

                                                {(() => {
                                                    const teacher = teachers.find(t => t.id === selectedTeacherId);
                                                    let hasPermission = false;
                                                    try {
                                                        const raw = teacher?.customRole?.permissions;
                                                        const perms = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
                                                        hasPermission = !!perms.find((p: any) =>
                                                            p.module === "staff.attendance" &&
                                                            (p.actions.includes("manage_selected") || p.actions.includes("manage") || p.actions.includes("view"))
                                                        );
                                                    } catch (e) { }

                                                    if (!hasPermission) {
                                                        return (
                                                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                                                                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                                                                <div>
                                                                    <span className="font-bold">Permission Required:</span> The assigned role for this user does not have "Manage Selected" (or View/Manage) permission for Attendance. These mappings will be ignored until the permission is granted.
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {initialTeachers.map(staff => (
                                                        <label
                                                            key={staff.id}
                                                            className={cn(
                                                                "flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all",
                                                                staffAccessChanges.includes(staff.id)
                                                                    ? "bg-brand/10 border-brand/20 dark:bg-brand/5 dark:border-brand/30"
                                                                    : "bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-50"
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-zinc-300 text-brand focus:ring-brand h-3.5 w-3.5"
                                                                checked={staffAccessChanges.includes(staff.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setStaffAccessChanges(prev => [...prev, staff.id]);
                                                                    } else {
                                                                        setStaffAccessChanges(prev => prev.filter(id => id !== staff.id));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-xs font-medium truncate">{staff.firstName} {staff.lastName}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
