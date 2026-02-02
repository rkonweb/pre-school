"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function SlideOver({
    isOpen,
    onClose,
    title,
    description,
    children,
}: SlideOverProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isMounted) return null;

    return createPortal(
        <div
            className={cn(
                "fixed inset-0 z-50 overflow-hidden",
                isOpen ? "pointer-events-auto" : "pointer-events-none"
            )}
        >
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
                <div
                    className={cn(
                        "pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out sm:duration-300",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl dark:bg-zinc-950">
                        {/* Header */}
                        <div className="bg-zinc-50 px-4 py-6 dark:bg-zinc-900 sm:px-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
                                        {title}
                                    </h2>
                                    {description && (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                <div className="ml-3 flex h-7 items-center">
                                    <button
                                        type="button"
                                        className="relative rounded-md text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:text-zinc-300"
                                        onClick={onClose}
                                    >
                                        <span className="absolute -inset-2.5" />
                                        <span className="sr-only">Close panel</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative flex-1 px-4 py-6 sm:px-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
