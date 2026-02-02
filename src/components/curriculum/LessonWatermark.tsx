"use client";

import { cn } from "@/lib/utils";

interface LessonWatermarkProps {
    children: React.ReactNode;
    schoolId?: string;
}

export function LessonWatermark({ children, schoolId = "DEMO-SCHOOL-001" }: LessonWatermarkProps) {
    return (
        <div className="relative overflow-hidden select-none">
            {/* Structural content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Repeating Watermark Grid */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-wrap opacity-[0.03] dark:opacity-[0.05]">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-32 w-1/4 -rotate-45 items-center justify-center whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50"
                    >
                        {schoolId} • CONFIDENTIAL
                    </div>
                ))}
            </div>

            {/* Copy protection overlay (Invisible but thwarts selection/copying) */}
            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')",
                    backgroundRepeat: "repeat"
                }}
            />

            <style jsx global>{`
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
        </div>
    );
}
