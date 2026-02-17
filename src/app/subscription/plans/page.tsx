
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { Loader2, Check, Sparkles, Rocket, Crown, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function SubscriptionPlansPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [currentPlanId, setCurrentPlanId] = useState("");
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [isAnnual, setIsAnnual] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [userRes, plansRes] = await Promise.all([
                    getCurrentUserAction(),
                    getSubscriptionPlansAction()
                ]);

                if (!userRes.success || !userRes.data) {
                    router.push("/login");
                    return;
                }

                setUser(userRes.data);
                setPlans(plansRes as any);

                const sub = userRes.data.school?.subscription;
                if (sub) {
                    setCurrentPlanId(sub.planId);
                    setSelectedPlanId(sub.planId);
                    if (sub.status === "SUSPENDED" || sub.status === "PAST_DUE") {
                        setIsSuspended(true);
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load subscription details");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleProceed = () => {
        toast.info("Proceeding to payment gateway...", {
            description: `Plan: ${plans.find(p => p.id === selectedPlanId)?.name} (${isAnnual ? 'Yearly' : 'Monthly'})`
        });
        // Integrate Payment Gateway here
    };

    const getPlanIcon = (slug: string) => {
        if (slug.includes('free')) return Sparkles;
        if (slug.includes('growth')) return Rocket;
        if (slug.includes('premium') || slug.includes('enterprise')) return Crown;
        return Sparkles;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {/* Header / Navbar Placeholder */}
            <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {user?.school?.name?.substring(0, 1) || "S"}
                    </div>
                    <span className="font-bold text-zinc-900">{user?.school?.name}</span>
                </div>
                {isSuspended && (
                    <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Account Suspended
                    </div>
                )}
            </div>

            <main className="max-w-6xl mx-auto py-12 px-4">
                <div className="text-center space-y-4 mb-12">
                    {isSuspended ? (
                        <>
                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900">Reacticate Your Account</h1>
                            <p className="text-zinc-500 max-w-2xl mx-auto">
                                Your subscription has expired. Please choose a plan to continue accessing your school dashboard.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900">Manage Subscription</h1>
                            <p className="text-zinc-500 max-w-2xl mx-auto">
                                Upgrade or downgrade your plan anytime.
                            </p>
                        </>
                    )}

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={cn("text-sm font-bold transition-colors", !isAnnual ? "text-zinc-900" : "text-zinc-400")}>
                            Monthly
                        </span>

                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={cn(
                                "relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none",
                                isAnnual ? "bg-blue-600" : "bg-zinc-300"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300",
                                    isAnnual ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-bold transition-colors", isAnnual ? "text-zinc-900" : "text-zinc-400")}>
                                Annually
                            </span>
                            <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                25% OFF
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan: any) => {
                        const Icon = getPlanIcon(plan.slug);
                        const isSelected = selectedPlanId === plan.id;
                        const isCurrent = currentPlanId === plan.id;
                        const features = typeof plan.features === 'string' ? JSON.parse(plan.features || "[]") : (plan.features || []);

                        // Pricing Logic
                        const monthlyPrice = plan.price;
                        const annualPriceTotal = Math.round(monthlyPrice * 12 * 0.75); // 25% discount
                        const displayPrice = isAnnual ? annualPriceTotal : monthlyPrice;

                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={cn(
                                    "relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 flex flex-col bg-white",
                                    isSelected
                                        ? "border-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02] z-10"
                                        : "border-zinc-100 hover:border-zinc-200 hover:shadow-lg"
                                )}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Current Plan
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                                        isSelected ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                                    <p className="text-zinc-400 text-xs mt-1 min-h-[40px]">{plan.description || "Comprehensive school management solution."}</p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-zinc-900">
                                            {formatPrice(displayPrice)}
                                        </span>
                                        <span className="text-zinc-400 text-sm font-medium">
                                            /{isAnnual ? 'year' : 'month'}
                                        </span>
                                    </div>
                                    {isAnnual && (
                                        <p className="text-xs text-emerald-600 font-bold mt-1">
                                            Save {formatPrice(Math.round(monthlyPrice * 12 * 0.25))}
                                        </p>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <ul className="space-y-3 mb-8">
                                        {features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2.5 text-zinc-600 text-xs font-medium">
                                                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.maxStudents > 0 && (
                                            <li className="flex items-start gap-2.5 text-zinc-600 text-xs font-medium">
                                                <Check className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span>Up to {plan.maxStudents} Students</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPlanId(plan.id);
                                        // If it's the current plan and account is suspended, they can renew.
                                        // If active and current, disable or show "Current".
                                        if (isCurrent && !isSuspended) return;
                                        handleProceed();
                                    }}
                                    disabled={isCurrent && !isSuspended}
                                    className={cn(
                                        "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        isCurrent && !isSuspended
                                            ? "bg-zinc-100 text-zinc-400 cursor-default"
                                            : isSelected
                                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                    )}
                                >
                                    {isCurrent && !isSuspended ? "Current Plan" : (isCurrent ? "Renew Plan" : "Switch Plan")}
                                    {(!isCurrent || isSuspended) && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs text-zinc-400">
                        Secure payment processing via Razorpay/Stripe. <br />
                        Need help? Contact <a href="#" className="text-blue-600 hover:underline">Support</a>.
                    </p>
                </div>
            </main>
        </div>
    );
}
