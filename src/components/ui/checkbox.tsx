"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock Checkbox
const Checkbox = React.forwardRef<HTMLInputElement, any>(
    ({ className, checked, onCheckedChange, ...props }, ref) => (
        <div className="flex items-center">
            <input
                type="checkbox"
                ref={ref}
                checked={checked}
                onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-200 border-zinc-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 dark:border-zinc-800 dark:border-zinc-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900",
                    className
                )}
                {...props}
            />
        </div>
    )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
