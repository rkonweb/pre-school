"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LoadingOverlayProps {
    message?: string;
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 text-center"
            >
                <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <Sparkles className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    {/* Corner accents */}
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-400 border-4 border-white animate-bounce" />
                    <div className="absolute -bottom-2 -left-2 h-6 w-6 rounded-full bg-amber-400 border-4 border-white animate-bounce delay-100" />
                </div>

                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{message}</h2>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                className="h-1.5 w-1.5 rounded-full bg-indigo-600"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
