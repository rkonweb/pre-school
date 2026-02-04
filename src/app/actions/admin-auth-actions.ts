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
    const cookieStore = await cookies();
    return cookieStore.get("admin_session")?.value === "true";
}

export async function logoutSuperAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return { success: true };
}
