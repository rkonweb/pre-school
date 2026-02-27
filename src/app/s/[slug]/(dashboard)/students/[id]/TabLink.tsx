"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    User,
    Activity,
    Briefcase,
    ClipboardList,
    TrendingUp,
    Heart,
    BookOpen,
    Target
} from "lucide-react";

const iconMap: Record<string, any> = {
    User,
    Activity,
    Briefcase,
    ClipboardList,
    TrendingUp,
    Heart,
    BookOpen,
    Target
};

interface TabLinkProps {
    tab: {
        id: string;
        label: string;
        icon: string;
        path: string;
    };
    slug: string;
    id: string;
}

export function TabLink({ tab, slug, id }: TabLinkProps) {
    const pathname = usePathname();
    const Icon = iconMap[tab.icon] || User;

    const basePath = `/s/${slug}/students/${id}`;
    const fullPath = `${basePath}${tab.path}`;

    // Check if the current pathname starts with the fullPath and handle the default tab
    let isActive = false;
    if (tab.path === "") {
        isActive = pathname === basePath;
    } else {
        isActive = pathname.startsWith(fullPath);
    }

    return (
        <Link
            href={fullPath}
            className={cn(
                "flex-1 min-w-[100px] py-3.5 rounded-[22px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                isActive ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            )}
        >
            <Icon className="h-4 w-4" />
            {tab.label}
        </Link>
    );
}
