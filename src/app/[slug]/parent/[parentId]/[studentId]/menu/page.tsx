"use client";

import { motion } from "framer-motion";
import { Settings, User, LogOut, Bell, Shield, HelpCircle, ChevronLeft, Lock } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageWrapper, StickyHeader, StandardCard } from "@/components/ui-theme";
import { useParentData } from "@/context/parent-context";
import { signOutAction } from "@/app/actions/auth-actions";
import { useTransition } from "react";
import { toast } from "sonner";

export default function MenuPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const phone = searchParams.get("phone") || "";
    const { parentProfile: profile, isLoading } = useParentData();
    const [isPending, startTransition] = useTransition();

    const handleSignOut = () => {
        startTransition(async () => {
            try {
                await signOutAction();
            } catch (error) {
                toast.error("Failed to sign out");
            }
        });
    };

    const menuItems = [
        {
            icon: User,
            label: "My Profile",
            href: `/${params.slug}/parent/${params.parentId}/${params.studentId}/profile?phone=${phone}`
        },
        // Placeholder links for now
        { icon: Bell, label: "Notifications", href: "#" },
        { icon: Shield, label: "Privacy & Security", href: "#" },
        { icon: HelpCircle, label: "Help & Support", href: "#" },
        { icon: Settings, label: "App Settings", href: "#" },
    ];

    return (
        <PageWrapper>
            <StickyHeader title="Menu" showBell={true} />

            <main className="px-5 py-4 space-y-6 max-w-lg mx-auto w-full relative z-0">

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-white/60 bg-white/80 backdrop-blur-xl group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700" />

                    <div className="relative z-10 flex items-center gap-5 sm:gap-6">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shrink-0">
                            <div className="h-full w-full rounded-[1.4rem] bg-white overflow-hidden flex items-center justify-center">
                                {profile?.imageUrl ? (
                                    <img src={profile.imageUrl} alt={profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-violet-600 uppercase">
                                        {profile?.name?.[0] || "P"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Shield className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    Verified Parent
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none truncate mb-1">{profile?.name || "Parent User"}</h2>
                            <p className="text-sm font-bold text-slate-400 truncate flex items-center gap-1.5">
                                {phone || "No phone linked"}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Menu Items */}
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-3 border border-white/60 shadow-lg shadow-slate-200/30">
                    {menuItems.map((item, idx) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-4 p-3 rounded-3xl hover:bg-white transition-all group cursor-pointer"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 text-slate-400 shadow-sm group-hover:shadow-md">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-black text-slate-700 tracking-tight group-hover:text-slate-900">{item.label}</h3>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100/50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm transition-all group-hover:translate-x-1">
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="w-full mt-6 flex items-center justify-center p-5 bg-rose-50/80 backdrop-blur-md border border-rose-100 rounded-[2rem] active:scale-[0.98] transition-all hover:bg-rose-100 shadow-sm disabled:opacity-50"
                >
                    {isPending ? (
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-black text-rose-600 uppercase tracking-widest">Signing Out...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <LogOut className="h-5 w-5 text-rose-500" />
                            <span className="text-sm font-black text-rose-600 uppercase tracking-widest">Sign Out</span>
                        </div>
                    )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                    Version 2.1.0 • Build 402
                </p>
            </main>
        </PageWrapper>
    );
}
