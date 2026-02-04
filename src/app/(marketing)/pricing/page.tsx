"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { CheckCircle2, Ticket, ShieldCheck, Zap, Crown, Star, ArrowRight, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Pastel Palette from user
const colors = {
    pink: "#FFD2CF",
    peach: "#FFE2C2",
    cream: "#FCEBC7",
    offWhite: "#FBF6E2",
    lightGreen: "#EDF7CB",
    green: "#D8F2C9",
    teal: "#BDF0D8",
    blue: "#B6E9F0"
};

export default function PricingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

    useEffect(() => {
        getSubscriptionPlansAction().then(setPlans).catch(console.error);
    }, []);

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "free": return <Ticket className="h-6 w-6 text-slate-500" />;
            case "basic": return <ShieldCheck className="h-6 w-6 text-[#7EBC89]" />;
            case "premium": return <Zap className="h-6 w-6 text-[#E6A57E]" />;
            case "enterprise": return <Crown className="h-6 w-6 text-[#D68F8A]" />;
            default: return <Ticket className="h-6 w-6" />;
        }
    };

    return (
        <div className="bg-[#FBF6E2] font-sans text-slate-800">
            {/* Hero Section */}
            <section className="relative pt-24 pb-48 overflow-hidden">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[80px] bg-[#B6E9F0] opacity-40 pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        Transparent Pricing <span className="text-[#FF9F99]">for Every School</span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10">
                        Whether you are a small daycare or a multi-campus institution, we have a plan that fits your needs perfectly.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-[#D8F2C9] text-[#558B2F] px-4 py-2 rounded-full text-sm font-bold border border-[#C5E1A5] shadow-sm">
                        <Star className="h-4 w-4 fill-current" />
                        No hidden fees. Cancel anytime.
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-4 pb-24 -mt-32">
                <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {plans.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-96 rounded-[2.5rem] bg-white/50 border border-slate-100 shadow-sm animate-pulse" />
                        ))
                    ) : (
                        plans.map(plan => (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-300",
                                    plan.isPopular
                                        ? "bg-[#FFE2C2] shadow-xl scale-105 z-10 ring-8 ring-white"
                                        : "bg-white border text-slate-800 hover:-translate-y-1 hover:shadow-lg border-slate-100"
                                )}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6 flex items-center justify-between">
                                    <div className={cn(
                                        "p-3 rounded-2xl",
                                        plan.isPopular ? "bg-white text-[#E6A57E]" : "bg-slate-50 text-slate-500"
                                    )}>
                                        {getTierIcon(plan.tier)}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                                <p className="text-sm font-bold text-slate-500 mt-2 mb-6 min-h-[40px]">{plan.description}</p>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-slate-900">
                                            {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                        </span>
                                        {plan.price > 0 && <span className="text-slate-400 font-bold">/mo</span>}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Billed {plan.billingPeriod}</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {plan.features.slice(0, 6).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                            <CheckCircle2 className={cn("h-5 w-5 shrink-0", plan.isPopular ? "text-[#E6A57E]" : "text-[#7EBC89]")} />
                                            {feature}
                                        </div>
                                    ))}
                                    <div className="h-px bg-slate-200/50 my-4" />
                                    <div className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                        <CheckCircle2 className="h-5 w-5 text-slate-300 shrink-0" />
                                        Up to <span className="text-slate-900">{plan.limits?.maxStudents}</span> Students
                                    </div>
                                    <div className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                        <CheckCircle2 className="h-5 w-5 text-slate-300 shrink-0" />
                                        Up to <span className="text-slate-900">{plan.limits?.maxStaff}</span> Staff Members
                                    </div>
                                    <div className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                        <CheckCircle2 className="h-5 w-5 text-slate-300 shrink-0" />
                                        <span className="text-slate-900">{plan.limits?.maxStorageGB}GB</span> Cloud Storage
                                    </div>
                                </div>

                                <Link
                                    href="/signup"
                                    className={cn(
                                        "w-full rounded-xl py-4 px-6 text-center text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        plan.isPopular
                                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-xl"
                                            : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    Choose {plan.name}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Feature Comparison Table */}
            <section className="container mx-auto px-4 pb-24">
                <div className="max-w-6xl mx-auto rounded-[2.5rem] p-8 md:p-12 bg-white border border-slate-100 shadow-sm overflow-hidden">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Comprehensive Comparison</h2>
                    <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
                        Detailed breakdown of what's included in each plan so you can make an informed decision.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 w-1/3 bg-slate-50 rounded-tl-2xl rounded-bl-2xl text-xs font-black text-slate-400 uppercase tracking-wider">Features</th>
                                    {plans.map(plan => (
                                        <th key={plan.id} className="p-4 text-center">
                                            <div className="text-lg font-black text-slate-900">{plan.name}</div>
                                            <div className="text-sm font-bold text-slate-400">{plan.price === 0 ? "Free" : `₹${plan.price}/mo`}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Core Resources Row */}
                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">Student Capacity</td>
                                    {plans.map(plan => (
                                        <td key={plan.id} className="p-4 text-center text-sm font-bold text-slate-900">
                                            {plan.limits?.maxStudents}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">Staff Capacity</td>
                                    {plans.map(plan => (
                                        <td key={plan.id} className="p-4 text-center text-sm font-bold text-slate-900">
                                            {plan.limits?.maxStaff}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">Cloud Storage</td>
                                    {plans.map(plan => (
                                        <td key={plan.id} className="p-4 text-center text-sm font-bold text-slate-900">
                                            {plan.limits?.maxStorageGB} GB
                                        </td>
                                    ))}
                                </tr>

                                {/* Modules Loops */}
                                {(Object.keys(MODULE_CATEGORIES) as Array<keyof typeof MODULE_CATEGORIES>).map((catKey) => {
                                    const categoryModules = ALL_MODULES.filter(m => m.category === catKey);
                                    if (categoryModules.length === 0) return null;

                                    return (
                                        <>
                                            <tr key={catKey}>
                                                <td colSpan={plans.length + 1} className="p-4 pt-10 pb-4">
                                                    <span className="text-xs font-black text-[#E6A57E] uppercase tracking-widest bg-[#FFE2C2]/30 px-3 py-1 rounded-full">
                                                        {MODULE_CATEGORIES[catKey]}
                                                    </span>
                                                </td>
                                            </tr>
                                            {categoryModules.map(mod => (
                                                <tr key={mod.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-700">{mod.label}</div>
                                                        <div className="text-xs font-medium text-slate-400">{mod.description}</div>
                                                    </td>
                                                    {plans.map(plan => {
                                                        const isIncluded = (plan.includedModules || []).includes(mod.id);
                                                        return (
                                                            <td key={plan.id} className="p-4 text-center">
                                                                {isIncluded ? (
                                                                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#D8F2C9] text-[#558B2F]">
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-white py-24 rounded-t-[3rem]">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from your admin dashboard." },
                            { q: "Do you offer a free trial?", a: "Absolutely! You can start with our Free subscription to test the waters with up to 20 students." },
                            { q: "What happens if I exceed my student limit?", a: "We will notify you when you approach your limit. You'll need to upgrade to the next tier to add more students." },
                            { q: "Is my data secure?", a: "Security is our top priority. We use industry-standard encryption and backup your data daily." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-[#FBF6E2] rounded-[2rem] p-8 shadow-sm border border-[#FCEBC7] hover:border-[#FFE2C2] transition-colors">
                                <h3 className="flex items-center gap-3 font-bold text-lg text-slate-900 mb-3">
                                    <HelpCircle className="h-6 w-6 text-[#E6A57E]" />
                                    {faq.q}
                                </h3>
                                <p className="text-slate-600 pl-9 font-medium leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
