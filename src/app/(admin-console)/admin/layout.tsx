"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-console/AdminSidebar";
import { SuperAdminProvider } from "@/context/super-admin-context";

import { isSuperAdminAuthenticated } from "@/app/actions/admin-auth-actions";
import { ModalProvider } from "@/components/ui/modal/ModalContext";
import { GlobalModalRenderer } from "@/components/ui/modal/GlobalModal";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        const checkAuth = async () => {
            if (isLoginPage) {
                setIsAuthorized(true);
                return;
            }

            try {
                const isAuthenticated = await isSuperAdminAuthenticated();
                if (!isAuthenticated) {
                    router.push("/admin/login");
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/admin/login");
            }
        };

        checkAuth();
    }, [pathname, isLoginPage, router]);

    if (!isAuthorized) {
        return <div className="min-h-screen bg-[#09090b]" />; // Loading state
    }

    // If we are on login page, render full width without sidebar
    if (isLoginPage) {
        return <main className="bg-zinc-50">{children}</main>;
    }

    return (
        <SuperAdminProvider>
            <ModalProvider>
                <div className="flex h-screen bg-zinc-50 overflow-hidden">
                    <AdminSidebar />
                    <main className="flex-1 overflow-y-auto bg-zinc-50 text-zinc-900">
                        {children}
                    </main>
                </div>
                <GlobalModalRenderer />
            </ModalProvider>
        </SuperAdminProvider>
    );
}
