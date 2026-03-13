"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    Users,
    Plus,
    Trash2,
    Edit,
    Check,
    X,
    Search,
    Sparkles,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
    createRoleAction,
    deleteRoleAction,
    updateRoleAction,
    assignRoleToUserAction,
    seedDefaultRolesAction,
    generateRolePermissionsAction
} from "@/app/actions/role-actions";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/permissions-config";
import { useConfirm } from "@/contexts/ConfirmContext";

interface RolesClientProps {
    schoolSlug: string;
    initialRoles: any[];
    initialTeachers: any[];
    classrooms: any[];
}

// Flatten all modules (top-level only for toggles)
const ALL_TOP_MODULES = MODULES;

// Toggle switch component
function ToggleSwitch({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label?: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            title={label ? `Toggle ${label}` : "Toggle"}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
                enabled ? "bg-brand" : "bg-zinc-200 dark:bg-zinc-700"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    enabled ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
}

export default function RolesClient({
    schoolSlug,
    initialRoles,
    initialTeachers,
    classrooms
}: RolesClientProps) {
    const { confirm: confirmDialog } = useConfirm();
    const router = useRouter();

    const [roles, setRoles] = useState(initialRoles);
    const [allTeachers] = useState(initialTeachers);

    useEffect(() => {
        setRoles(prev => {
            const serverMap = new Map(initialRoles.map(r => [r.id, r]));
            const merged = [...initialRoles];
            prev.forEach(p => { if (!serverMap.has(p.id)) merged.push(p); });
            return merged;
        });
    }, [initialRoles]);

    // Role Form State
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");

    // enabledModules: Set of module keys that are toggled ON for this role
    const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());

    // Expand / collapse sub-modules in the toggle view
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // AI Generation State
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isSubmittingRole, setIsSubmittingRole] = useState(false);

    // Teacher search
    const [teacherSearch, setTeacherSearch] = useState("");
    const teachers = allTeachers.filter(t =>
        (t.firstName + " " + t.lastName).toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.email?.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const toggleModule = (key: string) => {
        setEnabledModules(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
                // Also disable all children
                ALL_TOP_MODULES.forEach(m => {
                    if (m.key === key && m.subModules) {
                        m.subModules.forEach(sm => {
                            next.delete(sm.key);
                            (sm as any).subModules?.forEach((ssm: any) => next.delete(ssm.key));
                        });
                    }
                });
            } else {
                next.add(key);
                // Enable parent if enabling child
            }
            return next;
        });
    };

    const toggleSubModule = (parentKey: string, childKey: string) => {
        setEnabledModules(prev => {
            const next = new Set(prev);
            if (next.has(childKey)) {
                next.delete(childKey);
            } else {
                next.add(childKey);
                next.add(parentKey); // auto-enable parent
            }
            return next;
        });
    };

    const toggleExpandModule = (key: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    // Parse enabled modules from old permissions format (array of {module, actions}) or new format (array of strings)
    const parseEnabledModules = (permissions: any): Set<string> => {
        if (!permissions) return new Set();
        try {
            const parsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
            if (Array.isArray(parsed)) {
                if (parsed.length === 0) return new Set();
                // New format: string[]
                if (typeof parsed[0] === 'string') return new Set(parsed);
                // Old format: {module, actions}[]
                return new Set(parsed.map((p: any) => p.module));
            }
        } catch (e) {
            console.error("parseEnabledModules error", e);
        }
        return new Set();
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        setIsSubmittingRole(true);

        // Store as array of enabled module keys (simple string array)
        const modulesArray = Array.from(enabledModules);

        let res;
        try {
            if (editingRoleId) {
                res = await updateRoleAction(schoolSlug, editingRoleId, {
                    name: newRoleName,
                    description: newRoleDesc,
                    permissions: modulesArray as any
                });
            } else {
                res = await createRoleAction(schoolSlug, {
                    name: newRoleName,
                    description: newRoleDesc,
                    permissions: modulesArray as any
                });
            }
        } catch (err: any) {
            res = { success: false, error: err.message };
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
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save role");
        }
    };

    const resetForm = () => {
        setIsCreatingRole(false);
        setEditingRoleId(null);
        setNewRoleName("");
        setNewRoleDesc("");
        setEnabledModules(new Set());
        setExpandedModules(new Set());
        setAiPrompt("");
    };

    const handleAutoFillWithAI = async () => {
        if (!aiPrompt.trim()) {
            toast.error("Please describe the role first");
            return;
        }
        setIsGeneratingAI(true);
        try {
            const res = await generateRolePermissionsAction(aiPrompt, schoolSlug);
            if (res.success && res.data) {
                if (!newRoleName) setNewRoleName(res.data.roleNameSuggestion);
                if (!newRoleDesc) setNewRoleDesc(res.data.roleDescriptionSuggestion);

                // Extract enabled module keys from AI permissions
                const keys = new Set<string>(
                    res.data.permissions.map((p: any) => p.module as string)
                );
                setEnabledModules(keys);
                toast.success("Permissions generated! ✨");
            } else {
                toast.error(res.error || "Failed to generate role.");
            }
        } catch (error) {
            toast.error("An error occurred during AI generation.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleEditRole = (role: any) => {
        setEditingRoleId(role.id);
        setNewRoleName(role.name);
        setNewRoleDesc(role.description || "");
        setEnabledModules(parseEnabledModules(role.permissions));
        setIsCreatingRole(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Role",
            message: "Are you sure you want to delete this role?",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });
        if (!confirmed) return;
        const res = await deleteRoleAction(schoolSlug, roleId);
        if (res.success) {
            setRoles(roles.filter(r => r.id !== roleId));
            toast.success("Role deleted");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const enabledCount = enabledModules.size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Roles & Permissions</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                        Define roles with the modules they can access. Configure CRUD permissions per staff member in their profile.
                    </p>
                </div>
            </div>

            {/* Role List Section */}
            <div className="space-y-4">
                <div className="flex justify-end gap-3">
                    <button
                        onClick={async () => {
                            const confirmed = await confirmDialog({
                                title: "Add Standard Roles",
                                message: "Add standard roles? Existing roles with same name will be skipped.",
                                variant: "info",
                                confirmText: "Add Roles",
                                cancelText: "Cancel"
                            });
                            if (!confirmed) return;
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
                            if (isCreatingRole && !editingRoleId) {
                                resetForm();
                            } else {
                                resetForm();
                                setIsCreatingRole(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-[var(--secondary-color)] rounded-lg hover:brightness-110 font-medium text-sm transition-colors shadow-sm shadow-brand/20"
                    >
                        {isCreatingRole && !editingRoleId ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isCreatingRole && !editingRoleId ? "Cancel" : "Create Role"}
                    </button>
                </div>

                {/* Create / Edit Form */}
                {isCreatingRole && (
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 shadow-lg">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <div>
                                <h3 className="font-bold text-lg">{editingRoleId ? "Edit Role" : "Create New Role"}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Toggle which modules this role can access. CRUD permissions are set per user in their staff profile.</p>
                            </div>
                            <button onClick={resetForm} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Role Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role Name</label>
                                <input
                                    placeholder="e.g. Finance Manager"
                                    title="Role Name"
                                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand outline-none transition-all"
                                    value={newRoleName}
                                    onChange={e => setNewRoleName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                                <input
                                    placeholder="Brief description of responsibilities"
                                    title="Role Description"
                                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-brand outline-none transition-all"
                                    value={newRoleDesc}
                                    onChange={e => setNewRoleDesc(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* AI Role Generator */}
                        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-brand flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> AI Auto-Fill
                                    </h4>
                                    <p className="text-xs text-brand/70">Describe the role and let AI configure access automatically.</p>
                                </div>
                                <button
                                    onClick={handleAutoFillWithAI}
                                    disabled={isGeneratingAI || !aiPrompt.trim()}
                                    title="Generate permissions with AI"
                                    className="px-4 py-2 bg-brand text-[var(--secondary-color)] text-sm font-medium rounded-lg hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg" />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <><span>Generate</span></>
                                    )}
                                </button>
                            </div>
                            <textarea
                                placeholder="e.g. A librarian who manages books and views student profiles but cannot access billing."
                                title="AI prompt for role generation"
                                className="w-full border border-brand/20 rounded-lg px-3 py-2 bg-white/80 dark:bg-zinc-950/80 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-sm resize-none"
                                rows={2}
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        e.preventDefault();
                                        handleAutoFillWithAI();
                                    }
                                }}
                            />
                        </div>

                        {/* Module Toggles */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-brand" /> Module Access
                                    <span className="ml-2 text-xs font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                        {enabledCount} enabled
                                    </span>
                                </h4>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEnabledModules(new Set(
                                            ALL_TOP_MODULES.flatMap(m => [
                                                m.key,
                                                ...(m.subModules?.flatMap(sm => [sm.key, ...((sm as any).subModules?.map((ssm: any) => ssm.key) || [])]) || [])
                                            ])
                                        ))}
                                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                                    >
                                        Enable All
                                    </button>
                                    <span className="text-zinc-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setEnabledModules(new Set())}
                                        className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600 uppercase"
                                    >
                                        Disable All
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {ALL_TOP_MODULES.map(mod => {
                                    const isEnabled = enabledModules.has(mod.key);
                                    const hasSubModules = mod.subModules && mod.subModules.length > 0;
                                    const isExpanded = expandedModules.has(mod.key);
                                    const enabledSubCount = mod.subModules?.filter(sm => enabledModules.has(sm.key)).length || 0;

                                    return (
                                        <div
                                            key={mod.key}
                                            className={cn(
                                                "rounded-xl border transition-all duration-200",
                                                isEnabled
                                                    ? "bg-brand/5 border-brand/20"
                                                    : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <div className="flex items-center justify-between p-3 gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{mod.label}</div>
                                                    <div className="text-[10px] text-zinc-500 truncate">{mod.description}</div>
                                                    {hasSubModules && isEnabled && (
                                                        <div className="text-[10px] text-brand/70 font-medium mt-0.5">
                                                            {enabledSubCount}/{mod.subModules!.length} sub-modules
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <ToggleSwitch
                                                        enabled={isEnabled}
                                                        onToggle={() => toggleModule(mod.key)}
                                                        label={mod.label}
                                                    />
                                                    {hasSubModules && isEnabled && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpandModule(mod.key)}
                                                            title={isExpanded ? "Collapse sub-modules" : "Expand sub-modules"}
                                                            className="text-zinc-400 hover:text-brand transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sub-module toggles */}
                                            {hasSubModules && isEnabled && isExpanded && (
                                                <div className="border-t border-brand/10 px-3 pt-2 pb-3 space-y-2">
                                                    {mod.subModules!.map(sub => {
                                                        const subEnabled = enabledModules.has(sub.key);
                                                        return (
                                                            <div key={sub.key} className="flex items-center justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={cn("text-xs font-medium truncate", subEnabled ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400")}>{sub.label}</div>
                                                                    <div className="text-[9px] text-zinc-400 truncate">{sub.description}</div>
                                                                </div>
                                                                <ToggleSwitch
                                                                    enabled={subEnabled}
                                                                    onToggle={() => toggleSubModule(mod.key, sub.key)}
                                                                    label={sub.label}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRole}
                                disabled={isSubmittingRole || !newRoleName.trim()}
                                className="px-4 py-2 bg-brand text-[var(--secondary-color)] font-medium rounded-lg hover:brightness-110 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
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

                {/* Role List Table */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Role Name</th>
                                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Description</th>
                                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Modules</th>
                                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Users</th>
                                <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No roles defined yet.</p>
                                        <p className="text-xs mt-1">Create a custom role or click &quot;Add Defaults&quot; to get started.</p>
                                    </td>
                                </tr>
                            ) : roles.map((role) => {
                                const roleModules = parseEnabledModules(role.permissions);
                                const moduleCount = roleModules.size;
                                const previewModules = Array.from(roleModules).slice(0, 3);
                                return (
                                    <tr key={role.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs">{role.description || "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {previewModules.map(key => (
                                                    <span key={key} className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-brand/10 text-brand capitalize">
                                                        {key.split('.').pop()?.replace('-', ' ')}
                                                    </span>
                                                ))}
                                                {moduleCount > 3 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                        +{moduleCount - 3}
                                                    </span>
                                                )}
                                                {moduleCount === 0 && (
                                                    <span className="text-xs text-zinc-400 italic">No modules</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-zinc-400" />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">{role._count?.users || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete Role"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditRole(role)}
                                                    className="text-brand hover:brightness-110 p-1.5 rounded hover:bg-brand/10 transition-colors"
                                                    title="Edit Role"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                    <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">CRUD permissions are configured per staff member</p>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                            After assigning a role to a staff member in <strong>HR → Directory → Staff Profile → Roles & Permissions</strong>, 
                            you can configure their specific Read/Write/Edit/Delete access per module. 
                            This way, the same &ldquo;Teacher&rdquo; role can have different permissions for different teachers.
                        </p>
                    </div>
                </div>

                {/* Quick Staff Overview */}
                {allTeachers.length > 0 && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Staff Role Assignments</h3>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                    <input
                                        value={teacherSearch}
                                        onChange={e => setTeacherSearch(e.target.value)}
                                        placeholder="Search staff..."
                                        title="Search staff members"
                                        className="pl-7 pr-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-950 dark:border-zinc-700 focus:ring-1 focus:ring-brand outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {teachers.slice(0, 10).map(teacher => (
                                <div key={teacher.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {teacher.avatar ? (
                                            <img src={teacher.avatar} alt={teacher.firstName} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-zinc-500 text-sm">{teacher.firstName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{teacher.firstName} {teacher.lastName}</p>
                                        <p className="text-xs text-zinc-500 truncate">{teacher.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {teacher.customRole ? (
                                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-brand/10 text-brand">
                                                <Shield className="h-3 w-3" />
                                                {teacher.customRole.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">No role</span>
                                        )}
                                        <select
                                            className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-brand outline-none cursor-pointer"
                                            value={teacher.customRoleId || "none"}
                                            title={`Assign role to ${teacher.firstName} ${teacher.lastName}`}
                                            onChange={async (e) => {
                                                const res = await assignRoleToUserAction(schoolSlug, teacher.id, e.target.value === "none" ? null : e.target.value);
                                                if (res.success) {
                                                    toast.success("Role assigned");
                                                    router.refresh();
                                                } else {
                                                    toast.error(res.error);
                                                }
                                            }}
                                        >
                                            <option value="none">Assign role…</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {teachers.length > 10 && (
                                <div className="px-4 py-2 text-center text-xs text-zinc-400">
                                    Showing 10 of {teachers.length} staff. Use search to filter.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
