"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, CreditCard, Sparkles, CheckSquare, Target } from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    href: string;
}

export default function CategoryBubbles({ slug, parentId, studentId, phone }: {
    slug: string;
    parentId: string;
    studentId: string;
    phone?: string;
}) {
    const base = `/${slug}/parent/${parentId}/${studentId}`;
    const query = phone ? `?phone=${phone}` : "";

    const categories: Category[] = [
        {
            id: "academics",
            label: "Academics",
            icon: BookOpen,
            color: "#8b5cf6",
            bgColor: "#f5f3ff",
            href: `${base}/academics${query}`
        },
        {
            id: "finance",
            label: "Fees",
            icon: CreditCard,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            href: `${base}/finance${query}`
        },
        {
            id: "jarvis",
            label: "Jarvis AI",
            icon: Sparkles,
            color: "#6366f1",
            bgColor: "#eef2ff",
            href: `${base}/jarvis${query}`
        },
        {
            id: "attendance",
            label: "Attendance",
            icon: CheckSquare,
            color: "#10b981",
            bgColor: "#ecfdf5",
            href: `${base}/academics${query}` // Attendance is often part of academics or a toggle
        },
        {
            id: "growth",
            label: "Growth",
            icon: Target,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            href: `${base}/academics${query}`
        }
    ];

    return (
        <div className="flex justify-between items-start px-2 py-4">
            {categories.map((cat, idx) => (
                <Link key={cat.id} href={cat.href} className="flex flex-col items-center gap-2 group">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                        className="h-14 w-14 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all border border-white"
                        style={{ backgroundColor: cat.bgColor }}
                    >
                        <cat.icon className="h-6 w-6" style={{ color: cat.color }} />
                    </motion.div>
                    <span className="text-[10px] font-bold text-slate-500 tracking-tight group-hover:text-slate-900 transition-colors uppercase tracking-[0.05em]">
                        {cat.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}
