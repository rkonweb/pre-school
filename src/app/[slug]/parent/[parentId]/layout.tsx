"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    CreditCard,
    Globe,
    Home,
    LogOut,
    Menu,
    MessageCircle,
    Sparkles,
    User,
    X,
    ChevronLeft,
    Calendar,
    FileText,
    CalendarDays,
    Package,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import PWAInstallPrompt from "@/components/parent/PWAInstallPrompt";
import { ParentProvider, useParentData } from "@/context/parent-context";

import { Suspense, createContext, useContext } from "react";

// Navigation Context for triggering side menu from children
interface NavContextType {
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
}
const NavContext = createContext<NavContextType | undefined>(undefined);
export const useParentNav = () => {
    const context = useContext(NavContext);
    if (!context) throw new Error("useParentNav must be used within ParentLayout");
    return context;
};

// Initial wrapper that handles useParams (which doesn't bail out like useSearchParams)
export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center animate-pulse text-zinc-400 font-bold">Loading Parent Portal...</div>}>
            <ParentLayoutSync slug={slug}>
                {children}
            </ParentLayoutSync>
        </Suspense>
    );
}

// Intermediate component to safely call useSearchParams
function ParentLayoutSync({ slug, children }: { slug: string, children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const phone = (searchParams.get("phone") || "").trim();

    return (
        <ParentProvider slug={slug} phone={phone}>
            <ParentLayoutContent>
                {children}
            </ParentLayoutContent>
        </ParentProvider>
    );
}

// Inner Content Component (Consumes Context)
function ParentLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { school, parentProfile: profile, students, isLoading } = useParentData();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    // Ensure base route logic works
    const baseRoute = `/${slug}/parent/${parentId}`;

    // Logic to detect if we are on a Student Detail page (Deep navigation)
    // URL Pattern: /school/parent/parentId/studentId (Length > Base)
    // And last segment is NOT one of the known static routes.
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const staticRoutes = ['settings', 'login'];
    // Themed routes use the VibrantHeader and should hide the default layout header.
    // This includes the Hub (3 segments) and student-specific or common themed routes (4+ segments).
    const isThemedPage = segments.length >= 3 && !staticRoutes.includes(lastSegment);

    // Hydration fix
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Dynamic brand color
    const brandColor = school?.brandColor || school?.primaryColor || "#2563eb";
    const displayName = school?.name || "School";

    // Determine active student for contextual navigation
    // 1. Check if studentId is in URL
    // 2. If not, fallback to first student if available
    const activeStudentId = (params.studentId as string) || (students && students.length > 0 ? students[0].id : null);

    const navItems = [
        {
            icon: Home,
            label: "Home",
            href: (students && students.length === 1)
                ? `${baseRoute}/${students[0].id}`
                : baseRoute
        },
        { icon: MessageCircle, label: "Chat", href: `${baseRoute}/messages` },
        {
            icon: CreditCard,
            label: "Fees",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/finance`
                : `${baseRoute}/fees`
        },
        {
            icon: Calendar,
            label: "Calendar",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/attendance`
                : baseRoute
        },
        {
            icon: CalendarDays,
            label: "Time Table",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/timetable`
                : baseRoute
        },
        {
            icon: BookOpen,
            label: "Diary",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/diary`
                : baseRoute
        },
        {
            icon: FileText, // Or Trophy
            label: "Reports",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/reports`
                : baseRoute
        },
        {
            icon: Package,
            label: "Store",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/store`
                : baseRoute
        },
        {
            icon: User,
            label: "Profile",
            href: activeStudentId
                ? `${baseRoute}/${activeStudentId}/menu`
                : `${baseRoute}/profile`
        },
    ];

    const navItemsWithPhone = navItems.map((item: any) => ({
        ...item,
        href: phone ? `${item.href}${item.href.includes('?') ? '&' : '?'}phone=${phone}` : item.href
    }));
    if (!isMounted) {
        return <div className="min-h-screen bg-[#F8FAFC]" />;
    }

    return (
        <NavContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
            <div
                className="min-h-screen bg-[#F8FAFC] text-zinc-900 pb-24 sm:pb-0 selection:bg-blue-100 selection:text-blue-900"
                style={{
                    "--secondary-color": school?.secondaryColor || "#ffffff",
                    "--brand-color": brandColor
                } as any}
            >
                {/* Header / Top Bar - HIDE on Themed Pages (Hub, Messages, Student Dash) */}
                {!isThemedPage && (
                    <header className="bg-white border-b border-zinc-100 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
                        <div className="max-w-6xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                {/* Left: Mobile Menu & Logo */}
                                <div className="flex items-center gap-4">
                                    {/* Sidebar Trigger (Visible on small screens) */}
                                    <button
                                        onClick={() => setIsMenuOpen(true)}
                                        className="hidden" // Hiding the old hamburger, as we'll use the side pull tab
                                    >
                                        <Menu className="h-5 w-5 text-zinc-600" />
                                    </button>

                                    <Link href={phone ? `${baseRoute}?phone=${phone}` : baseRoute} className="flex items-center gap-3">
                                        {school?.logo ? (
                                            <div className="h-12 relative flex items-center">
                                                <img
                                                    src={school.logo}
                                                    alt={displayName}
                                                    className="h-full w-auto object-contain"
                                                    style={{ maxHeight: '100%', width: 'auto' }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className="h-10 w-10 text-white rounded-xl flex items-center justify-center font-black italic shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: brandColor }}
                                                >
                                                    {(displayName || "SV").substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="hidden sm:block">
                                                    <h2 className="font-black text-lg tracking-tight leading-none">{displayName}</h2>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">Parent Portal</p>
                                                </div>
                                            </>
                                        )}
                                    </Link>
                                </div>

                                {/* Center: Desktop Nav */}
                                <nav className="hidden sm:flex items-center gap-1 bg-zinc-50/50 p-1 rounded-2xl border border-zinc-100">
                                    {navItemsWithPhone.map((item) => {
                                        const hrefPath = item.href.split('?')[0];
                                        const isActive = (item.label === "Home" || hrefPath === baseRoute)
                                            ? pathname === hrefPath
                                            : pathname.startsWith(hrefPath);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`
                                                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                                            `}
                                                style={isActive ? {
                                                    backgroundColor: brandColor,
                                                    color: 'var(--secondary-color)',
                                                    boxShadow: `0 4px 12px -2px ${brandColor}40`
                                                } : {
                                                    color: '#a1a1aa'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) e.currentTarget.style.color = '#52525b';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) e.currentTarget.style.color = '#a1a1aa';
                                                }}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Right: Notifications & Profile */}
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <NotificationCenter userId={parentId || "current-parent"} />

                                    {/* Profile Pic */}
                                    <Link href={`${baseRoute}/profile?phone=${phone}`} className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm relative group transition-transform hover:scale-105">
                                        {profile?.imageUrl ? (
                                            <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black text-sm">
                                                {(profile?.name || "P")[0]}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Content Area */}
                <main className="min-h-screen pt-4 sm:pt-8 pb-24 sm:pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-lg sm:max-w-6xl mx-auto px-4"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Mobile Bottom Navigation Bar (Visible only on small screens) */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent pointer-events-none">
                    <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-zinc-200/50 rounded-3xl flex items-center justify-around py-2 px-2">
                        {navItemsWithPhone.filter((item, i) => [0, 1, 2, 4, 7].includes(i)).map((item) => {
                            const hrefPath = item.href.split('?')[0];
                            const isActive = (item.label === "Home" || hrefPath === baseRoute)
                                ? pathname === hrefPath
                                : pathname.startsWith(hrefPath);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative p-3 flex flex-col items-center justify-center gap-1 min-w-[64px]"
                                >
                                    <div className={`relative z-10 p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/20 transform -translate-y-1' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-zinc-900 opacity-100' : 'text-zinc-400 opacity-0 transform translate-y-2'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* PWA Install Guidance */}
                <PWAInstallPrompt />
            </div>
        </NavContext.Provider>
    );
}
