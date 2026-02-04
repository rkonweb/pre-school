"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// Simplified Select for speed - mimics native select but styled often, 
// OR simpler: Just a wrapper around Radix. 
// Since I don't know if Radix is installed (it usually is in this stack), I'll make a Safe Select that falls back to HTML Select if Radix is missing?
// ACTUALLY, I will check what dependencies I have.
// In package.json I saw "@radix-ui/..." was NOT clearly listed in dependencies but I might have missed it or it's transitively there.
// Wait, I saw "@dnd-kit" etc.
// Let's assume standard shadcn assumes Radix.
// But to be SAFE and FAST, I'll implement a native-backed styled select, or a simple custom one. 
// BUT my code uses `Select, SelectTrigger, SelectContent...`. Those are Radix primitives.
// If I mock them, I need to mock the context.
// Better to check if `@radix-ui/react-select` is installed. 
// If not, I should likely install it or build a pure React version.
// Checking package.json...
// I saw dependencies in previous turn.
// dependencies: ... @prisma/client, lucide-react, next, react, recharts, sonner...
// NO RADIX UI PACKAGES LISTED.
// This is critical. Functionality will break if I import Radix.
// I MUST MOCK THE COMPONENT API used in my pages using standard React state.

// MOCK IMPLEMENTATION of Radix Select API using Headless UI / Plain React
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<any>(null)

export const Select = ({ children, value, onValueChange }: any) => {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = ({ children, className }: any) => {
    const { open, setOpen, value } = React.useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

export const SelectValue = ({ placeholder, children }: any) => {
    const { value } = React.useContext(SelectContext)
    return <span className="block truncate">{children || value || placeholder}</span>
}

export const SelectContent = ({ children, className }: any) => {
    const { open, setOpen } = React.useContext(SelectContext)
    if (!open) return null
    return (
        <>
            <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
            <div className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md animate-in fade-in-80 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 mt-1 w-full",
                className
            )}>
                <div className="p-1">{children}</div>
            </div>
        </>
    )
}

export const SelectItem = ({ children, value, onClick }: any) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext)
    return (
        <div
            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-zinc-100 focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50 hover:bg-zinc-100 cursor-pointer"
            onClick={() => {
                onValueChange(value)
                setOpen(false)
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {/* Indicator */}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
}
