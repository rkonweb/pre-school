"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoadingBarProps {
    className?: string;
}

export function LoadingBar({ className }: LoadingBarProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) return 100;

                // Slower progress as it gets closer to 100%
                const diff = Math.random() * 10;
                const newProgress = oldProgress + diff;

                // Cap at 95% until unmounted/finished (in a real app, 100% would be triggered by router completion)
                return newProgress > 95 ? 95 : newProgress;
            });
        }, 300);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[400px] w-full p-8", className)}>
            <div className="w-full max-w-md space-y-3">
                <div className="flex justify-center">
                    <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">Loading...</span>
                </div>

                <div className="relative w-full h-10 rounded-full border border-border/50 bg-secondary overflow-hidden">
                    {/* Progress fill */}
                    <div
                        className="absolute top-0 left-0 h-full bg-[var(--brand-color)] rounded-full flex items-center justify-end pr-3 transition-all duration-300 ease-out"
                        style={{ width: `${Math.max(15, progress)}%` }}
                    >
                        {/* The brand color is usually dark, so white text is readable */}
                        <span className="text-xs font-semibold text-white drop-shadow-sm">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
