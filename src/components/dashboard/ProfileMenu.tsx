"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Settings,
    LogOut,
    CreditCard,
    Calendar,
    Users,
    GraduationCap,
    HardDrive,
    TrendingUp,
    Loader2,
    AlertCircle,
    Building2
} from "lucide-react";
import { getProfileDataAction } from "@/app/actions/profile-actions";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { cn } from "@/lib/utils";
import { AvatarWithAdjustment } from "./staff/AvatarWithAdjustment";
import { BranchSelector } from "./BranchSelector";

export function ProfileMenu({
    branches = [],
    currentBranchId = ""
}: {
    branches?: any[];
    currentBranchId?: string;
}) {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isOpen, setIsOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch profile data
    useEffect(() => {
        async function loadProfile() {
            setIsLoading(true);
            const res = await getProfileDataAction(slug);
            if (res.success) {
                setProfileData(res.data);
                setError(null);
            } else {
                setError(res.error || "Failed to load profile");
            }
            setIsLoading(false);
        }

        if (isOpen) {
            loadProfile();
        }
    }, [isOpen, slug]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Handle logout
    const handleLogout = async () => {
        await clearUserSessionAction();
        router.push("/school-login");
    };

    // Handle settings navigation
    const handleSettings = () => {
        setIsOpen(false);
        router.push(`/s/${slug}/settings/profile`);
    };

    // Handle upgrade
    const handleUpgrade = () => {
        setIsOpen(false);
        router.push(`/s/${slug}/settings/subscription`);
    };

    // Get status color
    const getStatusColor = (status: string, daysRemaining: number | null) => {
        if (status === "EXPIRED") return "text-red-600 bg-red-50 border-red-200";
        if (status === "EXPIRING_SOON" || (daysRemaining !== null && daysRemaining < 7)) {
            return "text-amber-600 bg-amber-50 border-amber-200";
        }
        if (status === "TRIAL") return "text-brand bg-brand/5 border-brand/20";
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
    };

    // Get days remaining color
    const getDaysColor = (days: number | null) => {
        if (days === null) return "text-zinc-500";
        if (days < 0) return "text-red-600";
        if (days <= 7) return "text-amber-600 animate-pulse";
        if (days <= 30) return "text-amber-600";
        return "text-emerald-600";
    };

    // Calculate usage percentage
    const getUsagePercentage = (current: number, max: number) => {
        if (max === 0) return 0;
        return Math.min(100, (current / max) * 100);
    };

    // Get usage color
    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 75) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const user = profileData?.user;
    const school = profileData?.school;
    const subscription = profileData?.subscription;
    const usage = profileData?.usage;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full hover:bg-white/10 transition-colors p-1"
            >
                <AvatarWithAdjustment
                    src={user?.avatar}
                    adjustment={user?.avatarAdjustment}
                    className="h-8 w-8 overflow-hidden rounded-full shadow-lg"
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {isLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-brand" />
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="flex items-center gap-2 text-red-600 mb-4">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-semibold">Error</span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    setProfileData(null);
                                    setError(null);
                                }}
                                className="text-sm text-brand hover:underline font-semibold"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* User Info */}
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-start gap-3">
                                    <AvatarWithAdjustment
                                        src={user?.avatar}
                                        adjustment={user?.avatarAdjustment}
                                        className="h-12 w-12 overflow-hidden rounded-full shadow-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">
                                            {user?.firstName} {user?.lastName}
                                        </h3>
                                        <p className="text-sm text-zinc-500 truncate">{user?.email}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand/10 text-brand text-xs font-bold rounded-full">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Branch Selection - Only if more than 1 branch */}
                            {branches.length > 1 && (
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <Building2 className="h-3.5 w-3.5 text-brand" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Switch Branch
                                        </span>
                                    </div>
                                    <BranchSelector
                                        branches={branches}
                                        currentBranchId={currentBranchId}
                                        isCollapsed={false}
                                    />
                                </div>
                            )}

                            {/* Subscription Info */}
                            {subscription && (
                                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-zinc-400" />
                                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                                Current Plan
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-1 text-xs font-bold rounded-full border",
                                            getStatusColor(subscription.status, subscription.daysRemaining)
                                        )}>
                                            {subscription.plan.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500">Price</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                            {subscription.plan.currency === "INR" ? "₹" : "$"}
                                            {subscription.plan.price.toLocaleString()}/{subscription.plan.billingPeriod === "yearly" ? "year" : "month"}
                                        </span>
                                    </div>

                                    {subscription.endDate && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Expires</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                                                    {new Date(subscription.endDate).toLocaleDateString()}
                                                </div>
                                                {subscription.daysRemaining !== null && (
                                                    <div className={cn("text-xs font-bold", getDaysColor(subscription.daysRemaining))}>
                                                        {subscription.daysRemaining < 0
                                                            ? "Expired"
                                                            : `${subscription.daysRemaining} days left`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Usage Stats */}
                                    {usage && (
                                        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                Usage
                                            </div>

                                            {/* Users (Students & Staff) */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-zinc-600">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>Total Users</span>
                                                    </div>
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                                        {profileData.usage.currentUsers}/{profileData.plan.maxUsers}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all", getUsageColor(getUsagePercentage(profileData.usage.currentUsers, profileData.plan.maxUsers)))}
                                                        style={{ width: `${getUsagePercentage(profileData.usage.currentUsers, profileData.plan.maxUsers)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                                    <span>Students + Staff</span>
                                                    <span>{Math.round(getUsagePercentage(profileData.usage.currentUsers, profileData.plan.maxUsers))}%</span>
                                                </div>
                                            </div>

                                            {/* Storage */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-zinc-600">
                                                        <HardDrive className="h-3.5 w-3.5" />
                                                        <span>Storage</span>
                                                    </div>
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                                                        {usage.storageUsedGB.toFixed(1)}/{subscription.plan.maxStorageGB} GB
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all", getUsageColor(getUsagePercentage(usage.storageUsedGB, subscription.plan.maxStorageGB)))}
                                                        style={{ width: `${getUsagePercentage(usage.storageUsedGB, subscription.plan.maxStorageGB)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upgrade Button */}
                                    {subscription.plan.tier !== "enterprise" && (
                                        <button
                                            onClick={handleUpgrade}
                                            className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-brand to-brand/80 text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                            Upgrade Plan
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Menu Items */}
                            <div className="p-2">
                                <button
                                    onClick={handleSettings}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                                >
                                    <Settings className="h-4 w-4 text-zinc-500" />
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Settings</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="font-semibold">Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
