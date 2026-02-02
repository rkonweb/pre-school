"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    MessageCircle,
    Wallet,
    User,
    Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/parent", icon: Home },
    { name: "Messages", href: "/parent/messages", icon: MessageCircle },
    { name: "Fees", href: "/parent/fees", icon: Wallet },
    { name: "Profile", href: "/parent/profile", icon: User },
];

export function ParentNavbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white px-6 pb-6 pt-3 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function ParentHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xl">
                        P
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Preschool Parent</h1>
                        <p className="text-[10px] text-zinc-500">Welcome back, Sarah!</p>
                    </div>
                </div>
                <button className="relative rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-zinc-950" />
                </button>
            </div>
        </header>
    );
}
