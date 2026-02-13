"use client";

import {
    Building2,
    MapPin,
    Palmtree,
    ShieldCheck,
    Settings as SettingsIcon,
    ArrowRight,
    Sparkles,
    Zap,
    Shield,
    Globe,
    LogOut,
    CreditCard,
    Fingerprint,
    CalendarDays
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsHubPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        if (!confirm("Are you sure you want to logout?")) return;

        setIsLoggingOut(true);
        try {
            await clearUserSessionAction();
            toast.success("Logged out successfully");
            router.push("/school-login");
        } catch (error) {
            toast.error("Failed to logout");
            setIsLoggingOut(false);
        }
    }

    const modules = [
        {
            title: "Institutional Identity",
            desc: "Branding, mission statement, school seal and theme configurations.",
            href: `/s/${slug}/settings/identity`,
            icon: Building2,
            color: "text-blue-600",
            bg: "bg-blue-50",
            accent: "blue"
        },
        {
            title: "Biometric Integration",
            desc: "Manage device connections, user mapping, and live attendance logs.",
            href: `/s/${slug}/settings/biometric`,
            icon: Fingerprint,
            color: "text-purple-600",
            bg: "bg-purple-50",
            accent: "purple"
        },
        {
            title: "Location & Physicality",
            desc: "Manage branch addresses, contact details, and map coordinates.",
            href: `/s/${slug}/settings/location`,
            icon: MapPin,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            accent: "emerald"
        },
        {
            title: "Attendance & Leaves",
            desc: "Define staff quotas, punctuality rules and permission structures.",
            href: `/s/${slug}/settings/leaves`,
            icon: Palmtree,
            color: "text-amber-600",
            bg: "bg-amber-50",
            accent: "amber"
        },
        {
            title: "System Access Control",
            desc: "Manage administrative users, roles and high-level permissions.",
            href: `/s/${slug}/settings/admin`,
            icon: ShieldCheck,
            color: "text-rose-600",
            bg: "bg-rose-50",
            accent: "rose"
        },
        {
            title: "Payroll & Disbursement",
            desc: "Configure automated incentives, late thresholds, and salary rules.",
            href: `/s/${slug}/settings/payroll`,
            icon: CreditCard,
            color: "text-blue-600",
            bg: "bg-blue-50",
            accent: "blue"
        },
        {
            title: "Regional Operations",
            desc: "Configure functional currency, timezones, and billing cycles.",
            href: `/s/${slug}/settings/config`,
            icon: SettingsIcon,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            accent: "indigo"
        },
        {
            title: "Connectors & APIs",
            desc: "Manage system integrations like WhatsApp, SMS gateways, and Payment providers.",
            href: `/s/${slug}/settings/integrations`,
            icon: Zap,
            color: "text-orange-600",
            bg: "bg-orange-50",
            accent: "orange"
        },
        {
            title: "Academic Years",
            desc: "Manage school calendar periods, define active sessions and historical archives.",
            href: `/s/${slug}/settings/academic-years`,
            icon: CalendarDays,
            color: "text-rose-500",
            bg: "bg-rose-50",
            accent: "rose"
        }
    ];

    return (
        <div className="max-w-6xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="relative p-12 rounded-[48px] bg-white text-zinc-900 overflow-hidden shadow-sm border border-zinc-100">
                <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-50 rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 space-y-6 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Control Center</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight leading-tight">
                        System <br /> <span className="text-zinc-400">Administration</span>
                    </h2>
                    <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                        Fine-tune your institutional ecosystem. Manage branding, staff policies, and operational configurations across your entire branch network.
                    </p>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((m, i) => (
                    <Link
                        key={m.href}
                        href={m.href}
                        className="group relative bg-white rounded-[40px] p-8 border border-zinc-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
                    >
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-20",
                            `bg-${m.accent}-600`
                        )} />

                        <div className="space-y-6 relative z-10">
                            <div className={cn(
                                "h-16 w-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                                m.bg, m.color
                            )}>
                                <m.icon className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight">{m.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                    {m.desc}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex items-center gap-2 text-zinc-400 group-hover:text-zinc-900 transition-colors relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest">Enter Module</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </div>
                    </Link>
                ))}

                {/* Logout Card */}
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="group relative bg-gradient-to-br from-red-50 to-orange-50 rounded-[40px] p-8 border-2 border-red-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-200/50 hover:-translate-y-2 flex flex-col justify-between overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-30 bg-red-600" />

                    <div className="space-y-6 relative z-10">
                        <div className="h-16 w-16 rounded-[24px] bg-red-100 text-red-600 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                            <LogOut className="h-8 w-8" />
                        </div>
                        <div className="space-y-2 text-left">
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                Sign out of your account and return to the login screen.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center gap-2 text-red-400 group-hover:text-red-600 transition-colors relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isLoggingOut ? "Please wait..." : "Sign Out"}
                        </span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                    </div>
                </button>
            </div>

            {/* Advanced Section */}
            <div
                className="p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl"
                style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 25px 50px -12px rgba(var(--brand-color-rgb, 0, 0, 0), 0.25)' }}
            >
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Shield className="h-32 w-32" />
                </div>
                <div className="space-y-2 relative z-10 text-center md:text-left">
                    <h4 className="text-2xl font-black tracking-tight uppercase">System Security Status</h4>
                    <p className="text-sm font-medium opacity-80 max-w-lg italic px-4 md:px-0">
                        Institutional data is encrypted and backed up every 24 hours. Changes made in these modules are audited and visible to the root administrator.
                    </p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-black uppercase tracking-widest">AD</div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/10">3 Active Admins</span>
                </div>
            </div>
        </div>
    );
}
