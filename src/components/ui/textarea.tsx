import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, style, onFocus, onBlur, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false);
        return (
            <textarea
                className={cn("flex w-full min-h-[80px] resize-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-gray-400", className)}
                style={{
                    background: focused ? "#FFFBEB" : "#F9FAFB",
                    border: `1.5px solid ${focused ? "#F59E0B" : "#E5E7EB"}`,
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 13.5,
                    color: "#1F2937",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 500,
                    outline: "none",
                    boxShadow: focused ? "0 0 0 4px rgba(245,158,11,0.15)" : "none",
                    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                    ...style,
                }}
                ref={ref}
                onFocus={e => { setFocused(true); onFocus?.(e); }}
                onBlur={e => { setFocused(false); onBlur?.(e); }}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
export { Textarea };
