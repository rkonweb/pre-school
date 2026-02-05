import { Fragment } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { CheckCircle2, HelpCircle, ArrowRight, X, Sparkles, Zap } from "lucide-react";
import { Metadata } from "next";

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
            <section className="relative pt-32 pb-40 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[600px] bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(45,156,184,0.1),rgba(255,255,255,0))]" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy text-white shadow-xl text-xs font-black uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="h-3.5 w-3.5 text-yellow animate-pulse" />
                        Simple Pricing
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-navy mb-8 tracking-tighter leading-[1]">
                        Simple pricing,<br />
                        <span className="text-teal">transparent value</span>.
                    </h1>
                    <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto mb-10">
                        Everything you need to run a modern preschool. No hidden fees.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-4 -mt-20 relative z-20 pb-24">
                <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
                    {sortedPlans.map((plan, index) => {
                        const isMiddle = index === 1 && sortedPlans.length === 3;
                        const isPopular = plan.isPopular || isMiddle;

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-8 rounded-[3rem] transition-all duration-500 group ${isPopular
                                        ? "bg-navy text-white shadow-[0_40px_80px_-15px_rgba(12,52,73,0.3)] ring-1 ring-navy scale-105 md:-translate-y-6 z-10"
                                        : "bg-white text-navy shadow-2xl shadow-navy/5 border border-teal/5 hover:-translate-y-2"
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                        <Zap className="h-3.5 w-3.5 fill-white" /> Recommended
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className={`text-2xl font-black mb-2 tracking-tight ${isPopular ? "text-white" : "text-navy"}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm font-bold uppercase tracking-widest ${isPopular ? "text-teal" : "text-navy/30"}`}>
                                        {plan.description || `${plan.tier} tier plan`}
                                    </p>
                                </div>

                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className={`text-6xl font-black tracking-tighter ${isPopular ? "text-white" : "text-navy"}`}>
                                        {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className={`text-sm font-black uppercase tracking-widest ${isPopular ? "text-teal/40" : "text-navy/20"}`}>
                                            /mo
                                        </span>
                                    )}
                                </div>

                                {/* Plan Limits */}
                                <div className={`mb-6 p-4 rounded-2xl ${isPopular ? "bg-white/5" : "bg-slate-50"}`}>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className={`text-2xl font-black ${isPopular ? "text-white" : "text-navy"}`}>
                                                {plan.limits?.maxStudents || 25}
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isPopular ? "text-white/40" : "text-navy/30"}`}>
                                                Students
                                            </div>
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-black ${isPopular ? "text-white" : "text-navy"}`}>
                                                {plan.limits?.maxStaff || 5}
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isPopular ? "text-white/40" : "text-navy/30"}`}>
                                                Staff
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Features from plan.features */}
                                <div className="space-y-3 mb-10 flex-1">
                                    {(plan.features || []).slice(0, 6).map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm font-bold">
                                            <div className={`mt-0.5 rounded-full p-0.5 ${isPopular ? "bg-teal/20 text-teal" : "bg-teal/10 text-teal"}`}>
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <span className={isPopular ? "text-white/60" : "text-navy/50"}>{feature}</span>
                                        </div>
                                    ))}

                                    {/* Show module count */}
                                    <div className="flex items-start gap-3 text-sm font-bold pt-2">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${isPopular ? "bg-teal/20 text-teal" : "bg-teal/10 text-teal"}`}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className={isPopular ? "text-white/60" : "text-navy/50"}>
                                            {(plan.includedModules || []).length} Modules Included
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/signup"
                                    className={`w-full rounded-[1.25rem] py-5 text-center text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${isPopular
                                            ? "bg-teal text-white hover:bg-teal/90 shadow-teal/20"
                                            : "bg-navy text-white hover:bg-navy/90 shadow-navy/20"
                                        }`}
                                >
                                    {plan.price === 0 ? "Start Free" : "Select Plan"}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
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

                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-teal/5">
                                        <th className="p-8 w-1/2 text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">
                                            Module Breakdown
                                        </th>
                                        {sortedPlans.map(plan => (
                                            <th key={plan.id} className="p-8 text-center bg-white/50">
                                                <div className="text-xs font-black text-navy uppercase tracking-widest">{plan.name}</div>
                                                <div className="text-[10px] text-navy/30 font-bold mt-1">
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
                                                    <td colSpan={sortedPlans.length + 1} className="px-6 py-3 bg-slate-50/30">
                                                        <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                                                            {MODULE_CATEGORIES[catKey]}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {categoryModules.map(mod => (
                                                    <tr key={mod.id} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-8">
                                                            <div className="font-black text-navy text-sm tracking-tight">{mod.label}</div>
                                                            <div className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-1">
                                                                {mod.description}
                                                            </div>
                                                        </td>
                                                        {sortedPlans.map(plan => {
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
