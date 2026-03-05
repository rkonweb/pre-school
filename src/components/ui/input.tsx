import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, style, onFocus, onBlur, ...props }, ref) => {
        const [focused, setFocused] = React.useState(false);
        return (
            <input
                type={type}
                ref={ref}
                className={cn(
                    "flex w-full file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
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
                    width: "100%",
                    boxShadow: focused ? "0 0 0 4px rgba(245,158,11,0.15), 0 2px 8px rgba(245,158,11,0.1)" : "none",
                    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s",
                    ...style,
                }}
                onFocus={e => { setFocused(true); onFocus?.(e); }}
                onBlur={e => { setFocused(false); onBlur?.(e); }}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
export { Input };
