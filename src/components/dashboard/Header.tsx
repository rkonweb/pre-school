"use client";

import { Bell, Menu, Search, User } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 lg:px-8">
            {/* Mobile Menu Trigger & Search */}
            <div className="flex items-center gap-4">
                <button className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </button>

                <div className="relative hidden sm:block md:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="block w-full rounded-lg border-0 bg-zinc-100 py-2 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-brand dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-zinc-950" />
                    <span className="sr-only">Notifications</span>
                </button>

                <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    {/* Placeholder Avatar */}
                    <User className="h-full w-full p-1.5 text-zinc-400" />
                </div>
            </div>
        </header>
    );
}
