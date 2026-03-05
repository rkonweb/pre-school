"use client";

import { Bell, Menu, Search, Clock as ClockIcon, Maximize, Minimize } from "lucide-react";
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
                background: "white",
                borderBottom: "1px solid #F3F4F6",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
        >
            {/* ── Left: Mobile Burger + Search + Clock ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Mobile menu toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden"
                    style={{
                        padding: "8px", borderRadius: 10,
                        border: "1.5px solid #E5E7EB",
                        background: "white", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#6B7280", transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F59E0B"; (e.currentTarget as HTMLElement).style.color = "#D97706"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
                >
                    <Menu style={{ width: 18, height: 18 }} />
                    <span className="sr-only">Open sidebar</span>
                </button>

                {/* Search */}
                <div className="hidden sm:block" style={{ width: 360 }}>
                    <SearchInput
                        onSearch={handleSearch}
                        suggestions={suggestions}
                        onSuggestionClick={handleSuggestionClick}
                        isLoading={isSearching}
                        placeholder="Search students, staff, leads..."
                        className="w-full"
                        style={{
                            background: "#F9FAFB",
                            border: "1.5px solid #E5E7EB",
                            borderRadius: 12,
                            fontSize: 13.5,
                            color: "#374151",
                        } as any}
                    />
                </div>

                {/* Clock pill */}
                <div
                    className="hidden md:flex items-center gap-2"
                    style={{
                        padding: "6px 14px",
                        background: "#1E1B4B",
                        borderRadius: 20,
                        boxShadow: "0 2px 12px rgba(30,27,75,0.2)",
                    }}
                >
                    <ClockIcon style={{ width: 13, height: 13, color: "#A5B4FC" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.3 }}>
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
                        border: "1.5px solid #E5E7EB",
                        background: "white", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.22s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F59E0B"; (e.currentTarget as HTMLElement).style.background = "#FFFBEB"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.background = "white"; }}
                >
                    <Bell style={{ width: 17, height: 17, color: "#6B7280" }} />
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
                    style={{
                        padding: 8, borderRadius: 10,
                        border: "1.5px solid #E5E7EB",
                        background: "white", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.22s ease",
                        color: "#6B7280",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F59E0B"; (e.currentTarget as HTMLElement).style.color = "#D97706"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
                >
                    {isAppFullscreen ? <Minimize style={{ width: 17, height: 17 }} /> : <Maximize style={{ width: 17, height: 17 }} />}
                </button>

                <ProfileMenu branches={branches} currentBranchId={currentBranchId} />
            </div>
        </header>
    );
}
