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
                        name: true
                    }
                },
                customRole: true
            }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: user };
    } catch (error: any) {
        console.error("Get Current User Error:", error);
        return { success: false, error: error.message };
    }
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
        maxAge: 60 * 60 * 24, // 24 hours
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

    if (user.school?.slug !== slug) {
        console.warn(`SECURITY ALERT: User ${user.id} (${user.role}) tried to access unauthorized school: ${slug}`);
        return { success: false, error: "Unauthorized access to this school" };
    }

    return { success: true, user };
}
