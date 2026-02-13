"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-console/AdminSidebar";

export function AdminLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    // If we are on login page, render full width without sidebar
    if (isLoginPage) {
        return <main className="bg-zinc-50 min-h-screen w-full">{children}</main>;
    }

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <Suspense fallback={<div className="w-72 h-screen bg-white border-r border-zinc-200 animate-pulse" />}>
                <AdminSidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto bg-zinc-50 text-zinc-900">
                {children}
            </main>
        </div>
    );
}
