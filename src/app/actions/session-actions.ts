"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Get current logged-in user from session
 * TODO: Implement proper session management with JWT or NextAuth
 */
export async function getCurrentUserAction() {
    try {
        // For now, we'll use a simple cookie-based approach
        // In production, you should use proper session management
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return { success: false, error: "Not authenticated" };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
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
 */
export async function setUserSessionAction(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set("userId", userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    return { success: true };
}

/**
 * Clear user session (logout)
 */
export async function clearUserSessionAction() {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    return { success: true };
}
