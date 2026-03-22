"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-console/AdminSidebar";
import { ShieldCheck, Lock, KeyRound, ArrowRight } from "lucide-react";
import { loginSuperAdminAction } from "@/app/actions/admin-auth-actions";

export function AdminLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === "/admin/login";

    // Track auth state for session-expiry detection
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true); // optimistic

    useEffect(() => {
        // On the login page itself, no need to check
        if (isLoginPage) {
            setAuthChecked(true);
            setIsAuthenticated(false);
            return;
        }
        // Lightweight auth check to detect session expiry
        fetch("/api/admin/auth-check")
            .then(r => r.json())
            .then(data => {
                setIsAuthenticated(data.authenticated);
                setAuthChecked(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setAuthChecked(true);
            });
    }, [pathname, isLoginPage]);

    // Full-screen login when unauthenticated (session expired or on login page)
    if (isLoginPage || (authChecked && !isAuthenticated)) {
        return (
            <main className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4 relative">
                {/* Dot grid background */}
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.03] dot-grid-bg"
                />
                {/* On the login page, just render children (the real login page component) */}
                {isLoginPage ? (
                    <div className="w-full">{children}</div>
                ) : (
                    /* Session expired — inline login card without sidebar */
                    <SessionExpiredLogin onSuccess={() => {
                        setIsAuthenticated(true);
                        router.refresh();
                    }} />
                )}
            </main>
        );
    }

    // Loading state — show skeleton while auth check runs
    if (!authChecked) {
        return (
            <div className="flex h-screen bg-zinc-50 overflow-hidden">
                <div className="w-72 h-screen bg-white border-r border-zinc-200 animate-pulse shrink-0" />
                <main className="flex-1 overflow-y-auto bg-zinc-50" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <Suspense fallback={<div className="w-72 h-screen bg-white border-r border-zinc-200 animate-pulse" />}>
                <AdminSidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto bg-zinc-50 text-zinc-900" data-admin-layout="true">
                {children}
            </main>
        </div>
    );
}

// Inline session-expired login card
function SessionExpiredLogin({ onSuccess }: { onSuccess: () => void }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const res = await loginSuperAdminAction(formData.password);
        if (res.success) {
            onSuccess();
        } else {
            setError("Invalid credentials. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md relative z-10">
            <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
                <div className="px-8 pt-12 pb-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 shadow-lg shadow-zinc-900/20 mb-6">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Session Expired</h2>
                    <p className="mt-2 text-sm font-medium text-zinc-500">Your session has ended. Please sign in again to continue.</p>
                </div>

                <div className="px-8 pb-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Admin ID</label>
                            <input
                                type="email"
                                required
                                data-lpignore="true"
                                className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all text-sm font-medium placeholder:text-zinc-400"
                                placeholder="admin@platform.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Security Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    data-lpignore="true"
                                    className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-10 text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all text-sm font-medium placeholder:text-zinc-400"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                        )}

                        <button
                            disabled={isLoading}
                            className="group w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-900/10 hover:bg-black hover:shadow-zinc-900/20 active:scale-[0.99] disabled:opacity-70 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    <span>Verifying…</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                                    <span>Access Console</span>
                                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs text-zinc-400 font-medium">Protected by 256-bit Encryption</p>
            </div>
        </div>
    );
}
