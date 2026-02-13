"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<any>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left" ref={containerRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: () => setIsOpen(!isOpen),
        });
    }

    return (
        <button onClick={() => setIsOpen(!isOpen)}>
            {children}
        </button>
    );
}

export function DropdownMenuContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const { isOpen } = React.useContext(DropdownMenuContext);
    if (!isOpen) return null;

    return (
        <div className={cn(
            "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none",
            className
        )}>
            {children}
        </div>
    );
}

export function DropdownMenuItem({ children, className, onClick, asChild }: { children: React.ReactNode; className?: string; onClick?: () => void; asChild?: boolean }) {
    const { setIsOpen } = React.useContext(DropdownMenuContext);

    const handleClick = () => {
        if (onClick) onClick();
        setIsOpen(false);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            className: cn("block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors", className),
            onClick: handleClick,
        });
    }

    return (
        <button
            onClick={handleClick}
            className={cn("block w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors", className)}
        >
            {children}
        </button>
    );
}
