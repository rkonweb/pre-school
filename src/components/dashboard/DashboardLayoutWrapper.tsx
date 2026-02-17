"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isCollapsed ? "lg:ml-[100px]" : "lg:ml-[272px]"
        )}>
            {children}
        </div>
    );
}
