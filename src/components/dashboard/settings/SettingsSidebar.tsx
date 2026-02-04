"use client";

import { cn } from "@/lib/utils";
import {
    Building2,
    MapPin,
    Palmtree,
    ShieldCheck,
    Settings as SettingsIcon,
    ChevronRight,
    CreditCard,
    Coins,
    Fingerprint
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function SettingsSidebar() {
    const params = useParams();
    const pathname = usePathname();
    const slug = params.slug as string;

    const navItems = [
        {
            label: "Identity",
            href: `/s/${slug}/settings/identity`,
            icon: Building2,
            desc: "Branding & Logo"
        },
        {
            label: "Biometric",
            href: `/s/${slug}/settings/biometric`,
            icon: Fingerprint,
            desc: "Devices & Logs"
        },
        {
            label: "Location",
            href: `/s/${slug}/settings/location`,
            icon: MapPin,
            desc: "Address & Contact"
        },
        {
            label: "Leaves",
            href: `/s/${slug}/settings/leaves`,
            icon: Palmtree,
            desc: "Policy & Quotas"
        },
        {
            label: "Admin",
            href: `/s/${slug}/settings/admin`,
            icon: ShieldCheck,
            desc: "System Access"
        },
        {
            label: "Config",
            href: `/s/${slug}/settings/config`,
            icon: SettingsIcon,
            desc: "Regional Settings"
        },
        {
            label: "Fees",
            href: `/s/${slug}/settings/fees`,
            icon: CreditCard,
            desc: "Structure & Plans"
        },
        {
            label: "Payroll",
            href: `/s/${slug}/settings/payroll`,
            icon: Coins,
            desc: "Automated Rules"
        }
    ];

    return (
        <div className="w-80 flex-shrink-0 border-r border-zinc-100 bg-white/50 backdrop-blur-xl h-[calc(100vh-120px)] overflow-y-auto p-6 hidden lg:block rounded-3xl">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10"
                                    : "text-zinc-500 hover:bg-zinc-100"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                isActive ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-400 group-hover:scale-110"
                            )}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className={cn("font-bold text-sm", isActive ? "text-white" : "text-zinc-900")}>{item.label}</p>
                                <p className={cn("text-[10px] font-medium opacity-60")}>{item.desc}</p>
                            </div>
                            <ChevronRight className={cn("h-4 w-4 opacity-0 transition-opacity", isActive ? "opacity-100" : "group-hover:opacity-40")} />
                        </Link>
                    )
                })}
            </div>

            <div
                className="mt-12 p-6 rounded-3xl text-white relative overflow-hidden shadow-2xl"
                style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 25px 50px -12px rgba(var(--brand-color-rgb, 0, 0, 0), 0.25)' }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="h-20 w-20" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-widest mb-2 relative z-10">Security Note</h4>
                <p className="text-[10px] font-medium leading-relaxed opacity-80 relative z-10">
                    All configuration changes are logged and linked to your administrator profile.
                </p>
            </div>
        </div>
    );
}
