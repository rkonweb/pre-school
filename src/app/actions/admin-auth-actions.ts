"use server";

import { cookies } from "next/headers";

export async function loginSuperAdminAction(password: string) {
    // In production, verify against env var or database
    // For now, hardcoding the secure check matching the frontend
    if (password === "masterkey123") {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            // No maxAge: Session cookie (expires on close)
        });
        return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
}

export async function isSuperAdminAuthenticated() {
    try {
        const cookieStore = await cookies();
        const result = cookieStore.get("admin_session")?.value === "true";
        console.log("[AUTH] isSuperAdminAuthenticated called, result:", result);
        return result;
    } catch (error) {
        console.error("[AUTH] Error in isSuperAdminAuthenticated:", error);
        return false; // Fail safely
    }
}

export async function logoutSuperAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return { success: true };
}
