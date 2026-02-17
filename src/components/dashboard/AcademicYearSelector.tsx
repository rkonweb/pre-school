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
            if (res.success && res.data) {
                setYears(res.data);
                const data = res.data;

                // Determine which year is selected based on current date
                const today = new Date();

                // 1. Check Cookie first (respects user's manual selection)
                const cookieValue = getCookie(`academic_year_${slug}`);
                let yearToSelect = data.find((y: any) => y.id === cookieValue);

                // 2. Find academic year based on current date (today falls within startDate and endDate)
                if (!yearToSelect) {
                    yearToSelect = data.find((y: any) => {
                        const start = new Date(y.startDate);
                        const end = new Date(y.endDate);
                        return today >= start && today <= end;
                    });
                }

                // 3. Fallback to isCurrent flag
                if (!yearToSelect) {
                    yearToSelect = data.find((y: any) => y.isCurrent);
                }

                // 4. Fallback to latest year (most recent startDate)
                if (!yearToSelect && data.length > 0) {
                    yearToSelect = data[0]; // Already sorted by startDate desc
                }

                if (yearToSelect) {
                    setSelectedYear(yearToSelect);
                    // Ensure cookie is set
                    setCookie(`academic_year_${slug}`, yearToSelect.id, 365);
                }
            } else {
                console.error("Failed to load sessions:", res.error);
            }
        } catch (error) {
            console.error("Failed to load academic years for selector:", error);
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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                <div className="h-4 w-20 bg-white/20 rounded" />
            </div>
        );
    }

    if (years.length === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs italic">
                <CalendarDays className="h-4 w-4" />
                <span>No Sessions Found</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white active:scale-95 backdrop-blur-sm relative z-[1001]"
            >
                <CalendarDays className="h-4 w-4 text-white/70" />
                <span className="text-sm font-bold tracking-tight">
                    {selectedYear ? selectedYear.name : "Select Year"}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform text-white/70", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl bg-white border border-zinc-100 shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-200">
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
