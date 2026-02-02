"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { Building2, ChevronRight, Save, X, ArrowLeft } from "lucide-react";
import { SettingsSidebar } from "@/components/dashboard/settings/SettingsSidebar";

export default function SettingsLayout({
    children
}: {
    children: React.ReactNode
}) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const slug = params.slug as string;

    // Get the current page title based on path
    const getPageTitle = () => {
        if (pathname.includes('/identity')) return "Institutional Identity";
        if (pathname.includes('/location')) return "Location & Contact";
        if (pathname.includes('/leaves')) return "Leave & Attendance";
        if (pathname.includes('/admin')) return "System Access";
        if (pathname.includes('/config')) return "Regional Config";
        return "System Settings";
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans -m-8">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-[60]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/dashboard`)}
                        className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-zinc-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                            style={{ backgroundColor: 'var(--brand-color)' }}
                        >
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="font-bold text-zinc-900 leading-tight">{getPageTitle()}</h1>
                            <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Institutional Sub-Module</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/s/${slug}/dashboard`)}
                        className="px-6 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all hover:bg-zinc-50"
                    >
                        Exit Module
                    </button>
                </div>
            </header>

            <main className="flex-1 flex p-8 gap-8 max-w-[1600px] mx-auto w-full">
                <SettingsSidebar />
                <div className="flex-1 overflow-y-auto pb-32">
                    {children}
                </div>
            </main>
        </div>
    );
}
