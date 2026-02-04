"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { getHomepageContentAction } from "@/app/actions/cms-actions";
import { SubscriptionPlan } from "@/types/subscription";
import {
    CheckCircle2, Ticket, ShieldCheck, Zap, Crown,
    Users, CreditCard, Heart, ArrowRight,
    Play, Star, BarChart3, Lock, Smartphone, Globe,
    Mail, Calendar, FileText, Bell, Search, Menu, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

interface HomepageSection {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string;
    isEnabled: boolean;
    sortOrder: number;
}

export default function Home() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getSubscriptionPlansAction().then(data => setPlans(data.slice(0, 3))),
            getHomepageContentAction().then(data => setSections(data.filter(s => s.isEnabled)))
        ]).finally(() => setLoading(false));
    }, []);

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: HomepageSection | undefined) => {
        if (!section) return null;
        try {
            return JSON.parse(section.content);
        } catch {
            return null;
        }
    };

    // Default content if CMS is not configured
    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        badge: "Trusted by 500+ Schools",
        headline: "The Operating System for <span class='text-teal'>Modern</span> Preschools.",
        subheadline: "Streamline admissions, automate billing, and delight parents with a platform built for the future of education.",
        primaryCTA: { text: "Start Free Trial", link: "/signup" },
        secondaryCTA: { text: "Watch Demo", link: "/demo" },
        socialProof: { rating: 4.9, text: "average rating" }
    };

    const featuresSection = getSection("features");
    const featuresContent = parseContent(featuresSection) || {
        features: [
            {
                title: "Automated Billing",
                description: "Invoices generated and sent automatically. Accept payments online and never chase late fees again.",
                icon: "CreditCard",
                type: "billing"
            },
            {
                title: "Parent Communication",
                description: "Beautiful daily reports, photos, and messaging. Keep parents engaged and informed in real-time.",
                icon: "Smartphone",
                type: "communication"
            },
            {
                title: "Admissions Pipeline",
                description: "Track inquiries, tours, and enrollments. Digital text forms that write directly to your database.",
                icon: "BarChart3",
                type: "admissions"
            },
            {
                title: "Staff Management",
                description: "Manage schedules, payroll, and performance reviews in one place.",
                icon: "Users",
                type: "staff"
            },
            {
                title: "Secure Data",
                description: "Bank-grade encryption and daily backups to keep your school's data safe.",
                icon: "Lock",
                type: "security"
            }
        ]
    };

    const ctaSection = getSection("cta");
    const ctaContent = parseContent(ctaSection) || {
        buttonText: "Get Started Now",
        buttonLink: "/signup",
        features: ["14-day free trial", "No credit card required", "Cancel anytime"]
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = { CreditCard, Smartphone, BarChart3, Heart, Lock, Globe, Users };
        return icons[iconName] || Star;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-teal animate-spin" />
                    <div className="text-sm font-bold text-navy/40 uppercase tracking-widest">Loading experience...</div>
                </div>
            </div>
        );
    }

    // Skeleton Visuals for Bento Grid
    const SkeletonBilling = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-sky/10 to-teal/5 p-4 flex-col gap-2 border border-teal/10">
            <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-navy/10 rounded" />
                <div className="h-4 w-8 bg-orange/20 rounded" />
            </div>
            <div className="h-2 w-full bg-teal/5 rounded mt-2" />
            <div className="h-2 w-2/3 bg-teal/5 rounded" />
            <div className="mt-auto flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-teal/10" />
                <div className="h-3 w-12 bg-navy/10 rounded" />
            </div>
        </div>
    );

    const SkeletonPhone = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-teal/10 p-2 relative overflow-hidden shadow-inner bg-slate-50/50">
            <div className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-teal/5 flex items-center px-2 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
            </div>
            <div className="mt-8 space-y-2">
                <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky/20" />
                    <div className="flex-1 bg-teal/5 p-2 rounded-r-lg rounded-bl-lg text-[8px] text-teal font-bold uppercase tracking-tight">
                        Mrs. Jones posted a new photo of Alex.
                    </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-teal" />
                    <div className="flex-1 bg-white p-2 border border-teal/5 rounded-l-lg rounded-br-lg text-[8px] text-navy/60 font-medium">
                        That looks great! Thanks for sharing.
                    </div>
                </div>
            </div>
        </div>
    );

    const SkeletonAdmissions = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-teal/10 p-4 flex-col gap-2">
            <div className="text-[10px] uppercase font-black text-navy/40 tracking-widest mb-2">Pipeline Progress</div>
            <div className="flex gap-1.5 h-full items-end">
                <div className="w-full bg-sky/30 h-[40%] rounded-t-sm" />
                <div className="w-full bg-teal/40 h-[60%] rounded-t-sm" />
                <div className="w-full bg-teal/60 h-[80%] rounded-t-sm" />
                <div className="w-full bg-orange/40 h-[30%] rounded-t-sm" />
            </div>
        </div>
    );

    const SkeletonGeneric = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="space-y-2 animate-pulse">
                <div className="h-2 w-1/2 bg-slate-200 rounded" />
                <div className="h-2 w-full bg-slate-200 rounded" />
                <div className="h-2 w-3/4 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded-full mt-4" />
            </div>
        </div>
    );


    return (
        <div className="isolate bg-white font-sans text-slate-900">
            {/* 1. HERO SECTION */}
            {(!heroSection || heroSection.isEnabled) && (
                <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[500px] bg-teal/10 rounded-full blur-[120px]" />

                    <div className="container mx-auto px-4 text-center relative z-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal/10 bg-white px-4 py-1.5 text-sm font-bold text-teal mb-8 animate-fade-in-up shadow-sm">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-yellow animate-pulse shadow-[0_0_8px_rgba(252,193,26,0.8)]"></span>
                            {heroContent.badge}
                        </div>

                        {/* Headline */}
                        <h1
                            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-navy mb-8 leading-[1.1] max-w-5xl mx-auto"
                            dangerouslySetInnerHTML={{ __html: heroContent.headline }}
                        />

                        {/* Subheadline */}
                        <p className="mx-auto max-w-2xl text-xl text-navy/60 leading-relaxed font-semibold mb-12">
                            {heroContent.subheadline}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <Link
                                className="h-16 px-10 rounded-full bg-orange text-white font-black text-xl flex items-center justify-center gap-2 shadow-xl shadow-orange/25 hover:bg-orange/90 hover:scale-105 transition-all duration-300"
                                href={heroContent.primaryCTA.link}
                            >
                                {heroContent.primaryCTA.text}
                                <ArrowRight className="h-6 w-6" />
                            </Link>
                            <Link
                                className="h-16 px-10 rounded-full bg-white text-navy border border-sky/30 font-black text-xl flex items-center justify-center gap-2 hover:bg-sky/10 transition-all duration-300"
                                href={heroContent.secondaryCTA.link}
                            >
                                <Play className="h-5 w-5 fill-navy" />
                                {heroContent.secondaryCTA.text}
                            </Link>
                        </div>

                        {/* HIGH FIDELITY DASHBOARD MOCKUP */}
                        <div className="relative mx-auto max-w-6xl mt-16 animate-float">
                            <div className="rounded-2xl bg-navy/5 p-2 ring-1 ring-inset ring-navy/10 lg:-m-4 lg:rounded-3xl lg:p-6 backdrop-blur-sm">
                                <div className="rounded-2xl bg-white shadow-[0_32px_64px_-16px_rgba(12,52,73,0.15)] ring-1 ring-navy/10 overflow-hidden border border-teal/10">
                                    {/* Browser Bar */}
                                    <div className="flex items-center gap-4 border-b border-teal/5 bg-slate-50/50 backdrop-blur px-6 py-4">
                                        <div className="flex space-x-2">
                                            <div className="h-3.5 w-3.5 rounded-full bg-red-400" />
                                            <div className="h-3.5 w-3.5 rounded-full bg-yellow" />
                                            <div className="h-3.5 w-3.5 rounded-full bg-teal" />
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <div className="hidden md:flex items-center gap-2 bg-white border border-teal/10 px-4 py-1.5 rounded-lg text-xs font-bold text-navy/30 shadow-sm w-1/3 justify-center tracking-tight">
                                                <Lock className="h-3 w-3" /> bodhiboard.com
                                            </div>
                                        </div>
                                    </div>
                                    {/* App UI */}
                                    <div className="flex aspect-[16/10] bg-white text-left">
                                        {/* Sidebar */}
                                        <div className="hidden md:flex w-72 flex-col border-r border-teal/5 bg-slate-50/30 p-6 gap-3">
                                            <div className="flex items-center gap-3 px-2 mb-10">
                                                <div className="h-10 w-10 bg-teal rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal/20 transition-transform hover:scale-110">B</div>
                                                <span className="font-black text-navy text-xl tracking-tight">BodhiBoard</span>
                                            </div>
                                            {["Dashboard", "Students", "Attendance", "Billing", "Staff", "Reports"].map((item, i) => (
                                                <div key={item} className={cn("px-4 py-3 rounded-xl text-sm font-black flex items-center justify-between transition-all cursor-pointer", i === 0 ? "bg-teal text-white shadow-lg shadow-teal/20" : "text-navy/40 hover:bg-teal/5 hover:text-teal")}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-white" : "bg-navy/20")} />
                                                        {item}
                                                    </div>
                                                    {i === 3 && <span className="text-[10px] bg-yellow text-navy px-1.5 py-0.5 rounded-md">New</span>}
                                                </div>
                                            ))}

                                            <div className="mt-auto p-5 bg-white rounded-2xl border border-teal/5 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-sky/20 border-2 border-white shadow-sm" />
                                                    <div>
                                                        <div className="text-xs font-black text-navy">Sarah Admin</div>
                                                        <div className="text-[10px] text-navy/40 font-bold tracking-widest uppercase mt-0.5">Director</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-8 md:p-12 overflow-hidden relative">
                                            <div className="flex items-center justify-between mb-10">
                                                <div>
                                                    <h3 className="text-3xl font-black text-navy tracking-tight">Dashboard</h3>
                                                    <p className="text-sm text-navy/40 font-bold mt-1 tracking-tight">Welcome back, Sarah! Here's your overview.</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button className="h-12 w-12 text-navy/20 hover:text-teal hover:bg-teal/5 border border-teal/5 rounded-2xl flex items-center justify-center transition-all bg-white shadow-sm">
                                                        <Search className="h-6 w-6" />
                                                    </button>
                                                    <button className="h-12 w-12 text-teal bg-teal/5 border border-teal/10 rounded-2xl flex items-center justify-center transition-all shadow-sm relative">
                                                        <Bell className="h-6 w-6" />
                                                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-orange border-2 border-white rounded-full" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                                {[
                                                    { l: "Students", v: "142", c: "text-teal", bg: "bg-teal/10", ic: Users },
                                                    { l: "Present", v: "128", c: "text-orange", bg: "bg-orange/10", ic: Calendar },
                                                    { l: "Revenue", v: "₹8.4L", c: "text-navy", bg: "bg-navy/5", ic: CreditCard },
                                                    { l: "Inquiries", v: "12", c: "text-yellow-dark", bg: "bg-yellow/10", ic: Sparkles },
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white p-5 rounded-2xl border border-teal/5 shadow-sm flex flex-col gap-3 group hover:border-teal/20 transition-all cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-[10px] font-black text-navy/30 uppercase tracking-widest">{stat.l}</div>
                                                            <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                                                                <stat.ic className={cn("h-4 w-4", stat.c)} />
                                                            </div>
                                                        </div>
                                                        <div className="text-3xl font-black text-navy tracking-tight">{stat.v}</div>
                                                        <div className={cn("text-[9px] font-black px-2 py-1 w-fit rounded-lg tracking-tight", stat.bg, stat.c)}>+12.5% this month</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Charts Row */}
                                            <div className="grid lg:grid-cols-3 gap-8 h-full pb-20">
                                                <div className="col-span-2 bg-white p-8 rounded-3xl border border-teal/5 shadow-sm">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h4 className="font-black text-navy tracking-tight">Campus Attendance</h4>
                                                        <div className="flex gap-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-teal" />
                                                                <span className="text-[10px] font-bold text-navy/40">Present</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-2 w-2 rounded-full bg-orange/40" />
                                                                <span className="text-[10px] font-bold text-navy/40">Absent</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="h-56 flex items-end justify-between gap-3 px-4">
                                                        {[60, 80, 45, 90, 75, 85, 95].map((h, i) => (
                                                            <div key={i} className="w-full bg-teal/5 rounded-t-xl relative group transition-all" style={{ height: `${h}%` }}>
                                                                <div className="absolute bottom-0 w-full bg-teal rounded-t-xl transition-all duration-700 shadow-[0_-8px_16px_rgba(45,156,184,0.1)]" style={{ height: `${h * 0.8}%` }} />
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-navy text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xl transition-all z-20">{(h / 100 * 150).toFixed(0)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between mt-4 text-[10px] font-black text-navy/20 px-4 uppercase tracking-widest">
                                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                                    </div>
                                                </div>

                                                <div className="bg-navy p-8 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                                    <h4 className="font-black text-white mb-6 relative z-10">Real-time Feed</h4>
                                                    <div className="space-y-5 relative z-10">
                                                        {[
                                                            { u: "Sarah J.", a: "marked attendance", t: "2m ago", c: "bg-teal" },
                                                            { u: "Mike T.", a: "generated invoice", t: "15m ago", c: "bg-orange" },
                                                            { u: "System", a: "backup completed", t: "1h ago", c: "bg-sky" }
                                                        ].map((act, i) => (
                                                            <div key={i} className="flex gap-4 items-center">
                                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg", act.c)}>{act.u.charAt(0)}</div>
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-black text-white tracking-tight">{act.u}</div>
                                                                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{act.a}</div>
                                                                </div>
                                                                <div className="text-[9px] text-white/60 font-black px-1.5 py-1 rounded-lg bg-white/5">{act.t}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button className="mt-auto w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition-all border border-white/5 uppercase tracking-widest">History</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 2. SOCIAL PROOF */}
            <section className="py-12 border-y border-slate-100 bg-slate-50/50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted by forward-thinking educators</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {["BrightHorizons", "Montessori", "KinderCare", "Primrose", "Goddard"].map((logo) => (
                            <div key={logo} className="text-2xl font-black text-slate-800 tracking-tighter hover:text-blue-600 cursor-default transition-colors">{logo}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. BENTO GRID FEATURES */}
            {(!featuresSection || featuresSection.isEnabled) && (
                <section className="py-32 bg-slate-50/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                {featuresSection?.title || "Everything you need to run a world-class school."}
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                                {featuresSection?.subtitle || "Powerful features wrapped in a simple, elegant interface."}
                            </p>
                        </div>

                        <BentoGrid className="max-w-6xl mx-auto">
                            {featuresContent.features.map((item: any, i: number) => {
                                const isBilling = item.icon === "CreditCard" || item.type === "billing";
                                const isCommunication = item.icon === "Smartphone" || item.type === "communication";
                                const isAdmissions = item.icon === "BarChart3" || item.type === "admissions";

                                const IconComponent = getIconComponent(item.icon);

                                return (
                                    <BentoGridItem
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        header={
                                            isBilling ? <SkeletonBilling /> :
                                                isCommunication ? <SkeletonPhone /> :
                                                    isAdmissions ? <SkeletonAdmissions /> :
                                                        <SkeletonGeneric />
                                        }
                                        icon={<IconComponent className="h-6 w-6 text-teal group-hover:text-orange transition-colors" />}
                                        className={cn(i === 3 || i === 6 ? "md:col-span-2" : "", "group/bento hover:border-teal/30 transition-all")}
                                    />
                                );
                            })}
                        </BentoGrid>
                    </div>
                </section>
            )}

            {/* 4. PRICING */}
            <section id="pricing" className="py-32 bg-white border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Simple, transparent pricing.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">No hidden fees. No long-term contracts.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                        {plans.length === 0 ? (
                            [1, 2, 3].map(i => <div key={i} className="h-[500px] rounded-3xl bg-white border border-slate-200 animate-pulse" />)
                        ) : (
                            plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex flex-col rounded-[2rem] p-8 transition-all duration-500",
                                        plan.isPopular
                                            ? "bg-navy text-white shadow-2xl shadow-navy/20 border border-navy z-10 scale-105 md:-translate-y-4"
                                            : "bg-white border border-teal/10 hover:border-teal/30 hover:shadow-xl shadow-sm"
                                    )}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 fill-white" /> Recommended
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className={cn("text-2xl font-black mb-2 tracking-tight", plan.isPopular ? "text-white" : "text-navy")}>{plan.name}</h3>
                                        <p className={cn("text-sm font-bold uppercase tracking-widest leading-relaxed", plan.isPopular ? "text-teal" : "text-navy/40")}>{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className={cn("text-5xl font-black tracking-tighter", plan.isPopular ? "text-white" : "text-navy")}>
                                                {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                            </span>
                                            {plan.price > 0 && <span className={cn("text-base font-black uppercase tracking-widest", plan.isPopular ? "text-teal/60" : "text-navy/20")}>/mo</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        <div className={cn("flex items-center gap-3 text-sm font-black uppercase tracking-widest", plan.isPopular ? "text-white" : "text-navy")}>
                                            <Users className={cn("h-5 w-5", plan.isPopular ? "text-teal" : "text-teal")} />
                                            <span>{plan.limits?.maxStudents} Students</span>
                                        </div>
                                        {plan.features.slice(0, 5).map((feature, idx) => (
                                            <div key={idx} className={cn("flex items-start gap-3 text-sm font-semibold", plan.isPopular ? "text-teal/70" : "text-navy/50")}>
                                                <CheckCircle2 className={cn("h-5 w-5 shrink-0", plan.isPopular ? "text-teal" : "text-teal")} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/signup"
                                        className={cn(
                                            "w-full h-14 rounded-2xl flex items-center justify-center font-black text-base transition-all duration-300 uppercase tracking-widest shadow-lg",
                                            plan.isPopular
                                                ? "bg-teal text-white hover:bg-teal/90 shadow-teal/20"
                                                : "bg-navy text-white hover:bg-navy/90 shadow-navy/10"
                                        )}
                                    >
                                        Select {plan.name}
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 5. BIG CTA */}
            {(!ctaSection || ctaSection.isEnabled) && (
                <section className="bg-navy py-40 overflow-hidden relative">
                    {/* Abstract BG */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[150px] opacity-20" />
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange rounded-full blur-[120px] opacity-10" />
                        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky rounded-full blur-[120px] opacity-10" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter max-w-5xl mx-auto leading-tight">
                            {ctaSection?.title || "Ready to transform your school?"}
                        </h2>
                        <p className="text-xl md:text-2xl text-teal mb-16 font-bold uppercase tracking-widest max-w-2xl mx-auto">
                            {ctaSection?.subtitle || "Join thousands of educators who trust Bodhi Board to run their schools efficiently."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                href={ctaContent.buttonLink}
                                className="h-20 px-12 bg-orange text-white rounded-full font-black text-2xl hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{ctaContent.buttonText}</span>
                                <ArrowRight className="h-7 w-7 relative z-10" />
                            </Link>
                        </div>

                        <div className="mt-20 flex flex-wrap justify-center gap-10 text-xs font-black text-white/40 uppercase tracking-[0.2em]">
                            {ctaContent.features.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-yellow shadow-[0_0_8px_rgba(252,193,26,0.5)]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
