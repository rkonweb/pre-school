"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    className?: string;
    rightAction?: React.ReactNode;
    showBell?: boolean;
    children?: React.ReactNode;
    logoUrl?: string;
    brandColor?: string;
}

export function DashboardHeader({
    title,
    subtitle,
    showBack = false, // Default false for dashboard
    onBack,
    className,
    rightAction,
    showBell = false,
    children,
    logoUrl,
    brandColor
}: DashboardHeaderProps) {
    const router = useRouter();
    const handleBack = () => {
        if (onBack) onBack();
        else router.back();
    };

    // --- Smart Sticky Logic (Cloned) ---
    const [isHidden, setIsHidden] = useState(false);
    const isHiddenRef = useRef(false); // Sync ref for event listener
    const lastScrollY = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            // Support both window and element scrolling
            const target = e.target as HTMLElement | Document;
            let currentScrollY = 0;

            if (target === document) {
                currentScrollY = window.scrollY;
            } else if (target instanceof HTMLElement) {
                currentScrollY = target.scrollTop;
            }

            const diff = currentScrollY - lastScrollY.current;
            const absDiff = Math.abs(diff);
            const threshold = 5;

            if (currentScrollY < 50) {
                // Top of container
                if (isHiddenRef.current) {
                    setIsHidden(false);
                    isHiddenRef.current = false;
                }
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            } else if (absDiff > threshold) {
                if (diff < 0) {
                    // Scrolling UP
                    if (isHiddenRef.current) {
                        setIsHidden(false);
                        isHiddenRef.current = false;
                    }
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                } else {
                    // Scrolling DOWN
                    if (!isHiddenRef.current && !timerRef.current) {
                        timerRef.current = setTimeout(() => {
                            setIsHidden(true);
                            isHiddenRef.current = true;
                            timerRef.current = null;
                        }, 2000); // 2s delay
                    }
                }
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true } as any);
    }, []);

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" }
            }}
            initial="visible"
            animate={isHidden ? "hidden" : "visible"}
            transition={{
                type: "spring",
                stiffness: 80,
                damping: 15,
                mass: 1
            }}
            className={cn(
                "px-5 pt-[34px] pb-4 shrink-0 z-50 sticky top-0 backdrop-blur-xl",
                !brandColor && "bg-[#F1F5F9]/80", // Default if no brandColor
                className
            )}
            style={brandColor ? { backgroundColor: `${brandColor}CC` } : {}}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Back Button */}
                    {showBack && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBack}
                            className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </motion.button>
                    )}

                    {/* Title / Logo Area */}
                    <div className="flex items-center gap-3">
                        {!showBack && logoUrl && (
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                                <img src={logoUrl} alt={title || "Logo"} className="h-full w-full object-contain" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            {subtitle && (
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest leading-none mb-0.5",
                                    brandColor ? "text-white/70" : "text-slate-400"
                                )}>
                                    {subtitle}
                                </span>
                            )}
                            <h1 className={cn(
                                "text-xl font-black leading-none tracking-tight",
                                brandColor ? "text-white" : "text-slate-900"
                            )}>
                                {title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {showBell && (
                        <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white" />
                        </div>
                    )}
                    {rightAction && (
                        <div>
                            {rightAction}
                        </div>
                    )}
                </div>
            </div>
            {children && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </motion.header>
    );
}
