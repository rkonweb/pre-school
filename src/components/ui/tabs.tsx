"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Tabs MOCK
const TabsContext = React.createContext<any>(null)

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: any) => {
    const [active, setActive] = React.useState(defaultValue)
    const current = value !== undefined ? value : active
    const change = onValueChange || setActive

    return (
        <TabsContext.Provider value={{ current, change }}>
            <div className={cn("", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

export const TabsList = ({ className, children }: any) => (
    <div
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            className
        )}
    >
        {children}
    </div>
)

export const TabsTrigger = ({ value, className, children }: any) => {
    const { current, change } = React.useContext(TabsContext)
    const isActive = current === value
    return (
        <button
            onClick={() => change(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50" : "hover:bg-zinc-200/50",
                className
            )}
        >
            {children}
        </button>
    )
}

export const TabsContent = ({ value, className, children }: any) => {
    const { current } = React.useContext(TabsContext)
    if (current !== value) return null
    return (
        <div
            className={cn(
                "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300",
                className
            )}
        >
            {children}
        </div>
    )
}
