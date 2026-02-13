"use server";

import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/session";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Strong_Master_P@ssw0rd_2026!";

export async function loginSuperAdminAction(password: string) {
    if (password === ADMIN_PASSWORD) {
        // Create secure session token (JWT)
        const sessionToken = await encrypt({
            role: "SUPER_ADMIN",
            user: "root",
            createdAt: Date.now()
        });

        // Set secure cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, // 15 minutes idle timeout
            path: "/"
        });

        return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
}

export async function isSuperAdminAuthenticated() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_session")?.value;

        if (!token) return false;

        const payload = await decrypt(token);

        // Check if token is valid and has correct role
        if (payload?.role === "SUPER_ADMIN") {
            return true;
        }

        return false;
    } catch (error) {
        console.error("[AUTH] Error in isSuperAdminAuthenticated:", error);
        return false;
    }
}

export async function logoutSuperAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return { success: true };
}
