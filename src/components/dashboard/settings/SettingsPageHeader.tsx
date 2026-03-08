"use client";

import { LucideIcon } from "lucide-react";

const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81",
    orange: "#F97316",
    g400: "#9CA3AF", g500: "#6B7280",
};

interface SettingsPageHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    color?: string;
    bg?: string;
    badge?: string;
    action?: React.ReactNode;
}

export function SettingsPageHeader({
    icon: Icon,
    title,
    description,
    color = C.amber,
    bg = C.amberL,
    badge,
    action,
}: SettingsPageHeaderProps) {
    return (
        <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16, marginBottom: 28,
            padding: "24px 28px",
            background: "white",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            animation: "fadeUp 0.45s ease both",
            border: "1px solid #F3F4F6",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 15,
                    background: `linear-gradient(135deg,${color},${color}cc)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 6px 20px ${color}35`,
                    animation: "bounceIn 0.5s ease both",
                }}>
                    <Icon size={24} color="white" strokeWidth={2} />
                </div>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <h1 style={{
                            fontFamily: "'Sora',sans-serif",
                            fontSize: 22, fontWeight: 800,
                            color: C.navy, letterSpacing: -0.5, margin: 0,
                        }}>
                            {title}
                        </h1>
                        {badge && (
                            <span style={{
                                background: `linear-gradient(135deg,${C.amber},${C.orange})`,
                                color: "white", fontSize: 10, fontWeight: 800,
                                padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5,
                            }}>
                                {badge}
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{description}</p>
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

// ─── LOADING SPINNER (v3 style) ─────────────────────────────
export function SettingsLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "80px 40px", gap: 16,
            background: "white", borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid #F3F4F6",
        }}>
            <div style={{
                position: "relative", width: 48, height: 48,
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    border: `3px solid rgba(var(--brand-color-rgb, 245, 158, 11), 0.15)`,
                    borderTop: `3px solid var(--brand-color, ${C.amber})`,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
                <div style={{
                    position: "absolute", inset: 8,
                    border: `2px solid transparent`,
                    borderTop: `2px solid var(--brand-color, ${C.orange})`,
                    borderRadius: "50%",
                    animation: "spinReverse 0.6s linear infinite",
                    opacity: 0.6,
                }} />
            </div>
            <div style={{
                fontSize: 12, fontWeight: 700, color: C.g500,
                textTransform: "uppercase", letterSpacing: 1,
            }}>
                {message}
            </div>
            <style>{`
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes spinReverse{to{transform:rotate(-360deg)}}
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.85)}55%{transform:scale(1.05)}100%{transform:scale(1)}}
            `}</style>
        </div>
    );
}

// ─── ERROR STATE ─────────────────────────────────────────────
export function SettingsError({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 40px", gap: 16,
            background: "white", borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid #FEE2E2",
            textAlign: "center",
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "#FEF2F2",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
            }}>⚠️</div>
            <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6 }}>
                    Something went wrong
                </div>
                <p style={{ fontSize: 13, color: C.g500, maxWidth: 360 }}>{message}</p>
            </div>
            {onRetry && (
                <button onClick={onRetry} style={{
                    padding: "9px 22px", borderRadius: 11,
                    background: `var(--school-gradient, linear-gradient(135deg,${C.amber},${C.orange}))`,
                    color: "var(--secondary-color, white)", border: "none", cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                    fontSize: 13, fontWeight: 700,
                    boxShadow: `0 4px 14px rgba(var(--brand-color-rgb, 245, 158, 11), 0.35)`,
                }}>
                    Retry
                </button>
            )}
        </div>
    );
}
