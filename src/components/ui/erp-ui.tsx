"use client";

/**
 * ERP UI Kit v3 — Shared Component Library
 * Design tokens: Amber (#F59E0B) + Navy (#1E1B4B) palette
 * Fonts: Sora (headings) + Plus Jakarta Sans (body)
 *
 * Usage: import { Btn, Badge, ErpCard, ErpModal, ... } from "@/components/ui/erp-ui"
 */

import React, { useState, useRef, useEffect } from "react";
import {
    Check, X, AlertCircle, Info, CheckCircle, AlertTriangle,
    ChevronDown, ChevronLeft, ChevronRight, MoreVertical,
    ArrowUp, ArrowDown, ArrowUpDown, Edit2, Trash2, Eye,
    EyeOff, LucideIcon, Loader2
} from "lucide-react";
import Link from "next/link";

// ─── DESIGN TOKENS ──────────────────────────────────────────
export const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81", navyL: "#EDE9FE",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE", blueXL: "#EFF6FF",
    orange: "#F97316", orangeL: "#FFEDD5",
    purple: "#8B5CF6", purpleL: "#EDE9FE",
    pink: "#EC4899", pinkL: "#FCE7F3",
    teal: "#14B8A6", tealL: "#CCFBF1",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    shL: "0 16px 48px rgba(0,0,0,0.18)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── BUTTON ────────────────────────────────────────────────
const BV: Record<string, { bg: string; color: string; border?: string; sh: string }> = {
    primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", sh: `0 4px 16px ${C.amber}45` },
    secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
    ghost: { bg: "transparent", color: C.g500, sh: "none" },
    danger: { bg: `linear-gradient(135deg,${C.red},#DC2626)`, color: "white", sh: `0 4px 14px ${C.red}40` },
    success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
    navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", sh: `0 4px 14px ${C.navy}40` },
    outline: { bg: "transparent", color: C.amber, border: `1.5px solid ${C.amber}`, sh: "none" },
    soft: { bg: C.amberL, color: C.amberD, sh: "none" },
};
const BS: Record<string, { p: string; fs: number; r: number }> = {
    sm: { p: "7px 14px", fs: 12, r: 9 },
    md: { p: "10px 20px", fs: 13.5, r: 12 },
    lg: { p: "13px 26px", fs: 15, r: 14 },
};

interface BtnProps {
    variant?: keyof typeof BV;
    size?: keyof typeof BS;
    icon?: any;
    iconPos?: "left" | "right";
    loading?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    fullWidth?: boolean;
    type?: "button" | "submit" | "reset";
    title?: string;
    className?: string;
}

export const Btn = ({
    variant = "primary", size = "md", icon, iconPos = "left",
    loading, disabled, children, onClick, fullWidth, type = "button", title, className
}: BtnProps) => {
    const Icon = icon as any;
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const v = BV[variant] ?? BV.primary;
    const s = BS[size] ?? BS.md;
    const dis = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (dis) return;
        const rect = ref.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(r => [...r, { id, x, y }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.();
    };

    return (
        <>
            <style>{`.erp-btn:not(:disabled):hover{filter:brightness(1.08);transform:translateY(-2px) scale(1.03)}.erp-btn{transition:filter 0.15s,transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}`}</style>
            <button
                ref={ref} type={type} disabled={!!dis} onClick={handleClick} title={title}
                className={`erp-btn${className ? ` ${className}` : ""}`}
                style={{
                    background: dis ? C.g100 : v.bg,
                    color: dis ? C.g400 : v.color,
                    border: v.border ?? "none",
                    borderRadius: s.r,
                    padding: s.p,
                    fontSize: s.fs,
                    fontWeight: 700,
                    cursor: dis ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    boxShadow: dis ? "none" : v.sh,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    width: fullWidth ? "100%" : "auto",
                    opacity: dis ? 0.55 : 1,
                    letterSpacing: 0.2,
                    position: "relative",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                }}
            >
                {ripples.map(rp => (
                    <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />
                ))}
                {loading
                    ? <Loader2 style={{ width: s.fs, height: s.fs, animation: "spin 0.7s linear infinite" }} />
                    : (icon && iconPos === "left" ? (typeof icon === 'function' || (typeof icon === 'object' && 'render' in icon) ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : icon) : null)}
                {children}
                {!loading && icon && iconPos === "right" && (typeof icon === 'function' || (typeof icon === 'object' && 'render' in icon) ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : icon)}
            </button>
        </>
    );
};

// ─── BADGE ─────────────────────────────────────────────────
const bcMap: Record<string, { bg: string; color: string; dot: string }> = {
    amber: { bg: C.amberL, color: C.amberD, dot: C.amber },
    green: { bg: C.greenL, color: "#065F46", dot: C.green },
    red: { bg: C.redL, color: "#991B1B", dot: C.red },
    blue: { bg: C.blueL, color: "#1D4ED8", dot: C.blue },
    purple: { bg: C.purpleL, color: "#5B21B6", dot: C.purple },
    gray: { bg: C.g100, color: C.g600, dot: C.g400 },
    navy: { bg: C.navyL, color: C.navyM, dot: C.navy },
    pink: { bg: C.pinkL, color: "#9D174D", dot: C.pink },
    teal: { bg: C.tealL, color: "#0F766E", dot: C.teal },
    orange: { bg: C.orangeL, color: "#C2410C", dot: C.orange },
};

interface BadgeErpProps {
    label?: React.ReactNode;
    color?: keyof typeof bcMap;
    icon?: LucideIcon;
    dot?: boolean;
    removable?: boolean;
    pulse?: boolean;
    size?: "sm" | "lg";
}

export const Badge = ({ label, color = "amber", icon: Icon, dot, removable, pulse: doPulse, size = "sm" }: BadgeErpProps) => {
    const [vis, setVis] = useState(true);
    if (!vis) return null;
    const bc = bcMap[color] ?? bcMap.amber;
    const fs = size === "lg" ? 13.5 : 11.5;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bc.bg, color: bc.color, borderRadius: 20, padding: size === "lg" ? "6px 14px" : "4px 11px", fontSize: fs, fontWeight: 700, letterSpacing: 0.2 }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: bc.dot, animation: doPulse ? "orbitPulse 1.5s ease-in-out infinite" : undefined }} />}
            {Icon && <Icon size={11} strokeWidth={2.5} />}
            {label}
            {removable && <X size={10} style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => setVis(false)} />}
        </span>
    );
};

// ─── STATUS CHIP ───────────────────────────────────────────
const statusMap: Record<string, { bg: string; color: string }> = {
    Active: { bg: C.greenL, color: "#065F46" },
    Inactive: { bg: C.redL, color: "#991B1B" },
    Paid: { bg: C.greenL, color: "#065F46" },
    Pending: { bg: C.redL, color: "#991B1B" },
    Partial: { bg: C.amberL, color: C.amberD },
    Present: { bg: C.greenL, color: "#065F46" },
    Absent: { bg: C.redL, color: "#991B1B" },
    Late: { bg: C.amberL, color: C.amberD },
    Leave: { bg: C.blueL, color: "#1D4ED8" },
    OnTime: { bg: C.greenL, color: "#065F46" },
    Delayed: { bg: C.redL, color: "#991B1B" },
    Open: { bg: C.amberL, color: C.amberD },
    Closed: { bg: C.g100, color: C.g600 },
    Draft: { bg: C.blueL, color: "#1D4ED8" },
    Approved: { bg: C.greenL, color: "#065F46" },
    Rejected: { bg: C.redL, color: "#991B1B" },
    Enrolled: { bg: C.greenL, color: "#065F46" },
    Completed: { bg: C.greenL, color: "#065F46" },
    Cancelled: { bg: C.redL, color: "#991B1B" },
};

export const StatusChip = ({ label }: { label: string }) => {
    const s = statusMap[label] ?? { bg: C.g100, color: C.g600 };
    return (
        <span style={{ ...s, borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
            {label}
        </span>
    );
};

// ─── ALERT ─────────────────────────────────────────────────
interface AlertErpProps {
    type?: "info" | "success" | "warning" | "error";
    title?: string;
    message: string;
    dismissible?: boolean;
}

export const Alert = ({ type = "info", title, message, dismissible }: AlertErpProps) => {
    const [vis, setVis] = useState(true);
    if (!vis) return null;
    const m = {
        info: { bg: C.blueXL, border: C.blue, color: "#1D4ED8", icon: Info, iconBg: C.blueL },
        success: { bg: C.greenXL, border: C.green, color: "#065F46", icon: CheckCircle, iconBg: C.greenL },
        warning: { bg: C.amberXL, border: C.amber, color: C.amberD, icon: AlertTriangle, iconBg: C.amberL },
        error: { bg: C.redXL, border: C.red, color: "#991B1B", icon: AlertCircle, iconBg: C.redL },
    }[type];
    const Ic = m.icon;
    return (
        <div style={{ background: m.bg, border: `1.5px solid ${m.border}30`, borderLeft: `4px solid ${m.border}`, borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: 12, animation: "fadeUp 0.35s ease" }}>
            <div style={{ background: m.iconBg, borderRadius: 8, padding: 6, flexShrink: 0 }}><Ic size={15} color={m.border} /></div>
            <div style={{ flex: 1 }}>
                {title && <div style={{ fontSize: 13.5, fontWeight: 700, color: m.color, marginBottom: 2 }}>{title}</div>}
                <div style={{ fontSize: 12.5, color: m.color, opacity: 0.85 }}>{message}</div>
            </div>
            {dismissible && <X size={15} color={m.color} style={{ cursor: "pointer", opacity: 0.6, flexShrink: 0 }} onClick={() => setVis(false)} />}
        </div>
    );
};

// ─── CARD ──────────────────────────────────────────────────
interface ErpCardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    noPad?: boolean;
    hover?: boolean;
}

export const ErpCard = ({ children, className, style, noPad, hover }: ErpCardProps) => (
    <div
        className={`${hover ? "hover-lift" : ""} ${className ?? ""}`}
        style={{ background: "white", borderRadius: 20, padding: noPad ? 0 : "24px 24px", boxShadow: C.sh, border: `1px solid ${C.g100}`, animation: "fadeUp 0.45s ease both", overflow: noPad ? "hidden" : undefined, ...style }}
    >
        {children}
    </div>
);

// ─── SECTION HEADER ────────────────────────────────────────
interface SectionHeaderProps {
    icon?: any;
    title: string;
    subtitle?: string;
    color?: string;
    badge?: string;
    action?: React.ReactNode;
}

export const SectionHeader = ({ icon, title, subtitle, color = C.amber, badge, action }: SectionHeaderProps) => {
    const renderIcon = () => {
        if (!icon) return null;
        if (typeof icon === 'function' || (typeof icon === 'object' && 'render' in icon)) {
            const Icon = icon as any;
            return <Icon size={18} color={color} />;
        }
        return icon as React.ReactNode;
    };

    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {icon && (
                    <div style={{ background: `${color}20`, borderRadius: 10, padding: "7px 8px", display: "flex", flexShrink: 0 }}>
                        {renderIcon()}
                    </div>
                )}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: C.navy }}>{title}</span>
                        {badge && (
                            <span style={{ background: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{badge}</span>
                        )}
                    </div>
                    {subtitle && <p style={{ fontSize: 12.5, color: C.g400, marginTop: 2 }}>{subtitle}</p>}
                </div>
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
    );
};

// ─── INPUT ─────────────────────────────────────────────────
interface ErpInputProps {
    label?: string;
    placeholder?: string;
    type?: string;
    icon?: LucideIcon;
    state?: "error" | "success" | "warning";
    helperText?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    prefix?: string;
    suffix?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    name?: string;
    className?: string;
}

export const ErpInput = ({ label, placeholder, type = "text", icon: Icon, state, helperText, required, value, onChange, prefix, suffix, disabled, size = "md", name, className }: ErpInputProps) => {
    const [focused, setFocused] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const bColor = state === "error" ? C.red : state === "success" ? C.green : state === "warning" ? C.amber : focused ? C.amber : C.g200;
    const bg = state === "error" ? C.redXL : state === "success" ? C.greenXL : focused ? C.amberXL : C.g50;
    const pMap = { sm: "8px 12px", md: "11px 14px", lg: "14px 16px" };
    const fsMap = { sm: 12.5, md: 13.5, lg: 15 };

    return (
        <div style={{ width: "100%" }} className={className}>
            {label && (
                <label style={{ fontSize: 12.5, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6 }}>
                    {label}{required && <span style={{ color: C.red }}> *</span>}
                </label>
            )}
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: disabled ? C.g100 : bg, border: `1.5px solid ${bColor}`, borderRadius: 12, transition: `${C.tr}, box-shadow 0.25s`, boxShadow: focused ? `0 0 0 4px ${C.amber}20, 0 2px 8px ${C.amber}15` : "none", opacity: disabled ? 0.6 : 1 }}>
                {prefix && <span style={{ padding: "0 0 0 14px", fontSize: 13, color: C.g400, fontWeight: 600, whiteSpace: "nowrap" }}>{prefix}</span>}
                {Icon && <span style={{ padding: "0 0 0 12px", display: "flex" }}><Icon size={15} color={focused ? C.amber : C.g400} /></span>}
                <input
                    type={type === "password" ? (showPw ? "text" : "password") : type}
                    placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} name={name}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: pMap[size], fontSize: fsMap[size], color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: (Icon || prefix) ? 8 : undefined, fontWeight: 500, minWidth: 0 }}
                />
                {suffix && <span style={{ padding: "0 14px 0 0", fontSize: 13, color: C.g400, fontWeight: 600 }}>{suffix}</span>}
                {type === "password" && (
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", padding: "0 12px", cursor: "pointer", display: "flex", color: C.g400 }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                )}
                {state === "error" && <span style={{ padding: "0 10px 0 0", display: "flex" }}><AlertCircle size={15} color={C.red} /></span>}
                {state === "success" && <span style={{ padding: "0 10px 0 0", display: "flex" }}><CheckCircle size={15} color={C.green} /></span>}
            </div>
            {helperText && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: 11.5, color: state === "error" ? C.red : state === "success" ? C.green : C.g400, fontWeight: 500 }}>
                    {state === "error" && <AlertCircle size={11} />}
                    {state === "success" && <CheckCircle size={11} />}
                    {helperText}
                </div>
            )}
        </div>
    );
};

// ─── PROGRESS BAR ──────────────────────────────────────────
interface ProgressBarProps {
    value: number;
    color?: string;
    label?: string;
    animated?: boolean;
    striped?: boolean;
}

export const ProgressBar = ({ value, color = C.amber, label, animated, striped }: ProgressBarProps) => {
    const [width, setWidth] = useState(0);
    useEffect(() => { const t = setTimeout(() => setWidth(value), 100); return () => clearTimeout(t); }, [value]);
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                {label && <span style={{ fontSize: 12.5, fontWeight: 600, color: C.g600 }}>{label}</span>}
                <span style={{ fontSize: 12.5, fontWeight: 800, color }}>{value}%</span>
            </div>
            <div style={{ height: 10, background: C.g100, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 99, transition: "width 1.4s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", overflow: "hidden" }}>
                    {animated && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />}
                    {striped && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.15) 8px,rgba(255,255,255,0.15) 16px)" }} />}
                </div>
            </div>
        </div>
    );
};

// ─── SKELETON ──────────────────────────────────────────────
export const Skeleton = ({ width = "100%", height = 16, radius = 8, circle }: { width?: string | number; height?: number; radius?: number; circle?: boolean }) => (
    <div style={{ width: circle ? height : width, height, borderRadius: circle ? "50%" : radius, background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.6s infinite", flexShrink: 0 }} />
);

export const SkeletonCard = () => (
    <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: C.sh }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Skeleton width={44} height={44} circle />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={11} />
            </div>
        </div>
        <Skeleton width="100%" height={10} radius={4} />
        <div style={{ height: 8 }} />
        <Skeleton width="80%" height={10} radius={4} />
        <div style={{ height: 8 }} />
        <Skeleton width="90%" height={10} radius={4} />
    </div>
);

export const DashboardLoader = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: C.sh, animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                        <Skeleton width={40} height={40} circle />
                        <Skeleton width={60} height={20} radius={10} />
                    </div>
                    <Skeleton width="80%" height={28} radius={6} />
                    <div style={{ height: 8 }} />
                    <Skeleton width="50%" height={11} radius={4} />
                </div>
            ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: C.sh }}>
                <Skeleton width="40%" height={18} radius={6} />
                <div style={{ height: 16 }} />
                <Skeleton width="100%" height={180} radius={10} />
            </div>
            <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: C.sh }}>
                <Skeleton width="50%" height={18} radius={6} />
                <div style={{ height: 16 }} />
                {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <Skeleton width={32} height={32} circle />
                        <div style={{ flex: 1 }}>
                            <Skeleton width="70%" height={12} radius={4} />
                            <div style={{ height: 6 }} />
                            <Skeleton width="40%" height={10} radius={4} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─── MODAL ─────────────────────────────────────────────────
interface ErpModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: number;
    danger?: boolean;
}

export const ErpModal = ({ open, onClose, title, subtitle, icon: Icon, iconColor = C.amber, children, footer, maxWidth = 500, danger }: ErpModalProps) => {
    if (!open) return null;
    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.6)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", animation: "fadeIn 0.2s ease" }}
            onClick={onClose}
        >
            <div
                style={{ background: "white", borderRadius: 24, padding: 32, width: "90%", maxWidth, boxShadow: C.shL, animation: danger ? "bounceIn 0.4s ease" : "scaleIn 0.3s ease" }}
                onClick={e => e.stopPropagation()}
            >
                {(title || Icon) && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {Icon && (
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", animation: "bounceIn 0.4s ease" }}>
                                    <Icon size={20} color={iconColor} />
                                </div>
                            )}
                            <div>
                                {title && <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: C.navy, marginBottom: 2 }}>{title}</h2>}
                                {subtitle && <p style={{ fontSize: 13, color: C.g400 }}>{subtitle}</p>}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                            <X size={15} color={C.g500} />
                        </button>
                    </div>
                )}
                {children}
                {footer && <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>{footer}</div>}
            </div>
        </div>
    );
};

// ─── SLIDE-OVER ────────────────────────────────────────────
interface ErpSlideOverProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: number;
}

export const ErpSlideOver = ({ open, onClose, title, subtitle, icon: Icon, children, footer, width = 440 }: ErpSlideOverProps) => {
    if (!open) return null;
    return (
        <>
            <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.4)", zIndex: 9990, animation: "fadeIn 0.25s ease", backdropFilter: "blur(3px)" }} onClick={onClose} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width, background: "white", zIndex: 9991, boxShadow: "-8px 0 48px rgba(0,0,0,0.18)", animation: "slideLeft 0.35s ease", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "24px 24px 18px", borderBottom: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        {Icon && (
                            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${C.amber},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={18} color="white" />
                            </div>
                        )}
                        <div>
                            {title && <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: C.navy }}>{title}</div>}
                            {subtitle && <div style={{ fontSize: 12, color: C.g400 }}>{subtitle}</div>}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={14} color={C.g500} />
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>{children}</div>
                {footer && <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.g100}`, display: "flex", gap: 10 }}>{footer}</div>}
            </div>
        </>
    );
};

// ─── DROPDOWN MENU ─────────────────────────────────────────
interface DropdownItem {
    label?: string;
    icon?: LucideIcon;
    onClick?: () => void;
    danger?: boolean;
    divider?: boolean;
}

interface ErpDropdownMenuProps {
    items: DropdownItem[];
    align?: "left" | "right";
    trigger?: React.ReactNode;
}

export const ErpDropdownMenu = ({ items, align = "right", trigger }: ErpDropdownMenuProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
        <div style={{ position: "relative" }} ref={ref}>
            {trigger ? (
                <div onClick={() => setOpen(v => !v)} style={{ cursor: "pointer" }}>{trigger}</div>
            ) : (
                <button onClick={() => setOpen(v => !v)} style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${C.g200}`, background: open ? C.amberXL : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: C.tr }}>
                    <MoreVertical size={15} color={open ? C.amber : C.g500} />
                </button>
            )}
            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", ...(align === "right" ? { right: 0 } : { left: 0 }), width: 190, background: "white", borderRadius: 16, boxShadow: C.shM, border: `1.5px solid ${C.g100}`, zIndex: 997, overflow: "hidden", animation: "scaleIn 0.18s ease" }}>
                    <style>{`.erp-dd-item:hover{background:var(--dd-hover-bg,#F9FAFB)}.erp-dd-item-danger:hover{background:#FEF2F2}`}</style>
                    {items.map((item, i) =>
                        item.divider ? (
                            <div key={i} style={{ height: 1, background: C.g100, margin: "4px 0" }} />
                        ) : (
                            <div
                                key={i}
                                onClick={() => { item.onClick?.(); setOpen(false); }}
                                className={item.danger ? "erp-dd-item erp-dd-item-danger" : "erp-dd-item"}
                                style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, color: item.danger ? C.red : C.g700, fontWeight: 500, transition: C.tr, animation: `slideRight 0.2s ease ${i * 0.04}s both` }}
                            >
                                {item.icon && <item.icon size={14} color={item.danger ? C.red : C.g400} />}
                                {item.label}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

// ─── TABS ──────────────────────────────────────────────────
interface TabItem {
    label: string;
    content?: React.ReactNode;
    icon?: LucideIcon;
}

interface ErpTabsProps {
    tabs: TabItem[];
    variant?: "pill" | "underline";
    active?: number;
    onChange?: (i: number) => void;
}

export const ErpTabs = ({ tabs, variant = "pill", active: externalActive, onChange }: ErpTabsProps) => {
    const [internal, setInternal] = useState(0);
    const active = externalActive !== undefined ? externalActive : internal;
    const setActive = (i: number) => { setInternal(i); onChange?.(i); };
    return (
        <div>
            <div style={{ display: "flex", gap: variant === "underline" ? 0 : 6, borderBottom: variant === "underline" ? `2px solid ${C.g100}` : "none", background: variant === "pill" ? C.g100 : "transparent", borderRadius: variant === "pill" ? 12 : 0, width: "fit-content", padding: variant === "pill" ? "4px" : "0", marginBottom: 18, flexWrap: "wrap" }}>
                {tabs.map((t, i) => (
                    <button
                        key={i} onClick={() => setActive(i)}
                        style={{ padding: variant === "underline" ? "10px 18px" : "8px 18px", fontSize: 13.5, fontWeight: i === active ? 700 : 500, color: i === active ? (variant === "underline" ? C.amber : "white") : C.g500, background: i === active ? (variant === "underline" ? "transparent" : `linear-gradient(135deg,${C.amber},${C.orange})`) : "transparent", border: "none", cursor: "pointer", borderRadius: variant === "underline" ? 0 : 10, borderBottom: variant === "underline" ? `2px solid ${i === active ? C.amber : "transparent"}` : "none", marginBottom: variant === "underline" ? -2 : 0, transition: `all 0.35s ${C.spring}`, boxShadow: i === active && variant === "pill" ? `0 3px 12px ${C.amber}40` : "none", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {t.icon && <t.icon size={14} />}
                        {t.label}
                    </button>
                ))}
            </div>
            {tabs[active]?.content && <div style={{ animation: "fadeUp 0.25s ease" }}>{tabs[active].content}</div>}
        </div>
    );
};

// ─── TABLE UTILITIES (for use in module pages) ─────────────
export const tableStyles = {
    container: { borderRadius: 20, border: `1px solid ${C.g100}`, overflow: "hidden" as const, boxShadow: C.sh },
    thead: { background: `linear-gradient(135deg,${C.navy},${C.navyM})` },
    th: { padding: "12px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, textTransform: "uppercase" as const, cursor: "pointer", userSelect: "none" as const, whiteSpace: "nowrap" as const },
    thNoSort: { padding: "12px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, textTransform: "uppercase" as const },
    rowEven: { background: "white", borderBottom: `1px solid ${C.g100}`, transition: C.tr },
    rowOdd: { background: C.g50, borderBottom: `1px solid ${C.g100}`, transition: C.tr },
    td: { padding: "11px 14px", fontSize: 13.5, color: C.g700 },
};

export const SortIcon = ({ col, sortCol, sortDir }: { col: string; sortCol: string; sortDir: string }) => {
    if (col !== sortCol) return <ArrowUpDown size={10} color="rgba(255,255,255,0.35)" style={{ display: "inline", marginLeft: 4 }} />;
    return sortDir === "asc"
        ? <ArrowUp size={11} color="white" style={{ display: "inline", marginLeft: 4 }} />
        : <ArrowDown size={11} color="white" style={{ display: "inline", marginLeft: 4 }} />;
};

// ─── ACTION BUTTONS (edit / delete row icons) ──────────────
export interface RowActionsProps {
    onView?: string | (() => void);
    onEdit?: string | (() => void);
    onDelete?: () => void;
    viewTooltip?: string;
    editTooltip?: string;
    deleteTooltip?: string;
    deleteTitle?: string;
    extra?: React.ReactNode;
}

export const RowActions = ({ onView, onEdit, onDelete, viewTooltip = "View", editTooltip = "Edit", deleteTooltip = "Delete", extra }: RowActionsProps) => {
    const renderAction = (type: "view" | "edit" | "delete", handler?: string | (() => void), tooltip?: string) => {
        if (!handler) return null;

        const isDelete = type === "delete";
        const isView = type === "view";
        const baseColor = isDelete ? C.red : (isView ? C.blue : C.amber);
        const Icon = isDelete ? Trash2 : (isView ? Eye : Edit2);
        const className = `erp-row-action erp-row-action-${type}`;

        const content = (
            <div title={tooltip} className={className} style={{ width: 30, height: 30, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: C.tr }}>
                <Icon size={13} color={baseColor} />
            </div>
        );

        if (typeof handler === "string") {
            return <Link href={handler} key={type}>{content}</Link>;
        }
        return <div key={type} onClick={handler as () => void}>{content}</div>;
    };

    return (
        <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
            <style>{`.erp-row-action:hover{border-color:currentcolor!important}.erp-row-action-delete:hover{background:${C.redXL}!important;color:${C.red}!important}.erp-row-action-view:hover{background:${C.blueL}!important;color:${C.blue}!important}.erp-row-action-edit:hover{background:${C.amberXL}!important;color:${C.amber}!important}`}</style>
            {renderAction("view", onView, viewTooltip)}
            {renderAction("edit", onEdit, editTooltip)}
            {renderAction("delete", onDelete, deleteTooltip)}
            {extra}
        </div>
    );
};

// ─── DIVIDER ───────────────────────────────────────────────
export const Divider = () => (
    <div style={{ height: 1, background: `linear-gradient(90deg,${C.amber}30,${C.g200},transparent)`, margin: "20px 0" }} />
);

// ─── PAGE WRAPPER (gradient background) ────────────────────
export const PageWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F0EFF8 0%,#FAFAFA 60%,#FFF8F0 100%)", padding: "32px 40px" }}>
        {children}
    </div>
);
