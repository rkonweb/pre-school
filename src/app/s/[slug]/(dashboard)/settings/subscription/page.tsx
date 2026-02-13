"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CreditCard,
    Check,
    Loader2,
    TrendingUp,
    Calendar,
    Users,
    GraduationCap,
    HardDrive,
    Sparkles,
    Crown,
    Zap,
    AlertCircle
} from "lucide-react";
import { getProfileDataAction } from "@/app/actions/profile-actions";
import { getAvailablePlansAction, upgradePlanAction } from "@/app/actions/subscription-actions";
import { cn } from "@/lib/utils";

export default function SubscriptionSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);
    const [availablePlans, setAvailablePlans] = useState<any[]>([]);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load profile and plans data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [profileRes, plansRes] = await Promise.all([
                getProfileDataAction(slug),
                getAvailablePlansAction()
            ]);

            if (profileRes.success) {
                setProfileData(profileRes.data);
            } else {
                setError(profileRes.error || "Failed to load profile");
            }

            if (plansRes.success) {
                setAvailablePlans(plansRes.data || []);
            }

            setIsLoading(false);
        }

        loadData();
    }, [slug]);

    // Handle plan upgrade
    const handleUpgrade = async (planId: string) => {
        setIsUpgrading(true);
        setError(null);
        setSuccessMessage(null);

        const res = await upgradePlanAction(slug, planId);

        if (res.success) {
            setSuccessMessage(res.data?.message || "Plan upgraded successfully!");
            // Reload profile data
            const profileRes = await getProfileDataAction(slug);
            if (profileRes.success) {
                setProfileData(profileRes.data);
            }
            setSelectedPlanId(null);
        } else {
            setError(res.error || "Failed to upgrade plan");
        }

        setIsUpgrading(false);
    };

    // Get tier badge color
    const getTierColor = (tier: string) => {
        switch (tier) {
            case "free":
                return "bg-zinc-100 text-zinc-700 border-zinc-300";
            case "basic":
                return "bg-brand/10 text-brand border-brand/30";
            case "premium":
                return "bg-purple-100 text-purple-700 border-purple-300";
            case "enterprise":
                return "bg-amber-100 text-amber-700 border-amber-300";
            default:
                return "bg-zinc-100 text-zinc-700 border-zinc-300";
        }
    };

    // Get tier icon
    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "free":
                return <Sparkles className="h-5 w-5" />;
            case "basic":
                return <Zap className="h-5 w-5" />;
            case "premium":
                return <Crown className="h-5 w-5" />;
            case "enterprise":
                return <Crown className="h-5 w-5" />;
            default:
                return <CreditCard className="h-5 w-5" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    const currentPlan = profileData?.subscription?.plan;
    const subscription = profileData?.subscription;
    const usage = profileData?.usage;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    Subscription & Billing
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                    Manage your subscription plan and view usage statistics
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-800 font-semibold">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-semibold">{error}</p>
                </div>
            )}

            {/* Current Plan Card */}
            {currentPlan && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-xl", getTierColor(currentPlan.tier))}>
                                    {getTierIcon(currentPlan.tier)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                        Current Plan: {currentPlan.name}
                                    </h2>
                                    <p className="text-sm text-zinc-500">
                                        {currentPlan.tier.charAt(0).toUpperCase() + currentPlan.tier.slice(1)} tier
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                                {currentPlan.currency === "INR" ? "₹" : "$"}
                                {currentPlan.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-zinc-500">
                                per {currentPlan.billingPeriod === "yearly" ? "year" : "month"}
                            </div>
                        </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-semibold">Status</span>
                            </div>
                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                {subscription?.status || "ACTIVE"}
                            </div>
                        </div>

                        {subscription?.endDate && (
                            <>
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-semibold">Expires On</span>
                                    </div>
                                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                        {new Date(subscription.endDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm font-semibold">Days Remaining</span>
                                    </div>
                                    <div className={cn(
                                        "text-lg font-bold",
                                        subscription.daysRemaining !== null && subscription.daysRemaining < 7
                                            ? "text-red-600"
                                            : subscription.daysRemaining !== null && subscription.daysRemaining < 30
                                                ? "text-amber-600"
                                                : "text-emerald-600"
                                    )}>
                                        {subscription.daysRemaining !== null
                                            ? subscription.daysRemaining < 0
                                                ? "Expired"
                                                : `${subscription.daysRemaining} days`
                                            : "N/A"}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Usage Statistics */}
                    {usage && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Usage Statistics
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Students */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <GraduationCap className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Students</span>
                                        </div>
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                            {usage.currentStudents}/{currentPlan.maxStudents}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                (usage.currentStudents / currentPlan.maxStudents) * 100 >= 90
                                                    ? "bg-red-500"
                                                    : (usage.currentStudents / currentPlan.maxStudents) * 100 >= 75
                                                        ? "bg-amber-500"
                                                        : "bg-emerald-500"
                                            )}
                                            style={{
                                                width: `${Math.min(100, (usage.currentStudents / currentPlan.maxStudents) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Staff */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Staff</span>
                                        </div>
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                            {usage.currentStaff}/{currentPlan.maxStaff}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                (usage.currentStaff / currentPlan.maxStaff) * 100 >= 90
                                                    ? "bg-red-500"
                                                    : (usage.currentStaff / currentPlan.maxStaff) * 100 >= 75
                                                        ? "bg-amber-500"
                                                        : "bg-emerald-500"
                                            )}
                                            style={{
                                                width: `${Math.min(100, (usage.currentStaff / currentPlan.maxStaff) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Storage */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <HardDrive className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Storage</span>
                                        </div>
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                            {usage.storageUsedGB.toFixed(1)}/{currentPlan.maxStorageGB} GB
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                (usage.storageUsedGB / currentPlan.maxStorageGB) * 100 >= 90
                                                    ? "bg-red-500"
                                                    : (usage.storageUsedGB / currentPlan.maxStorageGB) * 100 >= 75
                                                        ? "bg-amber-500"
                                                        : "bg-emerald-500"
                                            )}
                                            style={{
                                                width: `${Math.min(100, (usage.storageUsedGB / currentPlan.maxStorageGB) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Available Plans */}
            <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                    Available Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePlans.map((plan) => {
                        const isCurrentPlan = currentPlan?.id === plan.id;
                        const features = Array.isArray(plan.features) ? plan.features : [];

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "bg-white dark:bg-zinc-900 rounded-2xl border-2 p-6 transition-all",
                                    isCurrentPlan
                                        ? "border-brand shadow-lg shadow-brand/20"
                                        : "border-zinc-200 dark:border-zinc-800 hover:border-brand/40"
                                )}
                            >
                                {/* Plan Header */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn("p-2 rounded-xl", getTierColor(plan.tier))}>
                                            {getTierIcon(plan.tier)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                                {plan.name}
                                            </h3>
                                            {isCurrentPlan && (
                                                <span className="text-xs font-bold text-brand">Current Plan</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                                            {plan.currency === "INR" ? "₹" : "$"}{plan.price.toLocaleString()}
                                        </span>
                                        <span className="text-zinc-500">
                                            /{plan.billingPeriod === "yearly" ? "year" : "month"}
                                        </span>
                                    </div>
                                </div>

                                {/* Plan Limits */}
                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Students</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                            {plan.maxStudents}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Staff</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                            {plan.maxStaff}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Storage</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                            {plan.maxStorageGB} GB
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                {features.length > 0 && (
                                    <div className="space-y-2 mb-6">
                                        {features.slice(0, 5).map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                                    disabled={isCurrentPlan || isUpgrading}
                                    className={cn(
                                        "w-full py-3 px-4 rounded-xl font-bold transition-all",
                                        isCurrentPlan
                                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-brand to-brand/80 text-white hover:brightness-110 shadow-lg shadow-brand/20"
                                    )}
                                >
                                    {isCurrentPlan ? "Current Plan" : isUpgrading ? "Upgrading..." : "Upgrade"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
