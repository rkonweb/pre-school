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
            className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm transition-transform active:scale-95"
        >
            <Settings className="h-5 w-5" />
        </Link>
    );
}
