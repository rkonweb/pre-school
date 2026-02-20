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

            <main className="px-5 py-4 space-y-6">

                {/* Profile Header */}
                <StandardCard className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 border-none text-white">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                            {profile?.imageUrl ? (
                                <img src={profile.imageUrl} alt={profile.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black">{profile?.name?.[0] || "P"}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black truncate">{profile?.name || "Parent"}</h2>
                            <p className="text-indigo-100 text-sm truncate">{phone || "No phone linked"}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full text-indigo-50">
                                <Shield className="h-3 w-3" />
                                <span>Verified Parent</span>
                            </div>
                        </div>
                    </div>
                </StandardCard>

                {/* Menu Items */}
                <div className="space-y-3">
                    {menuItems.map((item, idx) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="block"
                        >
                            <StandardCard
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-4 active:scale-95 transition-transform"
                            >
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-black text-slate-900">{item.label}</h3>
                                </div>
                                <div className="text-slate-300">
                                    <ChevronLeft className="h-5 w-5 rotate-180" />
                                </div>
                            </StandardCard>
                        </Link>
                    ))}
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="w-full mt-8 disabled:opacity-50"
                >
                    <StandardCard className="bg-rose-50 border-rose-100 flex items-center gap-4 justify-center active:scale-95 transition-transform">
                        {isPending ? (
                            <div className="h-5 w-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <LogOut className="h-5 w-5 text-rose-500" />
                        )}
                        <span className="text-sm font-black text-rose-600">
                            {isPending ? "Signing Out..." : "Sign Out"}
                        </span>
                    </StandardCard>
                </button>

                <p className="text-center text-xs text-slate-400 font-medium">
                    Version 1.2.0 • Build 2024
                </p>
            </main>
        </PageWrapper>
    );
}
