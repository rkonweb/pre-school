"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface HeaderSettingsButtonProps {
    slug: string;
    parentId: string;
    studentId: string;
    phone?: string;
}

export function HeaderSettingsButton({ slug, parentId, studentId, phone }: HeaderSettingsButtonProps) {
    // If phone is not passed prop, try to get from search params, though prop is safer for server/client consistency
    const searchParams = useSearchParams();
    const finalPhone = phone || searchParams.get("phone") || "";

    const menuUrl = `/${slug}/parent/${parentId}/${studentId}/menu${finalPhone ? `?phone=${finalPhone}` : ''}`;

    return (
        <Link
            href={menuUrl}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-slate-700 shadow-sm transition-all hover:bg-white/60 active:scale-95"
        >
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>
    );
}
