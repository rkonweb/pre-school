import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth-jose";

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || "localhost";
    const requestHeaders = new Headers(req.headers);

    // Remove port (e.g. localhost:3000 -> localhost)
    hostname = hostname.split(":")[0];

    // 3. Protect Admin Routes (Strict Server-Side Check - HIGHEST PRIORITY)
    if (url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login")) {
        const adminSession = req.cookies.get("admin_session")?.value;
        let isValid = false;

        if (adminSession) {
            try {
                const payload = await decrypt(adminSession);
                if (payload?.role === "SUPER_ADMIN" && payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
                    isValid = true;
                }
            } catch (e) {
                // Invalid token
            }
        }

        if (!isValid) {
            // Clear invalid cookie and redirect
            const response = NextResponse.redirect(new URL("/admin/login", req.url));
            response.cookies.delete("admin_session");
            return response;
        }

        // Sliding Expiration: Refresh the cookie if valid (activity based extension)
        // This is tricky in Next.js Middleware as we need to pass a response object down.
        // For now, reliance on cookie maxAge and client-side activity is simpler.
        // However, we re-verify strict 15m JWT expiry.
    }

    // Allowed Main Domains (No rewrite needed)
    // Add your production domains here
    const allowedDomains = ["localhost", "bodhiboard.com", "www.bodhiboard.com", "vercel.app", "bodhiboard.in", "www.bodhiboard.in"];

    // Check if current hostname is allowed (localhost on any port is allowed)
    const isMainDomain = hostname === "localhost" || allowedDomains.some(domain => hostname.includes(domain));

    if (isMainDomain) {
        return NextResponse.next();
    }

    // 4. Protect School/Parent Routes (Strict Server-Side Check)
    // Matches /s/anything... but likely not parent routes as they are rewritten?
    // Let's protect /s/* (School Dashboards)
    if (url.pathname.startsWith("/s/")) {
        const userSession = req.cookies.get("userId");
        if (!userSession) {
            return NextResponse.redirect(new URL("/school-login", req.url));
        }
    }

    // Rewrite Logic:
    // app.school.com/parent-login -> /app.school.com/parent-login
    // The page [schoolName] will receive "app.school.com" as the param.

    // 1. Dashboard Routes (Maintain Tenant Context)
    if (url.pathname === "/parent" || url.pathname.startsWith("/parent/")) {
        url.pathname = `/${hostname}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // 2. All other routes (Home, Login, ambiguous) -> Global Login
    // This allows app.school.com to show the login page
    url.pathname = `/parent-login`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        /*
         * Match all paths except valid static files
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
