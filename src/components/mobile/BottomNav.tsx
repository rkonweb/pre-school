"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Home, BookOpen, Wallet, Menu, Sparkles, Bus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
    { label: "Home", icon: Home, id: "home" },
    { label: "Academics", icon: BookOpen, id: "academics" },
    { label: "Jarvis", icon: Sparkles, id: "jarvis", isFloating: true },
    { label: "Transport", icon: Bus, id: "transport" },
    { label: "Menu", icon: Menu, id: "menu" },
];

export default function BottomNav() {
    const pathname = usePathname();
    const params = useParams();

    // Safety check for params
    const slug = params?.slug as string;
    const parentId = params?.parentId as string;
    const studentId = params?.studentId as string;

    // If we don't have a student context, maybe just show Home/Menu?
    // Or we rely on the fact that this is mainly for the student view.
    if (!studentId && !parentId) return null;

    return (
        <nav className="bg-white border-t border-gray-200 pb-safe pt-2 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
            <ul className="flex justify-between items-end h-16 pb-[18px]">
                {items.map((item) => {
                    // Construct base URL
                    // If studentId exists: /[slug]/parent/[parentId]/[studentId]/[tab]
                    // If only parentId: /[slug]/parent/[parentId]/[tab] (less common, usually redirects)

                    let href = "";

                    if (studentId) {
                        href = `/${slug}/parent/${parentId}/${studentId}`;
                        if (item.id !== "home") {
                            href += `/${item.id}`;
                        }
                    } else {
                        // Fallback for Family Hub (Home only)
                        href = `/${slug}/parent/${parentId}`;
                        // Disable other tabs or map them differently?
                        // For now, let's just point them to base, maybe they redirect.
                        if (item.id !== "home" && item.id !== "menu") {
                            // Temporary: pointing to hub might be confusing.
                            // Ideally, these tabs shouldn't exist without a student.
                        }
                    }

                    const isActive = item.id === "home"
                        ? pathname === href
                        : pathname?.startsWith(href);

                    const isFloating = item.isFloating;

                    if (isFloating) {
                        // Jarvis might be global?
                        // Let's keep it context aware
                        return (
                            <li key={item.id} className="relative -top-6">
                                <Link href={href}>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 text-white"
                                    >
                                        <Sparkles className="w-6 h-6" />
                                    </motion.div>
                                </Link>
                            </li>
                        );
                    }

                    return (
                        <li key={item.id} className="flex-1">
                            <Link href={href} className="flex flex-col items-center gap-1">
                                <div className="relative">
                                    <item.icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-200",
                                            isActive ? "text-indigo-600" : "text-gray-400"
                                        )}
                                    />
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                                        />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-colors duration-200",
                                        isActive ? "text-indigo-600" : "text-gray-400"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
