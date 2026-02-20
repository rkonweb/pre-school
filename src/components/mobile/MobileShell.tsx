"use client";

import React from "react";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";

interface MobileShellProps {
    children: React.ReactNode;
    slug: string;
    hideFooter?: boolean;
}

export default function MobileShell({ children, slug, hideFooter = false }: MobileShellProps) {
    const pathname = usePathname();

    // Hide bottom nav on specific pages if needed (e.g., login, chat detail)
    const hideNav = pathname?.includes("/login") || pathname?.includes("/chat/");

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
                <AnimatePresence mode="wait">
                    {children}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            {!hideNav && !hideFooter && <BottomNav slug={slug} />}
        </div>
    );
}
