"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, X, PlusSquare, Download } from "lucide-react";

export default function PWAInstallPrompt() {
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

    useEffect(() => {
        // Only show if not already installed (standalone)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        // Detect platform
        const ua = window.navigator.userAgent;
        const isIos = /iphone|ipad|ipod/.test(ua.toLowerCase());
        const isAndroid = /android/.test(ua.toLowerCase());

        setPlatform(isIos ? "ios" : isAndroid ? "android" : "other");

        // Check if previously dismissed
        const isDismissed = localStorage.getItem("pwa-prompt-dismissed");
        if (isDismissed) return;

        // Show prompt after a delay on mobile devices
        if (isIos || isAndroid) {
            const timer = setTimeout(() => setIsVisible(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa-prompt-dismissed", "true");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-safe left-4 right-4 z-[100] sm:hidden"
                >
                    <div className="bg-zinc-900 border border-zinc-800 text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -right-8 -top-8 h-24 w-24 bg-blue-600/20 rounded-full blur-2xl" />

                        <button
                            onClick={dismiss}
                            className="absolute top-4 right-4 h-8 w-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex gap-4 items-center">
                            <div className="h-14 w-14 bg-white text-zinc-900 rounded-2xl flex items-center justify-center font-black italic shadow-lg flex-shrink-0">
                                AV
                            </div>
                            <div className="space-y-1 pr-6">
                                <h3 className="text-lg font-black tracking-tight leading-tight">Install Parent Hub</h3>
                                <p className="text-zinc-400 text-xs font-medium">Add to home screen for the full native app experience.</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                            {platform === "ios" ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-bold">
                                        <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                            <Share className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span>Tap the &apos;Share&apos; button below</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold">
                                        <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                            <PlusSquare className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span>Select &apos;Add to Home Screen&apos;</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-sm font-bold">
                                    <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <Download className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <span>Open browser menu and tap &apos;Install App&apos;</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
