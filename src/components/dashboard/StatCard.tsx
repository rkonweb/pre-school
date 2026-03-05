"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    trend?: {
        value: number | string;
        isPositive: boolean;
    };
    icon: LucideIcon;
    color?: "blue" | "green" | "purple" | "orange" | "red" | "zinc" | "brand";
}

const colorMap: Record<string, { iconBg: string; iconColor: string; shadow: string }> = {
    brand: { iconBg: "rgba(245,158,11,0.12)", iconColor: "#D97706", shadow: "rgba(245,158,11,0.18)" },
    blue: { iconBg: "rgba(59,130,246,0.12)", iconColor: "#2563EB", shadow: "rgba(59,130,246,0.18)" },
    green: { iconBg: "rgba(16,185,129,0.12)", iconColor: "#059669", shadow: "rgba(16,185,129,0.18)" },
    purple: { iconBg: "rgba(139,92,246,0.12)", iconColor: "#7C3AED", shadow: "rgba(139,92,246,0.18)" },
    orange: { iconBg: "rgba(249,115,22,0.12)", iconColor: "#EA580C", shadow: "rgba(249,115,22,0.18)" },
    red: { iconBg: "rgba(239,68,68,0.12)", iconColor: "#DC2626", shadow: "rgba(239,68,68,0.18)" },
    zinc: { iconBg: "rgba(113,113,122,0.12)", iconColor: "#52525B", shadow: "rgba(113,113,122,0.18)" },
};

export function StatCard({ title, value, subValue, trend, icon: Icon, color = "brand" }: StatCardProps) {
    const c = colorMap[color] ?? colorMap.brand;

    return (
        <div
            className="hover-lift"
            style={{
                background: "white",
                borderRadius: 20,
                padding: "20px 22px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                border: "1px solid #F3F4F6",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Subtle tinted corner glow */}
            <div style={{
                position: "absolute", bottom: -16, right: -16,
                width: 64, height: 64, borderRadius: "50%",
                background: c.iconBg, filter: "blur(18px)", pointerEvents: "none"
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                {/* Icon */}
                <div
                    className="wiggle-hover"
                    style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: c.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <Icon style={{ width: 20, height: 20, color: c.iconColor }} />
                </div>

                {/* Trend Badge */}
                {trend ? (
                    <span style={{
                        fontSize: 11.5, fontWeight: 700,
                        color: trend.isPositive ? "#059669" : "#DC2626",
                        background: trend.isPositive ? "#ECFDF5" : "#FEF2F2",
                        borderRadius: 20, padding: "3px 9px",
                        display: "flex", alignItems: "center", gap: 3,
                    }}>
                        {trend.isPositive
                            ? <TrendingUp style={{ width: 11, height: 11 }} />
                            : <TrendingDown style={{ width: 11, height: 11 }} />}
                        {trend.isPositive ? "+" : ""}{typeof trend.value === "number" ? `${trend.value}%` : trend.value}
                    </span>
                ) : null}
            </div>

            {/* Value */}
            <div
                className="countUp-anim"
                style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 26, fontWeight: 800,
                    color: "#1E1B4B",
                    letterSpacing: -1, marginBottom: 2,
                }}
            >
                {value}
            </div>

            {/* Label + subvalue */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, color: "#9CA3AF", fontWeight: 500 }}>{title}</span>
                {subValue && (
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{subValue}</span>
                )}
            </div>
        </div>
    );
}
