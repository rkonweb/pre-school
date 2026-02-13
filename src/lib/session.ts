
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth-jose";
import { NextRequest } from "next/server";

export * from "@/lib/auth-jose";

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("admin_session")?.value;
    if (!session) return;

    const parsed = await decrypt(session);
    if (!parsed) return;

    // Example for sliding expiration if needed
}
