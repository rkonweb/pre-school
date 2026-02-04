"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { getPricingPageContentAction } from "@/app/actions/cms-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { CheckCircle2, HelpCircle, ArrowRight, X, Sparkles, Zap, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingSection {
    sectionKey: string;
    content: string;
    isEnabled: boolean;
}

export default function PricingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [sections, setSections] = useState<PricingSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(true); // Premium UI toggle

    useEffect(() => {
        Promise.all([
            getSubscriptionPlansAction().then((data) => setPlans(data)),
            getPricingPageContentAction().then((data: any) => setSections(data))
        ]).finally(() => setLoading(false));
    }, []);

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: PricingSection | undefined) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    // Default Fallbacks
    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        headline: "Simple pricing, <br/><span class='text-teal'>transparent value</span>.",
        description: "Everything you need to run a modern educational institution. No hidden fees. Cancel anytime.",
        badge: "Simple Pricing",
    };

    const faqSection = getSection("faq");
    const faqContent = parseContent(faqSection) || {
        title: "Questions? We have answers.",
        questions: [
            { "q": "Can I upgrade my plan later?", "a": "Yes, you can upgrade specific modules or your entire plan tier at any time from your admin dashboard." },
            { "q": "Do you offer a free trial?", "a": "Absolutely! We offer a 14-day full access trial for the Professional plan, no credit card required." },
            { "q": "What about data security?", "a": "We use enterprise-grade encryption and daily backups to ensure your school's data is always safe and recoverable." },
            { "q": "Is training included?", "a": "Yes, all paid plans come with a dedicated onboarding session and access to our video training library." }
        ]
    };

    const comparisonSection = getSection("comparison");
    const comparisonContent = parseContent(comparisonSection) || { showTable: true, title: "Compare features", description: "Detailed breakdown of what's included." };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-teal animate-spin" /></div>;
    }

    return (
        <div className="bg-slate-50 font-sans text-navy selection:bg-sky/30">
            {/* Hero Section - Gradient Background */}
            <section className="relative pt-32 pb-40 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(45,156,184,0.1),rgba(255,255,255,0))]" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy text-white shadow-xl text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
                        <Sparkles className="h-3.5 w-3.5 text-yellow animate-pulse" />
                        {heroContent.badge}
                    </div>
                    <h1
                        className="text-5xl md:text-8xl font-black text-navy mb-8 tracking-tighter leading-[1] animate-fade-in-up delay-100"
                        dangerouslySetInnerHTML={{ __html: heroContent.headline }}
                    />
                    <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                        {heroContent.description}
                    </p>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <span className={cn("text-sm font-black uppercase tracking-widest transition-colors", !isAnnual ? "text-navy" : "text-navy/30")}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative h-9 w-16 bg-navy/10 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-teal/20"
                        >
                            <span className={cn("block h-7 w-7 rounded-full bg-white shadow-xl transition-all duration-300 transform", isAnnual ? "translate-x-8 bg-teal" : "translate-x-1")} />
                        </button>
                        <span className={cn("text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2", isAnnual ? "text-navy" : "text-navy/30")}>
                            Yearly <span className="text-[10px] bg-orange text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg shadow-orange/20">Save 20%</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-4 -mt-20 relative z-20 pb-24">
                <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
                    {plans.map((plan, index) => {
                        const price = isAnnual ? Math.round(plan.price * 12 * 0.8 / 12) : plan.price;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col p-8 rounded-[3rem] transition-all duration-500 group",
                                    plan.isPopular
                                        ? "bg-navy text-white shadow-[0_40px_80px_-15px_rgba(12,52,73,0.3)] ring-1 ring-navy scale-105 md:-translate-y-6 z-10"
                                        : "bg-white text-navy shadow-2xl shadow-navy/5 border border-teal/5 hover:-translate-y-2"
                                )}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                        <Zap className="h-3.5 w-3.5 fill-white" /> Recommended
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={cn("text-2xl font-black mb-2 tracking-tight", plan.isPopular ? "text-white" : "text-navy")}>{plan.name}</h3>
                                    <p className={cn("text-sm font-bold uppercase tracking-widest", plan.isPopular ? "text-teal" : "text-navy/30")}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className={cn("text-6xl font-black tracking-tighter", plan.isPopular ? "text-white" : "text-navy")}>
                                        {price === 0 ? "Free" : `₹${price}`}
                                    </span>
                                    {price > 0 && <span className={cn("text-sm font-black uppercase tracking-widest", plan.isPopular ? "text-teal/40" : "text-navy/20")}>/mo</span>}
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {plan.features.slice(0, 6).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm font-bold">
                                            <div className={cn("mt-0.5 rounded-full p-0.5", plan.isPopular ? "bg-teal/20 text-teal" : "bg-teal/10 text-teal")}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <span className={plan.isPopular ? "text-white/60" : "text-navy/50"}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/signup"
                                    className={cn(
                                        "w-full rounded-[1.25rem] py-5 text-center text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl",
                                        plan.isPopular
                                            ? "bg-teal text-white hover:bg-teal/90 shadow-teal/20"
                                            : "bg-navy text-white hover:bg-navy/90 shadow-navy/20"
                                    )}
                                >
                                    Select Plan
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Feature Comparison Table */}
            {(!comparisonSection || comparisonSection.isEnabled) && comparisonContent.showTable && (
                <section className="container mx-auto px-4 pb-32">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-navy mb-4 tracking-tight">{comparisonContent.title}</h2>
                            <p className="text-navy/40 font-bold uppercase tracking-widest text-sm">Find the perfect fit for your institution.</p>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-teal/5">
                                            <th className="p-8 w-1/2 text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">Module Breakdown</th>
                                            {plans.map(plan => (
                                                <th key={plan.id} className="p-8 text-center bg-white/50">
                                                    <div className="text-xs font-black text-navy uppercase tracking-widest">{plan.name}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(Object.keys(MODULE_CATEGORIES) as Array<keyof typeof MODULE_CATEGORIES>).map((catKey) => {
                                            const categoryModules = ALL_MODULES.filter(m => m.category === catKey);
                                            if (categoryModules.length === 0) return null;

                                            return (
                                                <Fragment key={catKey}>
                                                    <tr>
                                                        <td colSpan={plans.length + 1} className="px-6 py-3 bg-slate-50/30">
                                                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                                                                {MODULE_CATEGORIES[catKey]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {categoryModules.map(mod => (
                                                        <tr key={mod.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-8">
                                                                <div className="font-black text-navy text-sm tracking-tight">{mod.label}</div>
                                                                <div className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-1">{mod.description}</div>
                                                            </td>
                                                            {plans.map(plan => {
                                                                const isIncluded = (plan.includedModules || []).includes(mod.id);
                                                                return (
                                                                    <td key={plan.id} className="p-8 text-center">
                                                                        {isIncluded ? (
                                                                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-teal/10 text-teal">
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="inline-flex items-center justify-center p-1 rounded-full">
                                                                                <X className="h-4 w-4 text-navy/10" />
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ with cleaner styling */}
            {(!faqSection || faqSection.isEnabled) && (
                <section className="py-24 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex h-12 w-12 rounded-2xl bg-slate-100 items-center justify-center mb-6">
                                <HelpCircle className="h-6 w-6 text-slate-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900">{faqContent.title}</h2>
                        </div>

                        <div className="grid gap-6">
                            {(faqContent.questions || []).map((faq: any, i: number) => (
                                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <h3 className="font-bold text-lg text-slate-900 mb-3">
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-40 bg-navy text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[200px] opacity-20 pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">Ready to get started?</h2>
                    <p className="text-xl md:text-2xl text-teal mb-16 font-bold uppercase tracking-[0.2em]">Join thousands of educators transforming their schools today.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/signup" className="h-20 px-12 bg-orange text-white rounded-full font-black text-2xl hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3">
                            Start Free Trial
                            <ArrowRight className="h-7 w-7" />
                        </Link>
                        <Link href="/demo" className="h-20 px-12 bg-white/5 border border-white/10 text-white rounded-full font-black text-2xl hover:bg-white/10 transition-all flex items-center">
                            Book a Demo
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
