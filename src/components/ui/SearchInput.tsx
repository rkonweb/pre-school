"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // Assuming this hook exists, or I will create it
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchInputProps {
    onSearch: (term: string) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    suggestions?: any[]; // Optional suggestions to display
    onSuggestionClick?: (suggestion: any) => void;
    isLoading?: boolean;
}

export function SearchInput({
    onSearch,
    placeholder = "Search...",
    className,
    defaultValue = "",
    suggestions = [],
    onSuggestionClick,
    isLoading = false
}: SearchInputProps) {
    const [searchTerm, setSearchTerm] = useState(defaultValue);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce the search callback
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div className="relative">
                <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors", isFocused ? "text-brand" : "text-zinc-400")} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full rounded-xl border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm transition-all outline-none border",
                        "focus:ring-2 focus:ring-brand/20 focus:border-brand",
                        "placeholder:text-zinc-400 text-zinc-900",
                        "dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-brand"
                    )}
                />

                {searchTerm && (
                    <button
                        onClick={() => { setSearchTerm(""); onSearch(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-50 dark:bg-zinc-900">
                        <Loader2 className="h-4 w-4 animate-spin text-brand" />
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && searchTerm.length > 1 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {suggestions.map((item, index) => (
                            <div
                                key={item.id || index}
                                onClick={() => {
                                    if (onSuggestionClick) {
                                        onSuggestionClick(item);
                                        setIsFocused(false);
                                        setSearchTerm(item.name || item.fullName || item.parentName || "");
                                    }
                                }}
                                className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
                            >
                                {item.avatar && (
                                    <img src={item.avatar} alt="" className="h-8 w-8 rounded-full object-cover bg-zinc-100" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {item.fullName || item.parentName || item.name}
                                    </h4>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {item.admissionNumber || item.mobile || item.email || item.designation || item.status}
                                    </p>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                    {item.index || "Result"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
