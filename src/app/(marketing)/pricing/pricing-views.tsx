"use client";

import { useState } from "react";
import Link from "next/link";
import { SubscriptionPlan } from "@/types/subscription";
import { Sparkles, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingViewsProps {
    plans: SubscriptionPlan[];
    heroContent: any;
}

export default function PricingViews({ plans, heroContent }: PricingViewsProps) {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <>
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
        </>
    );
}
