"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    CreditCard,
    Globe,
    Home,
    LogOut,
    Menu,
    MessageCircle,
    User,
    X
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import PWAInstallPrompt from "@/components/parent/PWAInstallPrompt";
import { ParentProvider, useParentData } from "@/context/parent-context";

// Wrapper Component
export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const searchParams = useSearchParams();

    // Ensure params are available
    const slug = typeof params.slug === 'string' ? params.slug : '';
    const phone = searchParams.get("phone") || "";

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
    const { school, parentProfile: profile, isLoading } = useParentData();

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
    const staticRoutes = ['fees', 'messages', 'profile', 'settings', 'login'];
    // Base has 3 segments: school, parent, parentId.
    // If we have > 3 segments and the last one isn't static, it is likely a student ID or sub-resource.
    const isStudentPage = segments.length > 3 && !staticRoutes.includes(lastSegment);

    // Hydration fix
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Dynamic brand color
    const brandColor = school?.brandColor || school?.primaryColor || "#2563eb";
    const displayName = school?.name || "School";

    const navItems = [
        { icon: Home, label: "Home", href: baseRoute },
        { icon: MessageCircle, label: "Chat", href: `${baseRoute}/messages` },
        { icon: CreditCard, label: "Fees", href: `${baseRoute}/fees` },
        { icon: User, label: "Profile", href: `${baseRoute}/profile` },
    ];

    const navItemsWithPhone = navItems.map(item => ({
        ...item,
        href: phone ? `${item.href}?phone=${phone}` : item.href
    }));

    if (!isMounted) {
        return <div className="min-h-screen bg-[#F8FAFC]" />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 pb-24 sm:pb-0 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
            {/* Header / Top Bar - HIDE on Student Page */}
            {!isStudentPage && (
                <header className="bg-white border-b border-zinc-100 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left: Mobile Menu & Logo */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsMenuOpen(true)}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors sm:hidden"
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
                                    const isActive = hrefPath === baseRoute
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
                                                color: 'white',
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

            {/* Mobile Sidebar Menu (Drawer) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 text-white rounded-xl flex items-center justify-center font-black italic"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        {(displayName || "SV").substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-lg font-black tracking-tight">{displayName}</span>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                                    <X className="h-5 w-5 text-zinc-400" />
                                </button>
                            </div>

                            <div className="flex-1 py-8 px-4 overflow-y-auto space-y-2">
                                {navItemsWithPhone.map((item) => {
                                    const hrefPath = item.href.split('?')[0];
                                    const isActive = hrefPath === baseRoute
                                        ? pathname === hrefPath
                                        : pathname.startsWith(hrefPath);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-black transition-all"
                                            style={isActive ? {
                                                backgroundColor: brandColor,
                                                color: 'white',
                                                boxShadow: `0 8px 16px -4px ${brandColor}40`
                                            } : {
                                                color: '#a1a1aa'
                                            }}
                                        >
                                            <item.icon className="h-6 w-6" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                <div className="pt-8 px-6">
                                    <div className="h-px bg-zinc-100 mb-8" />
                                    <div className="space-y-6">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">Quick Support</p>
                                        <div className="flex flex-col gap-4">
                                            <a href="#" className="flex items-center gap-3 text-sm font-bold text-zinc-500 hover:text-zinc-900"><Globe className="h-4 w-4" /> Visit Website</a>
                                            <button
                                                onClick={() => {
                                                    // In a real app we would call signOut() here
                                                    router.replace("/parent-login");
                                                }}
                                                className="flex items-center gap-3 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" /> Logout Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <main className="min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* PWA Install Guidance */}
            <PWAInstallPrompt />

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-4 right-4 mb-4 bg-white/95 backdrop-blur-xl border border-zinc-100 z-50 px-6 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex justify-between items-center sm:hidden shadow-2xl rounded-[2.5rem] shadow-zinc-200/50">
                {navItemsWithPhone.map((item) => {
                    const hrefPath = item.href.split('?')[0];
                    const isActive = hrefPath === baseRoute
                        ? pathname === hrefPath
                        : pathname.startsWith(hrefPath);

                    return (
                        <Link key={item.href} href={item.href} className="relative p-2">
                            <item.icon
                                className={`h-6 w-6 transition-all duration-300`}
                                style={{
                                    color: isActive ? brandColor : '#52525b',
                                    transform: isActive ? 'scale(1.25)' : 'scale(1)'
                                }}
                            />
                            {isActive && (
                                <motion.div
                                    layoutId="navDot"
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: brandColor,
                                        boxShadow: `0 2px 8px ${brandColor}`
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <footer className="hidden sm:block py-20 bg-white border-t border-zinc-100 mt-20">
                <div className="max-w-4xl mx-auto px-8 flex justify-between items-center">
                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2026 {displayName}
                    </div>
                </div>
            </footer>
        </div>
    );
}
