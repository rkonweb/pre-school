"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StandardTabsProps {
    children: React.ReactNode;
    className?: string;
}

export function StandardTabs({ children, className }: StandardTabsProps) {
    return (
        <div className={cn(
            "flex p-1.5 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-xl shadow-slate-200/50",
            className
        )}>
            {children}
        </div>
    );
}

interface StandardTabProps {
    active: boolean;
    onClick: () => void;
    label: string;
    icon?: LucideIcon;
    className?: string;
}

export function StandardTab({ active, onClick, label, icon: Icon, className }: StandardTabProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[1.5rem] text-sm font-bold transition-all duration-300 relative overflow-hidden",
                active
                    ? "text-white shadow-lg"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                className
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-slate-900 rounded-[1.5rem]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            <div className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                <span>{label}</span>
            </div>
        </button>
    );
}
