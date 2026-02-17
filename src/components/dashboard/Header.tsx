"use client";

import { Bell, Menu, Search, Clock as ClockIcon } from "lucide-react";
import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import { AcademicYearSelector } from "./AcademicYearSelector";
import { useEffect, useState } from "react";
import { getSchoolTime } from "@/lib/date-utils";
import { useSidebar } from "@/context/SidebarContext";
import { SearchInput } from "@/components/ui/SearchInput";
import { searchGlobalAction } from "@/app/actions/search-actions";
import { useParams, useRouter } from "next/navigation";

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
    const { toggleSidebar } = useSidebar();
    const [currentTime, setCurrentTime] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;


    const handleSearch = async (term: string) => {
        if (term.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        // We need slug. If not in params (e.g. root), we can't search or need a default.
        // Assuming dashboard always has slug.
        if (slug) {
            const res = await searchGlobalAction(slug, term);
            if (res.success) {
                // Formatting suggestions for SearchInput
                // SearchInput expects { fullName/parentName, ... }
                // We can add a 'type' field to know where to navigate.
                // searchGlobalAction returns { students: [], leads: [], staff: [] }
                // We need to flatten this.
                const flatSuggestions = [
                    ...(res.data?.students || []).map((s: any) => ({ ...s, type: 'student', index: 'Student' })),
                    ...(res.data?.staff || []).map((s: any) => ({ ...s, type: 'staff', index: 'Staff' })),
                    ...(res.data?.leads || []).map((s: any) => ({ ...s, type: 'lead', index: 'Lead' }))
                ];
                setSuggestions(flatSuggestions);
            }
        }
        setIsSearching(false);
    };

    const handleSuggestionClick = (item: any) => {
        if (!slug) return;
        if (item.type === 'student') {
            router.push(`/s/${slug}/students/${item.id}`);
        } else if (item.type === 'staff') {
            // Staff view might be a modal or page. Assuming page or edit page.
            // Staff management usually has 'edit' or view. Let's go to edit for now or just the list if no view.
            // Actually StaffPage has edit.
            router.push(`/s/${slug}/staff/${item.id}/edit`);
        } else if (item.type === 'lead') {
            router.push(`/s/${slug}/admissions/inquiry/${item.id}`);
        }
    };

    useEffect(() => {
        const update = () => {
            setCurrentTime(getSchoolTime(new Date(), schoolTimezone || "Asia/Kolkata"));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [schoolTimezone]);

    return (
        <header
            style={{ backgroundColor: 'var(--brand-color)' }}
            className="sticky top-0 z-[999] flex h-[94px] w-full items-center justify-between border-b border-white/10 bg-gradient-to-r from-brand to-brand/90 px-4 shadow-xl shadow-brand/5 backdrop-blur-md sm:px-6 lg:px-8"
        >
            {/* Mobile Menu Trigger & Search */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleSidebar}
                    className="rounded-md p-2 text-white/80 hover:bg-white/10 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </button>


                <div className="flex items-center gap-4">
                    <div className="hidden sm:block md:w-96">
                        <SearchInput
                            onSearch={handleSearch}
                            suggestions={suggestions}
                            onSuggestionClick={handleSuggestionClick}
                            isLoading={isSearching}
                            placeholder="Search students, staff, leads..."
                            className="w-full bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:ring-white/20"
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl backdrop-blur-sm">
                        <ClockIcon className="h-3.5 w-3.5 text-white/80" />
                        <span className="text-xs font-black text-white tabular-nums">
                            {currentTime || "--:-- --"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Academic Year Selector */}
            <div className="flex-1 flex justify-center relative z-[1000]">
                <AcademicYearSelector />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-1.5 text-white/80 hover:bg-white/10 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-zinc-950" />
                    <span className="sr-only">Notifications</span>
                </button>

                <ProfileMenu
                    branches={branches}
                    currentBranchId={currentBranchId}
                />
            </div>
        </header>
    );
}
