"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
    const [backUrl, setBackUrl] = useState("/");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const pathParts = window.location.pathname.split('/');
            // Try to detect slug from /s/[slug]/... or /[slug]/...
            if (pathParts[1] === 's' && pathParts[2]) {
                setBackUrl(`/s/${pathParts[2]}/dashboard`);
            } else if (pathParts[1] && !['signup', 'login', 'parent-login', 'school-login'].includes(pathParts[1])) {
                setBackUrl(`/${pathParts[1]}`);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-black text-zinc-200">404</h1>
                <div className="relative -mt-12 space-y-4">
                    <h2 className="text-2xl font-bold text-zinc-900">Page not found</h2>
                    <p className="text-zinc-500">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                    </p>
                    <div className="pt-4">
                        <Link
                            href={backUrl}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <MoveLeft className="h-4 w-4" />
                            {backUrl === "/" ? "Back to Home" : "Back to Portal"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

