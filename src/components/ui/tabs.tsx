import * as React from "react"
import { cn } from "@/lib/utils"

const C = {
    amber: "#F59E0B", amberD: "#D97706", orange: "#F97316",
    g100: "#F3F4F6", g500: "#6B7280",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("w-full", className)} {...props} />
    )
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, style, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("inline-flex items-center", className)}
            style={{
                background: C.g100,
                borderRadius: 12,
                padding: 4,
                gap: 6,
                marginBottom: 16,
                flexWrap: "wrap" as const,
                ...style,
            }}
            {...props}
        />
    )
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-state"?: string }
>(({ className, style, "data-state": dataState, ...props }, ref) => {
    const isActive = dataState === "active";
    return (
        <button
            ref={ref}
            className={cn("inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", className)}
            style={{
                padding: "8px 18px",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "white" : C.g500,
                background: isActive ? `linear-gradient(135deg,${C.amber},${C.orange})` : "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: 10,
                boxShadow: isActive ? `0 3px 12px ${C.amber}40` : "none",
                transform: isActive ? "scale(1.03)" : "scale(1)",
                transition: `all 0.35s ${C.spring}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                ...style,
            }}
            {...props}
        />
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string }>(
    ({ className, style, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("mt-2 focus-visible:outline-none", className)}
            style={{ animation: "fadeUp 0.25s ease", ...style }}
            {...props}
        />
    )
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
