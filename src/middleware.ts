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

    // --- LOCALHOST DEV: Clear any browser-cached CSP/HSTS that could force HTTPS ---
    // This clears cached security policies from before the upgrade-insecure-requests fix.
    if (hostname === "localhost" && process.env.NODE_ENV !== "production") {
        // Redirect any accidental HTTPS requests back to HTTP
        if (req.nextUrl.protocol === "https:") {
            const httpUrl = req.nextUrl.clone();
            httpUrl.protocol = "http:";
            return NextResponse.redirect(httpUrl);
        }
    }

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
            const redirectUrl = new URL("/admin/login", req.url);
            redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
            const redirectParams = NextResponse.redirect(redirectUrl);
            redirectParams.cookies.delete("admin_session");
            response = redirectParams;
            return applySecurityHeaders(response);
        }
    }

    // Allowed Main Domains
    const allowedDomains = ["localhost", "10.0.2.2", "bodhiboard.com", "www.bodhiboard.com", "vercel.app", "bodhiboard.in", "www.bodhiboard.in"];
    const isMainDomain = hostname === "localhost" || hostname === "10.0.2.2" || allowedDomains.some(domain => hostname.includes(domain));

    // Custom Domain Resolution
    let tenantSlugFromDomain: string | null = null;
    if (!isMainDomain) {
        // Fetch dynamically from our internal API (which uses Prisma and caches the result)
        try {
            // In a real production edge environment, this absolute URL will need to be derived properly,
            // or an Edge-compatible KV/DB client used. For now, we fallback to a safe absolute URL check.
            const proto = req.nextUrl.protocol;
            const host = req.nextUrl.host;
            const apiUrl = `${proto}//${host}/api/tenants/domain-map`;

            // We use a short timeout to prevent blocking middleware too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            const res = await fetch(apiUrl, {
                signal: controller.signal,
                next: { revalidate: 60 } // Cache for 1 minute
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const customDomainMap = await res.json();
                tenantSlugFromDomain = customDomainMap[hostname] || null;
            }
        } catch (e) {
            console.warn("Middleware: Failed to fetch custom domain map dynamically, falling back...", e);
        }
    }

    // 4. Protect School/Parent Routes (Strict Server-Side Check)
    if (url.pathname.startsWith("/s/") || tenantSlugFromDomain) {
        const sessionToken = req.cookies.get("session")?.value;
        let isAuthorized = false;
        let authorizedSlug: string | null = null;
        let redirectPath = tenantSlugFromDomain ? `/${tenantSlugFromDomain}` : "/";

        if (sessionToken) {
            try {
                const payload = await decrypt(sessionToken);
                if (payload && payload.userId && payload.schoolSlug) {
                    authorizedSlug = payload.schoolSlug as string;
                    // CROSS-TENANT CHECK
                    const pathParts = url.pathname.split("/");
                    const pathSlug = tenantSlugFromDomain || pathParts[2];

                    if (pathSlug && pathSlug !== authorizedSlug) {
                        // Redirect to authorized slug
                        redirectPath = `/s/${authorizedSlug}`;
                    } else {
                        isAuthorized = true;
                    }
                }
            } catch (e) {
                // failure
            }
        }

        // If trying to access protected /s/ route but unauthorized
        if (url.pathname.startsWith("/s/") && !isAuthorized) {
            const redirectUrl = new URL(`/${authorizedSlug || tenantSlugFromDomain || ''}`, req.url);
            redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
            response = NextResponse.redirect(redirectUrl);
            return applySecurityHeaders(response);
        }

        // If on custom domain and authenticated, ensure they go to dashboard if they hit root
        if (tenantSlugFromDomain && isAuthorized && (url.pathname === "/" || url.pathname === "/login" || url.pathname === "/school-login")) {
            url.pathname = `/s/${authorizedSlug}`;
            response = NextResponse.redirect(url);
            return applySecurityHeaders(response);
        }
    }

    // CUSTOM DOMAIN REWRITES
    if (tenantSlugFromDomain && (url.pathname === "/" || url.pathname === "/login" || url.pathname === "/school-login")) {
        // Rewrite root custom domain to /[slug] login page
        url.pathname = `/${tenantSlugFromDomain}`;
        response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
    }

    // SPECIAL: Old /school-login redirects to root (which might then redirect to /[slug] if domain matched)
    if (url.pathname === "/school-login") {
        url.pathname = "/";
        response = NextResponse.redirect(url);
        return applySecurityHeaders(response);
    }

    // 5. Special Case: Android Emulator (10.0.2.2) root should show Parent Login
    if (hostname === "10.0.2.2" && url.pathname === "/") {
        url.pathname = "/parent-login";
        response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
    }

    if (isMainDomain && !url.pathname.startsWith("/s/")) {
        response = NextResponse.next();
        return applySecurityHeaders(response);
    }

    // Rewrite Logic for Subdomains:
    if (url.pathname === "/parent" || url.pathname.startsWith("/parent/")) {
        url.pathname = `/${hostname}${url.pathname}`;
        response = NextResponse.rewrite(url);
        return applySecurityHeaders(response);
    }

    // Default Fallback
    response = NextResponse.next();
    return applySecurityHeaders(response);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), interest-cohort=()");

    // Content Security Policy
    const cspValue = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.googleapis.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' blob: data: https://*.googleusercontent.com https://*.googleapis.com;
        connect-src 'self' https://*.googleapis.com;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        ${process.env.NODE_ENV === "production" ? "upgrade-insecure-requests;" : ""}
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set("Content-Security-Policy", cspValue);

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
