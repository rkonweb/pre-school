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
    BookOpen,
    FileText,
    CalendarDays
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
                                    <Link href={`${baseRoute}/profile?phone=${phone}`} className="hidden sm:block h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm relative group transition-transform hover:scale-105">
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

                {/* Mobile Sidebar Menu (Drawer) & Persistent Handle */}
                <div className="sm:hidden pointer-events-none fixed inset-0 z-[60]">
                    {/* Persistent Arrow Handle (Always Visible when closed) */}
                    <AnimatePresence>
                        {!isMenuOpen && (
                            <motion.button
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                whileHover={{ scale: 1.05, x: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMenuOpen(true)}
                                className="pointer-events-auto fixed top-[108px] left-[-5px] h-14 w-8 bg-white rounded-r-full shadow-[2px_4px_16px_rgba(0,0,0,0.15)] border border-l-0 border-zinc-100 flex items-center justify-center group z-[50] overflow-hidden"
                                style={{ borderLeft: `3px solid ${brandColor}` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 to-white opacity-50" />
                                <ChevronLeft className="h-5 w-5 text-zinc-400 rotate-180 relative z-10 transition-transform group-hover:translate-x-0.5" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Overlay */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="pointer-events-auto fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-[60]"
                            />
                        )}
                    </AnimatePresence>

                    {/* Sidebar Content */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="pointer-events-auto fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] shadow-2xl z-[70] flex flex-col overflow-hidden rounded-r-[25px] backdrop-blur-xl border-r border-white/20"
                                style={{ backgroundColor: `${brandColor}99` }}
                            >
                                {/* Header: Profile Info */}
                                <div className="pt-12 pb-8 px-8 relative">
                                    {/* Abstract Background Design */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                                    <div className="relative z-10 flex items-start justify-between">
                                        <div className="flex flex-col gap-4">
                                            <div className="h-16 w-16 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white/10">
                                                {profile?.imageUrl ? (
                                                    <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                                                        {(profile?.name || "P")[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black leading-tight tracking-tight text-[var(--secondary-color)]">
                                                    {profile?.name || "Guest Parent"}
                                                </h3>
                                                <p className="text-xs font-medium mt-1 truncate max-w-[200px] text-[var(--secondary-color)] opacity-70">
                                                    {phone || "No phone linked"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Close / Collapse Arrow */}
                                        <button
                                            onClick={() => setIsMenuOpen(false)}
                                            className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-[var(--secondary-color)] backdrop-blur-sm"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {navItemsWithPhone.map((item) => {
                                        const hrefPath = item.href.split('?')[0];
                                        const isActive = (item.label === "Home" || hrefPath === baseRoute)
                                            ? pathname === hrefPath
                                            : pathname.startsWith(hrefPath);

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`
                                                    group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative overflow-hidden
                                                    ${isActive ? 'bg-white text-slate-900 shadow-xl' : 'text-[var(--secondary-color)] opacity-80 hover:bg-white/10 hover:opacity-100'}
                                                `}
                                            >
                                                <item.icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-[var(--secondary-color)]'}`}
                                                    style={isActive ? { color: brandColor } : {}}
                                                />
                                                <span className="text-lg font-bold tracking-tight">{item.label}</span>

                                                {/* Active Indicator & Curve Effect Simulation */}
                                                {isActive && (
                                                    <div className="absolute right-4 h-2 w-2 rounded-full bg-indigo-600" style={{ backgroundColor: brandColor }} />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Footer: Logout */}
                                <div className="p-8 pb-12 relative z-10">
                                    <button
                                        onClick={() => {
                                            router.replace("/parent-login");
                                        }}
                                        className="flex items-center gap-4 text-[var(--secondary-color)] opacity-60 hover:opacity-100 transition-colors w-full px-4 py-2"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-bold tracking-widest text-sm uppercase">Log Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Area */}
                <main className="min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* PWA Install Guidance */}
                <PWAInstallPrompt />
            </div>
        </NavContext.Provider>
    );
}
