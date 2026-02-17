"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

// Dialog MOCK
const DialogContext = React.createContext<any>(null)

export const Dialog = ({ open, onOpenChange, children }: any) => {
    // If controlled, use props. If not, use internal state.
    // For simplicity, mostly controlled usage in my code.
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isOpen = open !== undefined ? open : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    return (
        <DialogContext.Provider value={{ isOpen, setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

export const DialogTrigger = ({ asChild, children, onClick }: any) => {
    const { setOpen } = React.useContext(DialogContext)
    return (
        <div onClick={(e) => {
            if (onClick) onClick(e)
            setOpen(true)
        }}>
            {children}
        </div>
    )
}

export const DialogContent = ({ children, className }: any) => {
    const { isOpen, setOpen } = React.useContext(DialogContext)
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
            {/* Content */}
            <div className={cn(
                "relative z-50 grid w-full max-w-lg gap-4 border border-zinc-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-950",
                className
            )}>
                {children}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-500 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 dark:data-[state=open]:bg-zinc-800 dark:data-[state=open]:text-zinc-400"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
}

export const DialogHeader = ({ className, ...props }: any) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)

export const DialogTitle = ({ className, ...props }: any) => (
    <h3
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
)

export const DialogDescription = ({ className, ...props }: any) => (
    <p
        className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
        {...props}
    />
)

export const DialogFooter = ({ className, ...props }: any) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
)
