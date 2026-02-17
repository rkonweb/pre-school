"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Zap, Users, Shield, Calendar, Sparkles, CreditCard, GraduationCap, BookText, MessageSquare, Package, Bus, Library, Database, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { updateSignupStepAction } from "@/app/actions/auth-actions";

export function PlanSelection() {
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(true);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const ALL_MODULES = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'staff', label: 'Staff', icon: Shield },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'admissions', label: 'Admissions', icon: Sparkles },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'academics', label: 'Academics', icon: GraduationCap },
        { id: 'diary', label: 'Diary', icon: BookText },
        { id: 'communication', label: 'Communication', icon: MessageSquare },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'transport', label: 'Transport', icon: Bus },
        { id: 'library', label: 'Library', icon: Library },
        { id: 'settings', label: 'Settings', icon: Database },
    ];

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await getSubscriptionPlansAction();
                setPlans(data);
                // Default to first paid plan or growth
                const defaultPlan = data.find(p => p.slug === "growth") || data[0];
                if (defaultPlan) setSelectedPlanId(defaultPlan.id);
            } catch (error) {
                console.error("Failed to load plans", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPlans();
    }, []);

    const handleContinue = async () => {
        if (!selectedPlanId) return;
        setIsSubmitting(true);

        try {
            // 1. Store selection
            if (typeof window !== "undefined") {
                sessionStorage.setItem("selectedPlan", selectedPlanId);
            }

            // 2. Update Progress
            const phone = sessionStorage.getItem("phoneNumber");
            if (phone) {
                await updateSignupStepAction(phone, "SCHOOL_SETUP");
            }

            // 3. Navigate
            router.push("/signup/setup");
        } catch (error) {
            console.error("Plan selection error", error);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-500/30 shadow-2xl shadow-teal-500/10 mb-4">
                    <span className="text-3xl">💎</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
                    Choose Your Plan
                </h1>
                <p className="text-lg text-slate-400">
                    Transparent pricing for schools of all sizes.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-white" : "text-slate-500")}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={cn(
                            "relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            isAnnual ? "bg-teal-500" : "bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isAnnual ? "translate-x-5" : "translate-x-0"
                        )} />
                    </button>
                    <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-white" : "text-slate-500")}>
                        Annually <span className="text-teal-400 font-bold ml-1">(Save 25%)</span>
                    </span>
                </div>
            </div>

            {/* Action (Primary CTA) */}
            <div className="max-w-xl w-full mx-auto mb-16 space-y-8 text-center bg-slate-800/20 py-10 px-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
                <div className="space-y-3">
                    <p className="text-teal-400 text-xl font-bold tracking-tight">
                        🎉 Ready to Start Your Journey?
                    </p>
                    <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
                        Join hundreds of schools today. <span className="text-white font-bold underline decoration-teal-500 underline-offset-4">Start your 30-day free trial</span> on your selected plan and transform your education environment—no credit card required.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedPlanId || isSubmitting}
                        className="w-full max-w-md h-16 text-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-black rounded-2xl shadow-2xl shadow-teal-500/25 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Setting up your trial...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Continue to Setup</span>
                                <ArrowRight className="h-6 w-6" />
                            </div>
                        )}
                    </Button>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">You can change your plan any time</p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full mb-12">
                {plans.map((plan) => {
                    const price = isAnnual ? Math.round(plan.price * 12 * 0.75) : plan.price;
                    const isSelected = selectedPlanId === plan.id;
                    const isPopular = plan.slug === "growth";

                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={cn(
                                "relative rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2 flex flex-col",
                                isSelected
                                    ? "bg-slate-800/80 border-teal-500 shadow-2xl shadow-teal-500/10 scale-105 z-10"
                                    : "bg-slate-800/30 border-white/5 hover:border-white/10 hover:bg-slate-800/50"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8 text-center flex flex-col items-center">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-black text-white">₹{price.toLocaleString()}</span>
                                    <span className="text-slate-500 font-medium">/{isAnnual ? "yr" : "mo"}</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-[200px]">
                                    {plan.description || "Perfect for growing schools."}
                                </p>
                                <p className="text-xs text-teal-400/80 font-semibold mt-3 px-3 py-1 rounded-full bg-teal-400/5 border border-teal-400/10">
                                    Up to {plan.limits?.maxStaff || plan.maxStaff || 0} users included
                                </p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {(plan.features || []).slice(0, 3).map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-300 text-xs">
                                        <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Module Comparison Chart */}
                            <div className="pt-6 border-t border-white/5 space-y-3 mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Included Modules</p>
                                    {!isExpanded && <span className="text-[9px] text-teal-500/60 font-medium">+9 more</span>}
                                </div>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {(isExpanded ? ALL_MODULES : ALL_MODULES.slice(0, 3)).map((module) => {
                                        const includedModules = plan.includedModules || [];

                                        const isIncluded = includedModules.includes(module.id);
                                        const Icon = module.icon;

                                        return (
                                            <div key={module.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        isIncluded ? "bg-teal-400/10 text-teal-400" : "bg-slate-800 text-slate-600"
                                                    )}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-medium transition-colors",
                                                        isIncluded ? "text-slate-200" : "text-slate-500"
                                                    )}>
                                                        {module.label}
                                                    </span>
                                                </div>
                                                {isIncluded ? (
                                                    <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                                ) : (
                                                    <Minus className="h-4 w-4 text-slate-700" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={cn(
                                "w-full py-3 rounded-xl font-bold text-center transition-all",
                                isSelected
                                    ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/25"
                                    : "bg-slate-700 text-slate-300 group-hover:bg-slate-600"
                            )}>
                                {isSelected ? "Selected" : "Choose Plan"}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Global View More Toggle */}
            <div className="flex justify-center mb-16">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all text-sm font-semibold text-slate-300"
                >
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {isExpanded ? "Show Less" : "View All Modules & Features"}
                    </span>
                    <ArrowRight className={cn("h-4 w-4 text-teal-400 transition-transform", isExpanded ? "rotate-[-90deg]" : "rotate-90")} />
                </button>
            </div>

            <button
                onClick={() => router.back()}
                className="text-slate-500 hover:text-white text-sm font-medium transition-colors mb-12"
            >
                Back
            </button>
        </div>
    );
}
