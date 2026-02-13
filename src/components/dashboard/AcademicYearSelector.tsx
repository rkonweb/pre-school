"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getCookie, setCookie } from "@/lib/cookies";

export function AcademicYearSelector() {
    const params = useParams();
    const slug = params.slug as string;

    const [years, setYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!slug) return;
        loadYears();
    }, [slug]);

    async function loadYears() {
        try {
            const res = await getAcademicYearsAction(slug);
            if (res.success) {
                setYears(res.data);

                // Determine which year is selected
                // 1. Check Cookie
                const cookieValue = getCookie(`academic_year_${slug}`);
                let yearToSelect = res.data.find((y: any) => y.id === cookieValue);

                // 2. Fallback to Current
                if (!yearToSelect) {
                    yearToSelect = res.data.find((y: any) => y.isCurrent);
                }

                // 3. Fallback to Latest
                if (!yearToSelect && res.data.length > 0) {
                    yearToSelect = res.data[0];
                }

                if (yearToSelect) {
                    setSelectedYear(yearToSelect);
                    // Ensure cookie is set
                    setCookie(`academic_year_${slug}`, yearToSelect.id, 365);
                }
            }
        } catch (error) {
            console.error("Failed to load academic years for selector");
        } finally {
            setIsLoading(false);
        }
    }

    function handleSelect(year: any) {
        setSelectedYear(year);
        setCookie(`academic_year_${slug}`, year.id, 365);
        setIsOpen(false);
        // Refresh the page to apply the new year context
        window.location.reload();
    }

    function getCookieLocal(name: string) {
        return getCookie(name);
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                <div className="h-4 w-20 bg-zinc-200 rounded" />
            </div>
        );
    }

    if (years.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 active:scale-95"
            >
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-bold tracking-tight">
                    {selectedYear ? selectedYear.name : "Select Year"}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-white border border-zinc-100 shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-zinc-50 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Academic Period</span>
                        </div>
                        {years.map((year) => (
                            <button
                                key={year.id}
                                onClick={() => handleSelect(year)}
                                className="w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium hover:bg-zinc-50 transition-colors"
                            >
                                <span className={cn(selectedYear?.id === year.id ? "text-rose-600 font-bold" : "text-zinc-600")}>
                                    {year.name}
                                </span>
                                {selectedYear?.id === year.id && (
                                    <Check className="h-4 w-4 text-rose-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
