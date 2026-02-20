"use client";

import { PageWrapper, StandardCard, StickyHeader, StandardTabs, StandardTab } from "@/components/ui-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar, CheckCircle2, ChevronRight, CreditCard,
    FileText, User, Bell, Settings, Clock
} from "lucide-react";

export default function UIKitPage() {
    return (
        <PageWrapper className="p-8 space-y-8 bg-[#F1F5F9]">

            <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">UI Kit & Design System</h1>
                <p className="text-slate-500">Baselined components for the Parent Portal & App.</p>
            </div>

            <hr className="border-slate-200" />

            {/* Section: Sticky Header */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">1. Sticky Headers</h2>
                <div className="border border-dashed border-slate-300 rounded-xl overflow-hidden h-64 relative bg-slate-100 flex flex-col">
                    <p className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">Scrollable Content Area</p>
                    <StickyHeader
                        title="Standard Header"
                        className="absolute top-0 w-full"
                    />
                    <StickyHeader
                        title="Header with Action"
                        className="absolute top-32 w-full"
                        rightAction={
                            <div className="flex gap-2">
                                <button className="p-2 bg-white rounded-full shadow-sm text-slate-600"><Bell className="h-5 w-5" /></button>
                            </div>
                        }
                    />
                </div>
            </section>

            {/* Section: Cards */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">2. Standard Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StandardCard>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Basic Card</h3>
                        <p className="text-slate-500 text-sm">Standard white card with rounded corners, subtle border, and shadow.</p>
                    </StandardCard>

                    <StandardCard className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Icon Card</h3>
                            <p className="text-slate-500 text-sm font-medium">Status: Active</p>
                        </div>
                    </StandardCard>

                    <StandardCard className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                        <h3 className="text-lg font-bold text-white mb-2">Colored Card</h3>
                        <p className="text-indigo-100 text-sm">Example of a featured or highlighted card style.</p>
                    </StandardCard>
                </div>
            </section>

            {/* Section: Typography */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">3. Typography</h2>
                <StandardCard className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Heading 1 (Page Titles)</h1>
                        <code className="text-xs text-slate-400">text-3xl font-black text-slate-900 tracking-tight</code>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Heading 2 (Section Titles)</h2>
                        <code className="text-xs text-slate-400">text-xl font-black text-slate-900 tracking-tight</code>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Heading 3 (Card Titles)</h3>
                        <code className="text-xs text-slate-400">text-lg font-bold text-slate-900</code>
                    </div>
                    <div>
                        <p className="text-slate-600">Body Text. The quick brown fox jumps over the lazy dog. Used for descriptions and general content.</p>
                        <code className="text-xs text-slate-400">text-slate-600</code>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Muted Text / Metadata</p>
                        <code className="text-xs text-slate-400">text-slate-400 text-sm</code>
                    </div>
                </StandardCard>
            </section>

            {/* Section: Inputs & Buttons */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">4. Form Elements</h2>
                <StandardCard className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Standard Input</label>
                        <Input placeholder="Type something..." />
                    </div>
                    <div className="flex gap-2">
                        <Button>Primary Button</Button>
                        <Button variant="outline">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>
                </StandardCard>
            </section>

            {/* Section: Tabs */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">5. Tabs</h2>
                <StandardCard className="space-y-4">
                    <StandardTabs>
                        <StandardTab active onClick={() => { }} label="Calendar" icon={Calendar} />
                        <StandardTab active={false} onClick={() => { }} label="History" icon={Clock} />
                        <StandardTab active={false} onClick={() => { }} label="Settings" icon={Settings} />
                    </StandardTabs>
                    <p className="text-sm text-slate-500 text-center">Standard navigation tabs with glassmorphism container and pill-shaped active state.</p>
                </StandardCard>
            </section>

        </PageWrapper>
    );
}
