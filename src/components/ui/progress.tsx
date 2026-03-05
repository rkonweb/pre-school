import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number; indicatorColor?: string }
>(({ className, value = 0, indicatorColor = "#F59E0B", style, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative overflow-hidden w-full", className)}
        style={{ height: 10, background: "#F3F4F6", borderRadius: 99, ...style }}
        {...props}
    >
        <div
            style={{
                position: "absolute",
                top: 0, left: 0, bottom: 0,
                width: `${Math.min(Math.max(value, 0), 100)}%`,
                background: `linear-gradient(90deg,${indicatorColor},${indicatorColor}cc)`,
                borderRadius: 99,
                transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                overflow: "hidden",
            }}
        >
            {/* Shimmer */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
        </div>
    </div>
));
Progress.displayName = "Progress";
export { Progress };
