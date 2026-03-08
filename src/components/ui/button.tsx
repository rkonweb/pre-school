import * as React from "react"
import { cn } from "@/lib/utils"

const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81", g50: "#F9FAFB",
    g100: "#F3F4F6", g200: "#E5E7EB", g400: "#9CA3AF",
    g500: "#6B7280", green: "#10B981", greenL: "#D1FAE5",
    red: "#EF4444", redL: "#FEE2E2", nav: "#EDE9FE",
    blue: "#3B82F6", blueL: "#DBEAFE",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "navy" | "soft" | "brand"
    size?: "default" | "sm" | "lg" | "icon"
}

const variantStyles: Record<string, React.CSSProperties> = {
    default: { background: `linear-gradient(135deg,${C.amber},${C.amberD})`, color: "white", boxShadow: `0 4px 16px ${C.amber}45`, border: "none" },
    destructive: { background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "white", boxShadow: "0 4px 14px #EF444440", border: "none" },
    outline: { background: "transparent", color: C.amber, border: `1.5px solid ${C.amber}`, boxShadow: "none" },
    secondary: { background: "white", color: C.navy, border: `1.5px solid ${C.g200}`, boxShadow: C.sh },
    ghost: { background: "transparent", color: C.g500, border: "none", boxShadow: "none" },
    link: { background: "transparent", color: C.amber, border: "none", boxShadow: "none", textDecoration: "underline" },
    success: { background: `linear-gradient(135deg,${C.green},#059669)`, color: "white", boxShadow: `0 4px 14px ${C.green}40`, border: "none" },
    navy: { background: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", boxShadow: `0 4px 14px ${C.navy}40`, border: "none" },
    soft: { background: C.amberL, color: C.amberD, border: "none", boxShadow: "none" },
    brand: { background: "var(--school-gradient)", color: "var(--secondary-color)", boxShadow: "0 10px 25px -5px rgba(var(--brand-color-rgb), 0.4), 0 8px 10px -6px rgba(var(--brand-color-rgb), 0.2)", border: "none" },
};

const sizeStyles: Record<string, React.CSSProperties> = {
    default: { padding: "10px 20px", fontSize: 13.5, borderRadius: 12, height: "auto" },
    sm: { padding: "7px 14px", fontSize: 12, borderRadius: 9, height: "auto" },
    lg: { padding: "13px 26px", fontSize: 15, borderRadius: 14, height: "auto" },
    icon: { width: 36, height: 36, padding: 0, borderRadius: 10, fontSize: 14 },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", style, onMouseEnter, onMouseLeave, ...props }, ref) => {
        const vs = variantStyles[variant] ?? variantStyles.default;
        const ss = sizeStyles[size] ?? sizeStyles.default;

        return (
            <button
                ref={ref}
                className={cn("inline-flex items-center justify-center gap-1.5 font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)}
                style={{
                    ...vs, ...ss,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: 0.2,
                    transition: `all 0.4s ${C.spring}, filter 0.15s`,
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...style
                }}
                onMouseEnter={e => {
                    if (!props.disabled) {
                        (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
                    }
                    onMouseEnter?.(e);
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.filter = "none";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    onMouseLeave?.(e);
                }}
                {...props}
            />
        );
    }
);
Button.displayName = "Button"
export { Button }
