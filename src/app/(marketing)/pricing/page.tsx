import { Fragment } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { CheckCircle2, HelpCircle, ArrowRight, X, Sparkles, Zap } from "lucide-react";
import { PricingCarousel } from "@/components/pricing/PricingCarousel";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Pricing | BodhiBoard - Simple & Transparent Pricing",
    description: "Choose the perfect plan for your preschool. Simple pricing with all features included. Start free, upgrade anytime.",
};

export default async function PricingPage() {
    const plans = await getSubscriptionPlansAction();

    // Sort plans by price for proper display order
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <div className="bg-slate-50 font-sans text-navy selection:bg-sky/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-44 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-[800px] bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(45,156,184,0.15),rgba(255,255,255,0))]" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px]" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-navy text-white shadow-2xl text-xs font-black uppercase tracking-[0.2em] mb-10 hover:scale-105 transition-transform cursor-default select-none animate-bounce-subtle">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        Simple & Transparent
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-navy mb-10 tracking-tighter leading-[0.9] drop-shadow-sm">
                        Simple pricing,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-blue-600">transparent value</span>.
                    </h1>
                    <p className="text-2xl md:text-3xl text-navy/40 font-bold uppercase tracking-[0.2em] max-w-3xl mx-auto mb-12">
                        Everything you need to run a modern preschool.<br className="hidden md:block" /> No hidden fees. No surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Cards Carousel */}
            <section className="-mt-24 pb-24 relative z-20">
                <PricingCarousel plans={sortedPlans} />
            </section>

            {/* Feature Comparison Table */}
            <section className="container mx-auto px-4 pb-32">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-navy mb-4 tracking-tight">Compare features</h2>
                        <p className="text-navy/40 font-bold uppercase tracking-widest text-sm">
                            Detailed breakdown of what&apos;s included in each plan.
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-navy/5 overflow-hidden ring-1 ring-white/60 relative">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
                                    <tr>
                                        <th className="p-8 w-1/3 text-[10px] font-black text-navy/40 uppercase tracking-[0.3em]">
                                            Module Breakdown
                                        </th>
                                        {sortedPlans.map(plan => (
                                            <th key={plan.id} className={cn(
                                                "p-8 text-center transition-all duration-300",
                                                plan.isPopular ? "bg-navy text-white" : "text-navy"
                                            )}>
                                                <div className="text-sm font-black uppercase tracking-widest">{plan.name}</div>
                                                <div className={cn("text-[10px] font-bold mt-2", plan.isPopular ? "text-teal" : "text-teal")}>
                                                    {plan.price === 0 ? "Free" : `₹${plan.price}/mo`}
                                                </div>
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
                                                    <td colSpan={sortedPlans.length + 1} className="px-8 py-4 bg-navy/5 border-y border-navy/5">
                                                        <span className="text-[10px] font-extrabold text-navy uppercase tracking-[0.3em] flex items-center gap-2">
                                                            <Sparkles className="h-3 w-3 text-teal" />
                                                            {MODULE_CATEGORIES[catKey]}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {categoryModules.map(mod => (
                                                    <tr key={mod.id} className="group hover:bg-slate-50 transition-colors">
                                                        <td className="p-8">
                                                            <div className="font-extrabold text-navy text-sm tracking-tight group-hover:text-teal transition-colors duration-300">{mod.label}</div>
                                                            <div className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-1 group-hover:text-navy/60 transition-colors">
                                                                {mod.description}
                                                            </div>
                                                        </td>
                                                        {sortedPlans.map(plan => {
                                                            const isIncluded = (plan.includedModules || []).includes(mod.id);
                                                            return (
                                                                <td key={plan.id} className={cn(
                                                                    "p-8 text-center transition-all duration-300",
                                                                    plan.isPopular ? "bg-navy/[0.03]" : ""
                                                                )}>
                                                                    <div className="flex justify-center">
                                                                        {isIncluded ? (
                                                                            <div className={cn(
                                                                                "inline-flex items-center justify-center p-2 rounded-full shadow-lg transition-transform duration-500 group-hover:scale-125",
                                                                                plan.isPopular ? "bg-teal text-white shadow-teal/40" : "bg-teal/10 text-teal"
                                                                            )}>
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="inline-flex items-center justify-center p-2 rounded-full opacity-10 grayscale">
                                                                                <X className="h-4 w-4 text-navy" />
                                                                            </div>
                                                                        )}
                                                                    </div>
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

            {/* FAQ Section */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex h-12 w-12 rounded-2xl bg-slate-100 items-center justify-center mb-6">
                            <HelpCircle className="h-6 w-6 text-slate-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Questions? We have answers.</h2>
                    </div>

                    <div className="grid gap-6">
                        {[
                            { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade your plan at any time from your admin dashboard. Your data will be preserved." },
                            { q: "Do you offer a free trial?", a: "Absolutely! Our Free tier lets you try all basic features with up to 25 students, no credit card required." },
                            { q: "What about data security?", a: "We use enterprise-grade encryption and daily backups to ensure your school's data is always safe and recoverable." },
                            { q: "Is training included?", a: "Yes, all paid plans come with a dedicated onboarding session and access to our video training library." }
                        ].map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <h3 className="font-bold text-lg text-slate-900 mb-3">{faq.q}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm font-medium">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 bg-navy text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[200px] opacity-20 pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">Ready to get started?</h2>
                    <p className="text-xl md:text-2xl text-teal mb-16 font-bold uppercase tracking-[0.2em]">
                        Join thousands of educators transforming their schools today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/signup" className="h-20 px-12 bg-orange text-white rounded-full font-black text-2xl hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3">
                            Start Free Trial
                            <ArrowRight className="h-7 w-7" />
                        </Link>
                        <Link href="/contact" className="h-20 px-12 bg-white/5 border border-white/10 text-white rounded-full font-black text-2xl hover:bg-white/10 transition-all flex items-center">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
