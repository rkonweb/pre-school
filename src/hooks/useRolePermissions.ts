
"use client";

import { useEffect, useState } from "react";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { toast } from "sonner";

export function useRolePermissions() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [role, setRole] = useState<string>("STAFF"); // Default restricted
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await getCurrentUserAction();
                if (res.success && res.data) {
                    setRole(res.data.role);
                    if (res.data.customRole) {
                        try {
                            const perms = typeof res.data.customRole.permissions === 'string'
                                ? JSON.parse(res.data.customRole.permissions)
                                : res.data.customRole.permissions;
                            setPermissions(perms || []);
                        } catch (e) {
                            console.error("Failed to parse permissions", e);
                        }
                    }
                }
            } catch (error) {
                console.error("Permission Load Error", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadUser();
    }, []);

    const can = (module: string, action: string) => {
        // 1. Admin Override
        if (role === "ADMIN" || role === "SUPER_ADMIN") return true;

        // 2. Default Restricted
        if (permissions.length === 0) return false;

        // 3. Check Module
        // Support Exact Match OR Parent Match (e.g., 'students.profiles' matches 'students' check if we want, but usually specific)
        // Here we do specific check. User asks: can('students', 'create')
        // Perms might have: { module: 'students', actions: ['view', 'create'] }

        // Also handling submodules: if user has 'students', do they have 'students.profiles'? 
        // Usually, permissions are explicit.

        const perm = permissions.find(p => p.module === module);
        if (!perm) return false;

        return perm.actions.includes(action);
    };

    return { can, isLoading, role };
}
