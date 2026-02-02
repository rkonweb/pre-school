import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || "localhost";

    // Remove port (e.g. localhost:3000 -> localhost)
    hostname = hostname.split(":")[0];

    // Allowed Main Domains (No rewrite needed)
    // Add your production domains here
    const allowedDomains = ["localhost", "bodhiboard.com", "www.bodhiboard.com", "vercel.app"];

    // Check if current hostname is allowed
    const isMainDomain = allowedDomains.some(domain => hostname.includes(domain));

    if (isMainDomain) {
        return NextResponse.next();
    }

    // Exclude Public Files
    if (url.pathname.includes(".") || url.pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Rewrite Logic:
    // app.school.com/parent-login -> /app.school.com/parent-login
    // The page [schoolName] will receive "app.school.com" as the param.

    console.log(`[Middleware] Handling ${hostname} request to ${url.pathname}`);

    // 1. Dashboard Routes (Maintain Tenant Context)
    // Matches /parent, /parent/..., but NOT /parent-login (strictly)
    // Actually /parent is typically redirected to /parent-login by the page itself if unauth, 
    // but we need to route it to the [schoolName] folder so the page code runs.
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
