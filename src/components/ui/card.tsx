import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, style, ...props }, ref) => (
        <div ref={ref} className={cn("hover-lift", className)}
            style={{
                background: "white",
                borderRadius: 20,
                border: "1px solid #F3F4F6",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                animation: "fadeUp 0.45s ease both",
                overflow: "hidden",
                ...style,
            }}
            {...props}
        />
    )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, style, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5", className)}
            style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", ...style }}
            {...props}
        />
    )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, style, ...props }, ref) => (
        <h3 ref={ref} className={cn(className)}
            style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "#1E1B4B", letterSpacing: -0.3, lineHeight: 1.3, ...style }}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, style, ...props }, ref) => (
        <p ref={ref} className={cn(className)}
            style={{ fontSize: 12.5, color: "#9CA3AF", marginTop: 3, ...style }}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, style, ...props }, ref) => (
        <div ref={ref} className={cn(className)} style={{ padding: "20px 24px", ...style }} {...props} />
    )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, style, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center", className)}
            style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", ...style }}
            {...props}
        />
    )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
