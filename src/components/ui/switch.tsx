"use client"
import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, style, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn("peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-200", className)}
    style={{
      width: 46, height: 26,
      borderRadius: 13,
      transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      ...style,
    }}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn("pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5")}
      style={{
        width: 18, height: 18,
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
