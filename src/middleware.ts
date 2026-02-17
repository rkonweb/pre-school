import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth-jose";

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || "localhost";
    const requestHeaders = new Headers(req.headers);

    // Remove port (e.g. localhost:3000 -> localhost)
    hostname = hostname.split(":")[0];

    let response: NextResponse;

    // --- LOGIC START ---

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
            const redirect = NextResponse.redirect(new URL("/admin/login", req.url));
            redirect.cookies.delete("admin_session");
            response = redirect;
            return applySecurityHeaders(response);
        }
    }

    // Allowed Main Domains
    const allowedDomains = ["localhost", "10.0.2.2", "bodhiboard.com", "www.bodhiboard.com", "vercel.app", "bodhiboard.in", "www.bodhiboard.in"];
    const isMainDomain = hostname === "localhost" || hostname === "10.0.2.2" || allowedDomains.some(domain => hostname.includes(domain));

    if (isMainDomain) {
        // If main domain, check tenant logic or just basic next
        // For main domain we essentially allow passthrough unless it's a tenant path, 
        // but the current logic was just "return next()".
        // We must ensure we don't skip the /s/ protection if someone tries to access it via main domain (though uncommon structure).
        // The original logic returned immediately. We'll capture it.
        // BUT wait, does /s/ logic apply to main domain? Yes, /s/ is school dashboard path.
        // If I return here, I skip /s/ check.
        // Original code: if (isMainDomain) return NextResponse.next();
        // This implies /s/ routes are NOT shielded on main domain? Or /s/ is ONLY for subdomains?
        // Looking at line 56 in original: It checks `url.pathname.startsWith("/s/")`.
        // If `isMainDomain` returns early, /s/ check is skipped.
        // If the app relies on /s/ being accessible on main domain (e.g. localhost/s/slug), then strictly returning next() is wrong IF we want protection.
        // However, assuming the original logic was intended, I will keep it but add headers.

        // Actually, if I am on localhost, I likely use /s/slug. So I SHOULD process /s/ check.
        // The original logic `if (isMainDomain) return NextResponse.next()` essentially explicitly ALLOWED main domains to bypass the Rewrite logic below.
        // It did NOT bypass the /s/ check if it was placed *before* the /s/ check?
        // Original: Line 49 returns. Line 56 is /s/ check.
        // So on localhost, /s/ check was skipped? That sounds like a bug or dev mode/public landing page feature.
        // Wait, if I am on localhost/s/slug, `isMainDomain` is true. `NextResponse.next()` is returned.
        // The Middleware executes sequentially.
        // If `return next()` happens, the request continues to the page.
        // If the PAGE `layout.tsx` or `page.tsx` has checks, great.
        // But `middleware` protection for /s/ was seemingly skipped for localhost?
        // That seems like a security gap for Dev, but maybe intended.
        // user: "Make the Cyber security very Hard".
        // I should fix this gap. /s/ routes should be protected regardless of domain.

        // REVISED FLOW:
        // Do NOT return early for isMainDomain if path starts with /s/.
    }

    // 4. Protect School/Parent Routes (Strict Server-Side Check)
    if (url.pathname.startsWith("/s/")) {
        const sessionToken = req.cookies.get("session")?.value;
        let isAuthorized = false;
        let redirectPath = "/school-login";

        if (sessionToken) {
            try {
                const payload = await decrypt(sessionToken);
                if (payload && payload.userId) {
                    // CROSS-TENANT CHECK
                    const pathParts = url.pathname.split("/");
                    const pathSlug = pathParts[2];
                    if (pathSlug && payload.schoolSlug && pathSlug !== payload.schoolSlug) {
                        // Redirect to authorized slug
                        redirectPath = `/s/${payload.schoolSlug}`;
                    } else {
                        isAuthorized = true;
                    }
                }
            } catch (e) {
                // failure
            }
        }

        if (!isAuthorized) {
            response = NextResponse.redirect(new URL(redirectPath, req.url));
            return applySecurityHeaders(response);
        }
    }

    // If we're here, either we passed checks or we are not in a protected route.

    // REWRITE LOGIC (Only for subdomains usually, but let's stick to existing logic adjusted)
    // 5. Special Case: Android Emulator (10.0.2.2) root should show Parent Login
    if (hostname === "10.0.2.2" && url.pathname === "/") {
        url.pathname = "/parent-login";
        response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
    }

    if (isMainDomain) {
        response = NextResponse.next();
        return applySecurityHeaders(response);
    }

    // Rewrite Logic for Subdomains:
    if (url.pathname === "/parent" || url.pathname.startsWith("/parent/")) {
        url.pathname = `/${hostname}${url.pathname}`;
        response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
    }

    // Default Rewrite for Subdomains
    url.pathname = `/parent-login`;
    response = NextResponse.rewrite(url);
    return applySecurityHeaders(response);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // HSTS (Production Only)
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
