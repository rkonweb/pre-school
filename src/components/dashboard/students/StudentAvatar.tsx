"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Clean redundant platform-level placeholder text from names
 */
export const cleanName = (name: string) => {
    if (!name) return "";
    return name
        .replace(/ClassUKGB/g, "")
        .replace(/Parent of Student\d+/g, "")
        .trim();
};

interface StudentAvatarProps {
    src?: string | null;
    name: string;
    className?: string;
    showFallbackText?: boolean;
}

export function StudentAvatar({ src, name, className, showFallbackText = false }: StudentAvatarProps) {
    const [error, setError] = useState(false);
    const cleanedName = cleanName(name);

    if (!src || error) {
        return (
            <div className={cn(
                "h-10 w-10 flex-shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700",
                className
            )}>
                {showFallbackText && cleanedName ? (
                    <span className="text-xs font-bold uppercase">{cleanedName[0]}</span>
                ) : (
                    <User className="h-5 w-5" />
                )}
            </div>
        );
    }

    return (
        <div className={cn("h-10 w-10 flex-shrink-0", className)}>
            <img
                src={src}
                alt={cleanedName || "Student Avatar"}
                className="h-full w-full rounded-full border border-zinc-200 bg-zinc-100 object-cover dark:border-zinc-700 dark:bg-zinc-800"
                onError={() => setError(true)}
            />
        </div>
    );
}
