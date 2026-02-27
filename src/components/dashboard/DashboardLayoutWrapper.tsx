"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { Maximize, Minimize, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed, isAppFullscreen, setIsOpen } = useSidebar();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Fullscreen failed: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    return (
        <div className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            isAppFullscreen
                ? "ml-0 fixed inset-0 z-[10000] bg-zinc-50 dark:bg-zinc-900"
                : (isCollapsed ? "lg:ml-[100px] min-h-0 min-w-0" : "lg:ml-[272px] min-h-0 min-w-0")
        )}>
            {isAppFullscreen && (
                <div className="fixed top-4 right-4 z-[10001] flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsOpen(true)}
                        className="shadow-lg border border-zinc-200"
                    >
                        <Menu className="h-4 w-4 mr-2" />
                        Menu
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="shadow-lg border border-zinc-200"
                    >
                        <Minimize className="h-4 w-4 mr-2" />
                        Exit Fullscreen
                    </Button>
                </div>
            )}
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
                {children}
            </div>
        </div>
    );
}
