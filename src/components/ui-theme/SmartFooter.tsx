"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemData {
    icon: any;
    label: string;
    href: string;
}

interface SmartFooterProps {
    navItems: NavItemData[];
    pathname: string;
    baseRoute: string;
    phone: string;
    brandColor: string;
}

export function SmartFooter({
    navItems,
    pathname,
    baseRoute,
    phone,
    brandColor
}: SmartFooterProps) {
    // --- Smart Sticky Logic (Inverted for Footer) ---
    const [isHidden, setIsHidden] = useState(false);
    const isHiddenRef = useRef(false);
    const lastScrollY = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = (e: Event) => {
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

            // Always show at bottom of page could be nice, but standard is scroll direction
            // If at very top, show it? Usually footers are always visible unless scrolling down.

            if (currentScrollY < 50) {
                // Near top, show it
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
                    // Scrolling UP -> Show Footer
                    if (isHiddenRef.current) {
                        setIsHidden(false);
                        isHiddenRef.current = false;
                    }
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                } else {
                    // Scrolling DOWN -> Hide Footer (after delay or immediately?)
                    // User said "Make the Footer Manu hides and Come back like Header"
                    // Header waits 2.5s. Footer usually hides immediately in apps like Instagram, but user said "like Header".
                    // I will stick to the same logic: Wait 2.5s then hide.
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
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: "150%" } // Hide downwards
            }}
            initial="visible"
            animate={isHidden ? "hidden" : "visible"}
            transition={{
                type: "spring",
                stiffness: 80,
                damping: 15,
                mass: 1
            }}
            className="fixed bottom-6 left-6 right-6 backdrop-blur-2xl border border-white/10 z-50 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+2px)] flex justify-between items-center sm:hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-[15px] bg-zinc-900/90"
        >
            {navItems.map((item, idx) => {
                const hrefPath = item.href.split('?')[0];
                const isActive = (item.label === "Home" || hrefPath === baseRoute)
                    ? pathname === hrefPath
                    : pathname.startsWith(hrefPath);

                // Insert Jarvis FAB in the middle (index 2)
                if (idx === 2) {
                    return (
                        <React.Fragment key={`fab-wrapper-${idx}`}>
                            <Link
                                href={`${baseRoute}/jarvis?phone=${phone}`}
                                className="relative -mt-14 group"
                            >
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-300 transition-all active:scale-95 group-hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${brandColor}, #6366f1)`,
                                        border: '4px solid white'
                                    }}
                                >
                                    <Sparkles className="h-7 w-7 text-white animate-pulse" />
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -inset-1 rounded-full bg-indigo-500/20 -z-10 blur-xl group-hover:bg-indigo-500/30 transition-all"
                                    />
                                </div>
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">AIAURA</span>
                            </Link>
                            <NavItem key={item.label} item={item} isActive={isActive} brandColor={brandColor} />
                        </React.Fragment>
                    );
                }

                return <NavItem key={item.label} item={item} isActive={isActive} brandColor={brandColor} />;
            })}
        </motion.nav>
    );
}

function NavItem({ item, isActive, brandColor }: { item: any, isActive: boolean, brandColor: string }) {
    return (
        <Link href={item.href} className="relative flex-1 flex flex-col items-center justify-center py-0 px-1 group outline-none">
            <div className="relative z-10 flex flex-col items-center gap-1 transition-all duration-300">
                <motion.div
                    animate={{
                        y: isActive ? -4 : 0,
                        scale: isActive ? 1.1 : 1
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                    <item.icon
                        className="h-6 w-6 transition-colors duration-300"
                        style={{
                            color: isActive ? brandColor : "#ffffff",
                            opacity: isActive ? 1 : 0.5
                        }}
                    />
                </motion.div>
                <span
                    className={cn(
                        "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                        isActive ? "opacity-100 scale-100 mt-0" : "opacity-0 scale-75 -mt-1"
                    )}
                    style={{ color: isActive ? brandColor : "#ffffff" }}
                >
                    {item.label}
                </span>
            </div>

            {isActive && (
                <>
                    {/* Floating Indicator */}
                    <motion.div
                        layoutId="nav_active_dot"
                        className="absolute -top-1 h-1 w-1 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        style={{ backgroundColor: brandColor }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                        }}
                    />
                </>
            )}
        </Link>
    );
}
