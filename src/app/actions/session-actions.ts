"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/auth-jose";

/**
 * Get current logged-in user from session
 */
export async function getCurrentUserAction() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        const selectedBranchId = cookieStore.get("selected_branch_id")?.value;

        if (!sessionToken) {
            return { success: false, error: "Not authenticated" };
        }

        const payload = await decrypt(sessionToken);
        if (!payload || !payload.userId) {
            return { success: false, error: "Invalid session" };
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                school: {
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        maxBranches: true,
                        subscription: {
                            select: {
                                id: true,
                                status: true,
                                planId: true,
                                endDate: true
                            }
                        },
                        branches: {
                            select: { id: true, name: true }
                        }
                    }
                },
                branch: {
                    select: { id: true, name: true }
                },
                customRole: true
            }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Determine effective branch context
        // 1. If user is restricted to a branch, forced to that branch.
        // 2. If user is Admin/SuperAdmin, use cookie or default to null (All)

        let currentBranchId: string | null = null;

        if (user.branchId) {
            currentBranchId = user.branchId;
        } else if (selectedBranchId) {
            if (user.role === "SUPER_ADMIN") {
                // Super Admin can access any branch if set in cookie
                currentBranchId = selectedBranchId;
            } else {
                // Verify this branch belongs to the user's school
                const isValid = user.school?.branches.some(b => b.id === selectedBranchId);
                if (isValid) {
                    currentBranchId = selectedBranchId;
                }
            }
        }

        return { success: true, data: { ...user, currentBranchId } };
    } catch (error: any) {
        console.error("Get Current User Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Switch the active branch context for the session
 */
export async function switchBranchAction(branchId: string | "ALL") {
    const res = await getCurrentUserAction();
    if (!res.success || !res.data) return { success: false };

    const user = res.data;

    // If user is restricted, they cannot switch
    if (user.branchId) {
        return { success: false, error: "You are restricted to your assigned branch." };
    }

    const cookieStore = await cookies();

    if (branchId === "ALL") {
        cookieStore.delete("selected_branch_id");
        return { success: true };
    }

    // specific branch
    if (user.role === "SUPER_ADMIN") {
        // Super Admin can switch to any existing branch
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
            select: { id: true }
        });
        if (!branch) {
            return { success: false, error: "Branch not found." };
        }
    } else {
        // Verify branch exists in school
        const isValid = user.school?.branches.some(b => b.id === branchId);
        if (!isValid) {
            return { success: false, error: "Invalid branch for this school." };
        }
    }

    cookieStore.set("selected_branch_id", branchId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days sticky
    });

    return { success: true };
}

/**
 * Set user session (call after login)
 * Includes userId and schoolSlug in the JWT for middleware checks
 */
export async function setUserSessionAction(userId: string, schoolSlug?: string) {
    const sessionToken = await encrypt({ userId, schoolSlug });
    const cookieStore = await cookies();

    cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // maxAge removed to ensure it's a SESSION COOKIE (clears on browser close)
    });
    return { success: true };
}

/**
 * Clear user session (logout)
 */
export async function clearUserSessionAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
}

/**
 * Validate that the current user belongs to a specific school slug.
 * Used for server-side authorization in actions.
 */
export async function validateUserSchoolAction(slug: string) {
    const res = await getCurrentUserAction();
    if (!res.success || !res.data) {
        return { success: false, error: "Authentication required" };
    }

    const user = res.data;
    // Admin check or exact slug match
    if (user.role === "SUPER_ADMIN") return { success: true, user };

    console.log(`VALIDATE SCHOOL: TargetSlug=${slug}, UserSchoolSlug=${user.school?.slug}, UserID=${user.id}, Role=${user.role}`);

    if (user.school?.slug !== slug) {
        const errorMsg = `Unauthorized access to this school. Expected: ${slug}, Actual: ${user.school?.slug || 'NONE'}`;
        console.warn(`SECURITY ALERT: User ${user.id} (${user.role}) tried to access unauthorized school: ${slug}. Their school is ${user.school?.slug}`);
        return { success: false, error: errorMsg };
    }

    return { success: true, user };
}

/**
 * Check if the user has a specific permission for a module.
 * Should be called after validateUserSchoolAction.
 */
export async function hasPermissionAction(user: any, module: string, action: string) {
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;

    try {
        const permissions = typeof user.customRole?.permissions === 'string'
            ? JSON.parse(user.customRole.permissions)
            : (user.customRole?.permissions || []);

        const perm = permissions.find((p: any) => p.module === module);
        if (!perm) return false;

        return perm.actions.includes(action);
    } catch (e) {
        console.error("Permission Check Error:", e);
        return false;
    }
}

/**
 * Check subscription status for a school
 * Returns whether subscription is active and reason if not
 */
export async function checkSubscriptionStatusAction(schoolId: string) {
    try {
        const subscription = await prisma.subscription.findFirst({
            where: { schoolId },
            include: { plan: true }
        });

        if (!subscription) {
            return {
                isActive: false,
                reason: 'NO_SUBSCRIPTION',
                message: 'No subscription found for this school'
            };
        }

        const now = new Date();
        const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

        // Check if expired
        if (endDate && endDate < now) {
            const daysExpired = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
                isActive: false,
                reason: 'EXPIRED',
                daysExpired,
                message: `Subscription expired ${daysExpired} day${daysExpired !== 1 ? 's' : ''} ago`,
                subscription
            };
        }

        // Check if suspended or cancelled
        if (subscription.status === 'SUSPENDED') {
            return {
                isActive: false,
                reason: 'SUSPENDED',
                message: 'Subscription has been suspended',
                subscription
            };
        }

        if (subscription.status === 'CANCELLED') {
            return {
                isActive: false,
                reason: 'CANCELLED',
                message: 'Subscription has been cancelled',
                subscription
            };
        }

        // Active subscription
        return {
            isActive: true,
            subscription,
            daysRemaining: endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        };
    } catch (error: any) {
        console.error("Check Subscription Status Error:", error);
        return {
            isActive: false,
            reason: 'ERROR',
            message: error.message
        };
    }
}
