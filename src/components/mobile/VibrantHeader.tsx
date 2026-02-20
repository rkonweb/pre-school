"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search, BellRing, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VibrantHeaderProps {
    mode?: "dashboard" | "internal";
    title?: string;
    subtitle?: string;
    greetingName?: string;
    profileImage?: string;
    brandColor?: string;
    showBack?: boolean;
    backHref?: string;
    rightActions?: React.ReactNode;
    hideGreeting?: boolean;
    centerLogoUrl?: string;
    showMenu?: boolean;
    onMenuClick?: () => void;
}

export default function VibrantHeader({
    mode = "dashboard",
    title,
    subtitle,
    greetingName,
    profileImage,
    brandColor = "#6366f1",
    showBack = false,
    backHref,
    rightActions,
    hideGreeting = false,
    centerLogoUrl,
    showMenu = false,
    onMenuClick
}: VibrantHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <div className="relative w-full shrink-0 z-40 overflow-hidden pb-12">
            {/* Background Gradient & Shape */}
            <div
                className="absolute inset-x-0 top-0 h-[280px] transition-all duration-700"
                style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
                }}
            >
                {/* Wavy Bottom SVG */}
                <div className="absolute bottom-0 left-0 right-0 leading-[0]">
                    <svg
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        className="w-full h-[60px] text-[#F1F5F9] fill-current"
                    >
                        <path d="M0,96L80,117.3C160,139,320,181,480,181.3C640,181,800,139,960,122.7C1120,107,1280,117,1360,122.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>

                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Header Content */}
            <div className="relative z-10 px-6 pt-8 pb-4 text-white">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Branding or Back Button or Menu (Empty for Dashboard now) */}
                    <div className="flex items-center gap-4 flex-1">
                        {(mode === "internal" || showBack) && (
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleBack}
                                className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </motion.button>
                        )}

                        {(mode === "internal" && title) && (
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black tracking-tight leading-none drop-shadow-md">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">{subtitle}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Center: School Logo - Moved Downwards */}
                    {centerLogoUrl && (
                        <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 pt-16">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="h-20 w-auto flex items-center justify-center transform scale-125"
                            >
                                <img src={centerLogoUrl} alt="School Logo" className="h-full w-auto object-contain drop-shadow-2xl" />
                            </motion.div>
                        </div>
                    )}

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {rightActions ? rightActions : (
                            <>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
                                >
                                    <Search className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white relative"
                                >
                                    <BellRing className="h-5 w-5" />
                                    <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white" />
                                </motion.button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
