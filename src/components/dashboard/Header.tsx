"use client";

import { Bell, Menu, Search, Clock as ClockIcon, Maximize, Minimize, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import { AcademicYearSelector } from "./AcademicYearSelector";
import { useEffect, useState } from "react";
import { getSchoolTime } from "@/lib/date-utils";
import { useSidebar } from "@/context/SidebarContext";
import { SearchInput } from "@/components/ui/SearchInput";
import { searchGlobalAction } from "@/app/actions/search-actions";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const AMBER = "var(--brand-color, #F59E0B)";
const AMBER_D = "var(--brand-color, #D97706)";
const AMBER_L = "rgba(var(--brand-color-rgb, 245, 158, 11), 0.1)";
const AMBER_XL = "rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)";

export function Header({
    schoolName,
    schoolTimezone,
    branches = [],
    currentBranchId = ""
}: {
    schoolName?: string;
    schoolTimezone?: string;
    branches?: any[];
    currentBranchId?: string;
}) {
    const { toggleSidebar, isAppFullscreen, toggleFullscreen } = useSidebar();
    const [currentTime, setCurrentTime] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const handleSearch = async (term: string) => {
        if (term.length < 2) { setSuggestions([]); return; }
        setIsSearching(true);
        if (slug) {
            const res = await searchGlobalAction(slug, term);
            if (res.success) {
                const flatSuggestions = [
                    ...(res.data?.students || []).map((s: any) => ({ ...s, type: 'student', index: 'Student' })),
                    ...(res.data?.staff || []).map((s: any) => ({ ...s, type: 'staff', index: 'Staff' })),
                    ...(res.data?.leads || []).map((s: any) => ({ ...s, type: 'lead', index: 'Lead' })),
                ];
                setSuggestions(flatSuggestions);
            }
        }
        setIsSearching(false);
    };

    const handleSuggestionClick = (item: any) => {
        if (!slug) return;
        if (item.type === 'student') router.push(`/s/${slug}/students/${item.id}`);
        else if (item.type === 'staff') router.push(`/s/${slug}/staff/${item.id}/edit`);
        else if (item.type === 'lead') router.push(`/s/${slug}/admissions/inquiry/${item.id}`);
    };

    useEffect(() => {
        const update = () => setCurrentTime(getSchoolTime(new Date(), schoolTimezone || "Asia/Kolkata"));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [schoolTimezone]);

    return (
        <header
            className={cn(
                "sticky top-0 z-[999] flex h-[72px] w-full items-center justify-between px-4 sm:px-6 lg:px-8",
                isAppFullscreen && "hidden"
            )}
            style={{
                background: "var(--brand-color)",
                borderBottom: "none",
                boxShadow: "none",
            }}
        >
            {/* ── Left: Mobile Burger + Search + Clock ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Search */}
                <div className="hidden sm:block" style={{ width: 360 }}>
                    <SearchInput
                        onSearch={handleSearch}
                        suggestions={suggestions}
                        onSuggestionClick={handleSuggestionClick}
                        isLoading={isSearching}
                        placeholder="Search students, staff, leads..."
                        className="w-full"
                    />
                </div>

                {/* Clock pill */}
                <div
                    className="hidden md:flex items-center gap-2"
                    style={{
                        padding: "6px 14px",
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 20,
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                    }}
                >
                    <ClockIcon style={{ width: 13, height: 13, color: "var(--secondary-color)" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--secondary-color)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.3 }}>
                        {currentTime || "--:-- --"}
                    </span>
                </div>
            </div>

            {/* ── Center: Academic Year Selector ── */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative", zIndex: 1000 }}>
                <AcademicYearSelector />
            </div>

            {/* ── Right: Bell + Fullscreen + Profile ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Notification Bell */}
                <button
                    style={{
                        position: "relative", padding: 8, borderRadius: 10,
                        border: "1.5px solid rgba(255,255,255,0.2)",
                        background: "rgba(255,255,255,0.1)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.22s ease",
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-[var(--secondary-color)] shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform"
                    >
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    {/* Amber pulse dot */}
                    <span
                        className="pulse-anim"
                        style={{
                            position: "absolute", top: 7, right: 7,
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#F59E0B",
                            boxShadow: "0 0 0 2px white",
                        }}
                    />
                    <span className="sr-only">Notifications</span>
                </button>

                {/* Fullscreen toggle */}
                <button
                    onClick={toggleFullscreen}
                    title={isAppFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    aria-label={isAppFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    style={{
                        padding: 8, borderRadius: 10,
                        border: "1.5px solid #E5E7EB",
                        background: "white", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.22s ease",
                        color: "var(--secondary-color)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                >
                    {isAppFullscreen ? <Minimize style={{ width: 17, height: 17 }} /> : <Maximize style={{ width: 17, height: 17 }} />}
                </button>

                <ProfileMenu branches={branches} currentBranchId={currentBranchId} />
            </div>
        </header>
    );
}
