import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "navy" | "purple"
}

const badgeVariants: Record<string, React.CSSProperties> = {
    default: { background: "#FEF3C7", color: "#D97706" },
    secondary: { background: "#EDE9FE", color: "#312E81" },
    destructive: { background: "#FEE2E2", color: "#991B1B" },
    outline: { background: "transparent", color: "#6B7280", border: "1.5px solid #E5E7EB" },
    success: { background: "#D1FAE5", color: "#065F46" },
    warning: { background: "#FEF3C7", color: "#D97706" },
    navy: { background: "#EDE9FE", color: "#1E1B4B" },
    purple: { background: "#EDE9FE", color: "#5B21B6" },
};

function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
    const vs = badgeVariants[variant] ?? badgeVariants.default;
    return (
        <div
            className={cn("inline-flex items-center gap-1 font-bold transition-colors", className)}
            style={{
                ...vs,
                borderRadius: 20,
                padding: "4px 11px",
                fontSize: 11.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: 0.2,
                ...style,
            }}
            {...props}
        />
    );
}

export { Badge }
