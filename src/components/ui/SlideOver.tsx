"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const C = {
    navy: "#1E1B4B", amber: "#F59E0B", orange: "#F97316",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g400: "#9CA3AF", g500: "#6B7280",
};

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, description, children }: SlideOverProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isMounted) return null;

    return createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 50, overflow: "hidden", pointerEvents: isOpen ? "auto" : "none" }}>
            {/* Backdrop */}
            <div
                style={{
                    position: "absolute", inset: 0,
                    background: "rgba(30,27,75,0.5)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.3s ease",
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div style={{ position: "absolute", inset: "0 0 0 auto", display: "flex", maxWidth: "100%", paddingLeft: 40, pointerEvents: "none" }}>
                <div style={{
                    pointerEvents: "auto",
                    width: "100%",
                    maxWidth: 460,
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                    display: "flex", flexDirection: "column", height: "100%",
                }}>
                    <div style={{ display: "flex", height: "100%", flexDirection: "column", background: "white", boxShadow: "-8px 0 48px rgba(0,0,0,0.18)" }}>
                        {/* Header */}
                        <div style={{ padding: "24px 24px 18px", borderBottom: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: C.navy }}>{title}</div>
                                {description && <div style={{ fontSize: 12.5, color: C.g400, marginTop: 3 }}>{description}</div>}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    width: 32, height: 32, borderRadius: 9,
                                    border: `1.5px solid ${C.g200}`,
                                    background: C.g50, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s ease", flexShrink: 0,
                                }}
                                onMouseEnter={e => { (e.currentTarget).style.background = "#FFFBEB"; (e.currentTarget).style.borderColor = C.amber; }}
                                onMouseLeave={e => { (e.currentTarget).style.background = C.g50; (e.currentTarget).style.borderColor = C.g200; }}
                            >
                                <span className="sr-only">Close panel</span>
                                <X size={14} color={C.g500} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
