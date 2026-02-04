"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    Building2,
    Layers,
    Settings,
    ShieldCheck,
    LogOut,
    Globe,
    Database,
    CreditCard,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutSuperAdminAction } from "@/app/actions/admin-auth-actions";

const navigation = [
    { name: "Console Overview", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Tenant Management", href: "/admin/tenants", icon: Building2 },
    { name: "Master Data", href: "/admin/dashboard/master-data", icon: Database },
    { name: "CMS", href: "/admin/cms", icon: FileText },
    { name: "Curriculum Architect", href: "/admin/curriculum/architect", icon: Layers },
    { name: "Global Monitor", href: "/admin/curriculum/monitor", icon: Globe },
    { name: "System Config", href: "/admin/settings", icon: Settings },
    { name: "Subscription Plans", href: "/admin/subscriptions", icon: CreditCard },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        await logoutSuperAdminAction();
        router.push("/admin/login");
    }

    return (
        <div className="flex h-screen w-72 flex-col bg-white border-r border-zinc-200">
            <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-md shadow-zinc-900/10">
                    <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-zinc-900 tracking-wide">MASTER ADMIN</span>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-zinc-50 text-blue-600 shadow-sm border border-zinc-100"
                                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-100">
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner ring-2 ring-white" />
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-bold text-zinc-900">Root User</p>
                        <p className="truncate text-[10px] text-zinc-500">access-level: 0</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
