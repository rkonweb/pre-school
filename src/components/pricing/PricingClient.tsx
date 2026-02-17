"use client";

import { motion } from "motion/react";
import {
    Check,
    X,
    Building2,
    Users,
    TrendingUp,
    Shield,
    Sparkles,
    Phone,
    CreditCard,
    Calendar,
    ArrowRight,
    Plus,
    Minus,
    Info,
    Award,
    Zap,
    Globe,
    Database,
    BookOpen,
    GraduationCap,
    BookText,
    MessageSquare,
    Package,
    Bus,
    Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@/types/subscription";

interface PricingClientProps {
    plans: SubscriptionPlan[];
}

const ALL_MODULES = [
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'staff', label: 'Staff Management', icon: Shield },
    { id: 'attendance', label: 'Attendance Tracking', icon: Calendar },
    { id: 'admissions', label: 'Admissions & Leads', icon: Sparkles },
    { id: 'billing', label: 'Fee Management', icon: CreditCard },
    { id: 'academics', label: 'Academic Planning', icon: GraduationCap },
    { id: 'diary', label: 'Digital Diary', icon: BookText },
    { id: 'communication', label: 'Parent App Connect', icon: MessageSquare },
    { id: 'inventory', label: 'Inventory Management', icon: Package },
    { id: 'transport', label: 'Transport Tracking', icon: Bus },
    { id: 'library', label: 'Library Management', icon: Library },
    { id: 'settings', label: 'School Settings', icon: Database },
];

export function PricingClient({ plans }: PricingClientProps) {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = useState(false);

    // Find the growth plan or default to the second plan for additional user pricing
    // If no plans, default to 299
    const growthPlan = plans.find(p => p.slug === 'growth') || plans[1] || plans[0];

    const trustIndicators = [
        { icon: Shield, text: "No hidden fees" },
        { icon: Calendar, text: "No long-term lock-ins" },
        { icon: Check, text: "Cancel or change anytime" }
    ];



    const trialFeatures = [
        { icon: Sparkles, text: "Full feature access" },
        { icon: CreditCard, text: "No credit card required" },
        { icon: Calendar, text: "Cancel anytime" }
    ];

    const transparencyPoints = [
        { icon: Database, text: "Your data always belongs to you" },
        { icon: Users, text: "Pay only for active users" },
        { icon: Globe, text: "Built and supported in India" }
    ];

    const getPlanLabel = (tier: string) => {
        switch (tier) {
            case 'free': return "For new & small schools";
            case 'basic': return "Most Popular";
            case 'premium': return "For large schools & chains";
            default: return "Flexible Plan";
        }
    };

    const getPlanCta = (tier: string) => {
        if (tier === 'enterprise') return "Talk to Our Team";
        return "Start Free Trial";
    };

    const handlePlanAction = (tier: string) => {
        if (tier === 'enterprise') {
            // Open contact form or scroll to contact section
            // For now, redirect to contact page if exists, or just do nothing
        } else {
            router.push(`/signup?billing=${isAnnual ? 'annual' : 'monthly'}`);
        }
    };

    return (
        <div className="bg-white pt-[100px]">
            {/* SECTION 1 — PRICING HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30 pt-20 md:pt-28 pb-10 md:pb-12">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Simple, Transparent Pricing{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                That Grows With Your School
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-slate-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Choose a plan, then add users only if you need them. No surprises.
                        </motion.p>



                        {/* Trust Indicators */}
                        <motion.div
                            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {trustIndicators.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.text}
                                        className="flex items-center gap-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <span className="text-slate-700 font-semibold">{item.text}</span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </div>
            </section>



            {/* SECTION 3 — PRICING PLANS */}
            <section className="pt-10 md:pt-12 pb-16 md:pb-24 bg-gradient-to-br from-slate-50 to-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Toggle */}
                    <motion.div
                        className="flex items-center justify-center gap-4 mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-slate-900" : "text-slate-500"}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAnnual ? "bg-teal-500" : "bg-slate-200"
                                }`}
                        >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? "translate-x-5" : "translate-x-0"
                                }`} />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-slate-900" : "text-slate-500"}`}>
                            Annually <span className="text-teal-600 font-bold ml-1">(Save 25%)</span>
                        </span>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((plan, index) => {
                            const price = isAnnual ? Math.round(plan.price * 12 * 0.75) : plan.price;

                            return (
                                <motion.div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-8 ${plan.isPopular
                                        ? 'bg-white border-2 border-teal-500 shadow-2xl shadow-teal-500/20 scale-105 md:scale-110'
                                        : 'bg-white border-2 border-slate-200 shadow-lg'
                                        }`}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    {/* Badge for highlighted plan */}
                                    {plan.isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                                                <Award className="h-4 w-4" />
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {/* Plan Header */}
                                        <div>
                                            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">
                                                {getPlanLabel(plan.tier)}
                                            </p>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl md:text-5xl font-bold text-slate-900">
                                                    {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                                                </span>
                                                {price > 0 && (
                                                    <span className="text-lg text-slate-600">/ {isAnnual ? 'year' : 'month'}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2 font-medium">
                                                Up to {plan.limits.maxStaff} users included
                                            </p>
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            onClick={() => handlePlanAction(plan.tier)}
                                            className={`w-full py-6 text-base font-bold rounded-xl shadow-lg transition-all ${plan.isPopular
                                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 shadow-amber-500/30'
                                                : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700'
                                                }`}
                                        >
                                            {getPlanCta(plan.tier)}
                                        </Button>

                                        {/* Features List (Short) */}
                                        <div className="pt-6 space-y-3">
                                            {plan.features.slice(0, 3).map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-start gap-3">
                                                    <div className="mt-0.5">
                                                        <Check className="h-4 w-4 text-teal-600" />
                                                    </div>
                                                    <span className="text-xs text-slate-700">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Module Comparison Chart */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Included Modules</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {ALL_MODULES.map((module) => {
                                                    const isIncluded = plan.includedModules.includes(module.id);
                                                    const Icon = module.icon;
                                                    return (
                                                        <div key={module.id} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-lg ${isIncluded ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-300'}`}>
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <span className={`text-sm font-medium ${isIncluded ? 'text-slate-700' : 'text-slate-400'}`}>
                                                                    {module.label}
                                                                </span>
                                                            </div>
                                                            {isIncluded ? (
                                                                <Check className="h-5 w-5 text-teal-500" />
                                                            ) : (
                                                                <Minus className="h-5 w-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>



            {/* SECTION 6 — 30-DAY FREE TRIAL REINFORCEMENT */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                            Try Bodhi Board Free for 30 Days
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {trialFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.text}
                                        className="flex flex-col items-center gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <span className="text-lg font-semibold text-white">{feature.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => router.push("/signup")}
                                size="lg"
                                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 px-12 py-8 text-xl font-bold rounded-full shadow-2xl shadow-amber-500/30"
                            >
                                Start Your 30-Day Free Trial
                                <ArrowRight className="h-6 w-6 ml-3" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 7 — TRANSPARENCY & TRUST */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Built on Trust & Transparency
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {transparencyPoints.map((point, index) => {
                                const Icon = point.icon;
                                return (
                                    <motion.div
                                        key={point.text}
                                        className="flex flex-col items-center text-center gap-4 p-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                            <Icon className="h-7 w-7 text-teal-600" />
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">{point.text}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 8 — FINAL CTA */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Choose a Plan That{" "}
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                Fits Your School Today
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl text-slate-300">
                            Scale seamlessly as your team grows
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => router.push("/signup")}
                                    size="lg"
                                    className="bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:from-teal-500 hover:to-cyan-600 px-10 py-7 text-lg font-bold rounded-full shadow-2xl shadow-teal-500/30"
                                >
                                    Start Free Trial
                                    <ArrowRight className="h-6 w-6 ml-2" />
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-teal-400 bg-transparent text-teal-300 hover:bg-teal-400/10 px-10 py-7 text-lg font-bold rounded-full"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    Talk to Our Education Team
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
