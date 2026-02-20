"use server";

import { prisma } from "@/lib/prisma";
import { CreateSubscriptionPlanInput, SubscriptionPlan as SubscriptionPlanType } from "@/types/subscription";
import { revalidatePath } from "next/cache";
import { calculateTieredAddonCost } from "@/lib/subscriptions/utils";

export async function getSubscriptionPlansAction(retries = 0) {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        if (plans.length === 0) {
            // Seed default plans with ALL module IDs from config
            const defaults = [
                {
                    id: 'plan_free',
                    name: 'FREE',
                    slug: 'free',
                    price: 0,
                    tier: 'free',
                    students: 25,
                    staff: 5,
                    modules: ['students', 'staff', 'settings', 'attendance']
                },
                {
                    id: 'plan_growth',
                    name: 'Growth',
                    slug: 'growth',
                    price: 1999,
                    tier: 'basic',
                    students: 200,
                    staff: 30,
                    modules: ['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication']
                },
                {
                    id: 'plan_premium',
                    name: 'Premium',
                    slug: 'premium',
                    price: 4999,
                    tier: 'premium',
                    students: 1000,
                    staff: 100,
                    modules: ['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication', 'inventory', 'transport', 'library']
                },
            ];

            if (retries > 0) return []; // Prevent infinite recursion

            for (const d of defaults) {
                await prisma.subscriptionPlan.create({
                    data: {
                        id: d.id,
                        name: d.name,
                        slug: d.slug,
                        description: 'Automated seed plan',
                        price: d.price,
                        currency: 'INR',
                        features: '[]',
                        maxStudents: d.students,
                        maxStaff: d.staff,
                        maxStorageGB: 10,
                        tier: d.tier,
                        supportLevel: 'email',
                        isActive: true,
                        includedModules: JSON.stringify(d.modules)
                    }
                });
            }
            return getSubscriptionPlansAction(retries + 1);
        }

        // Auto-repair: Check if any plans have empty modules and fix them
        const moduleDefaults: Record<string, string[]> = {
            'free': ['students', 'staff', 'settings', 'attendance'],
            'basic': ['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication'],
            'premium': ['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication', 'inventory', 'transport', 'library']
        };

        for (const plan of plans) {
            const modules = JSON.parse(plan.includedModules || '[]');
            if (modules.length === 0 && plan.tier && moduleDefaults[plan.tier]) {
                // Update this plan with correct modules
                await prisma.subscriptionPlan.update({
                    where: { id: plan.id },
                    data: { includedModules: JSON.stringify(moduleDefaults[plan.tier]) }
                });
                plan.includedModules = JSON.stringify(moduleDefaults[plan.tier]);
            }
        }

        return plans.map(p => {
            const safeParse = (str: string | null) => {
                if (!str) return [];
                try {
                    return typeof str === 'string' ? JSON.parse(str) : str;
                } catch (e) {
                    console.error("SafeParse Error:", e, str);
                    return [];
                }
            };

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description || "",
                price: p.price,
                currency: p.currency,
                additionalStaffPrice: p.additionalStaffPrice,
                tier: p.tier,
                isPopular: p.isPopular,
                isActive: p.isActive,
                supportLevel: p.supportLevel,
                sortOrder: p.sortOrder,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
                features: safeParse(p.features),
                includedModules: safeParse(p.includedModules),
                addonUserTiers: safeParse(p.addonUserTiers),
                limits: {
                    maxStudents: p.maxStudents,
                    maxStaff: p.maxStaff,
                    maxStorageGB: p.maxStorageGB
                }
            }
        }) as any[];
    } catch (error: any) {
        console.error("getSubscriptionPlansAction Error:", error);
        return [];
    }
}

export async function getSubscriptionPlanByIdAction(id: string) {
    try {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id }
        });

        if (!plan) return null;

        const safeParse = (str: string | null) => {
            if (!str) return [];
            try {
                return typeof str === 'string' ? JSON.parse(str) : str;
            } catch (e) {
                return [];
            }
        };

        return {
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            description: plan.description || "",
            price: plan.price,
            currency: plan.currency,
            additionalStaffPrice: plan.additionalStaffPrice,
            tier: plan.tier,
            isPopular: plan.isPopular,
            isActive: plan.isActive,
            supportLevel: plan.supportLevel,
            sortOrder: plan.sortOrder,
            createdAt: plan.createdAt.toISOString(),
            updatedAt: plan.updatedAt.toISOString(),
            features: safeParse(plan.features),
            includedModules: safeParse(plan.includedModules),
            addonUserTiers: safeParse(plan.addonUserTiers),
            limits: {
                maxStudents: plan.maxStudents,
                maxStaff: plan.maxStaff,
                maxStorageGB: plan.maxStorageGB
            }
        } as any;
    } catch (error: any) {
        console.error("getSubscriptionPlanByIdAction Error:", error);
        return null;
    }
}

export async function getSubscriptionStatsAction() {
    try {
        // Active Subscriptions with Plan details
        const activeSubs = await prisma.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        });

        const totalMRR = activeSubs.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);
        const activeTenants = activeSubs.length;

        const trialTenants = await prisma.subscription.count({
            where: { status: 'TRIAL' }
        });

        return {
            success: true,
            data: {
                totalMRR,
                activeTenants,
                trialTenants,
                churnRate: 2.4 // Placeholder for now
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createSubscriptionPlanAction(data: CreateSubscriptionPlanInput) {
    try {
        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                billingPeriod: data.billingPeriod,
                features: JSON.stringify(data.features),
                maxStudents: data.limits.maxStudents,
                maxStaff: data.limits.maxStaff,
                maxStorageGB: data.limits.maxStorageGB,
                tier: data.tier,
                supportLevel: data.supportLevel,
                isActive: data.isActive,
                isPopular: data.isPopular,
                includedModules: JSON.stringify(data.includedModules),
                addonUserTiers: JSON.stringify(data.addonUserTiers || [])
            }
        });

        if (data.additionalStaffPrice) {
            await prisma.$executeRaw`UPDATE SubscriptionPlan SET additionalStaffPrice = ${data.additionalStaffPrice} WHERE id = ${newPlan.id}`;
        }

        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("createSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateSubscriptionPlanAction(id: string, data: Partial<SubscriptionPlanType>) {
    try {
        // Prepare update data
        const updateData: any = { ...data };

        // Handle nested or special fields
        if (data.features) updateData.features = JSON.stringify(data.features);
        if (data.includedModules) updateData.includedModules = JSON.stringify(data.includedModules);
        if (data.addonUserTiers) updateData.addonUserTiers = JSON.stringify(data.addonUserTiers);

        // Remove additionalStaffPrice from updateData to prevent client error
        if ('additionalStaffPrice' in updateData) {
            delete updateData.additionalStaffPrice;
        }

        if (data.limits) {
            if (data.limits.maxStudents !== undefined) updateData.maxStudents = data.limits.maxStudents;
            if (data.limits.maxStaff !== undefined) updateData.maxStaff = data.limits.maxStaff;
            if (data.limits.maxStorageGB !== undefined) updateData.maxStorageGB = data.limits.maxStorageGB;
            delete updateData.limits;
        }

        await prisma.subscriptionPlan.update({
            where: { id },
            data: updateData
        });

        if (data.additionalStaffPrice !== undefined) {
            await prisma.$executeRaw`UPDATE SubscriptionPlan SET additionalStaffPrice = ${data.additionalStaffPrice} WHERE id = ${id}`;
        }

        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("updateSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlanAction(id: string) {
    try {
        // Check for usage
        const usageCount = await prisma.subscription.count({
            where: { planId: id }
        });

        if (usageCount > 0) {
            // Soft delete instead? Or just error.
            return { success: false, error: `Cannot delete plan. It is used by ${usageCount} subscriptions. Deactivate it instead.` };
        }

        await prisma.subscriptionPlan.delete({
            where: { id }
        });
        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("deleteSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function reorderSubscriptionPlansAction(items: { id: string, sortOrder: number }[]) {
    try {
        await prisma.$transaction(
            items.map((item) =>
                prisma.subscriptionPlan.update({
                    where: { id: item.id },
                    data: { sortOrder: item.sortOrder }
                })
            )
        );
        revalidatePath("/admin/subscriptions");
        revalidatePath("/pricing");
        return { success: true };
    } catch (error: any) {
        console.error("reorderSubscriptionPlansAction Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all available subscription plans for upgrade selection
 */
export async function getAvailablePlansAction() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                isActive: true
            },
            orderBy: [
                { sortOrder: 'asc' },
                { price: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                price: true,
                currency: true,
                billingPeriod: true,
                features: true,
                maxStudents: true,
                maxStaff: true,
                maxStorageGB: true,
                tier: true,
                supportLevel: true,
                isPopular: true,
                includedModules: true,
                addonUserTiers: true
            }
        });

        // Parse JSON fields safely
        const parsedPlans = plans.map(plan => {
            const safeParse = (str: any) => {
                if (!str) return [];
                if (typeof str !== 'string') return str;
                try {
                    return JSON.parse(str);
                } catch (e) {
                    return [];
                }
            };

            return {
                ...plan,
                features: safeParse(plan.features),
                includedModules: safeParse(plan.includedModules),
                addonUserTiers: safeParse(plan.addonUserTiers),
                limits: {
                    maxStudents: plan.maxStudents,
                    maxStaff: plan.maxStaff,
                    maxStorageGB: plan.maxStorageGB
                }
            };
        });

        return {
            success: true,
            data: parsedPlans
        };
    } catch (error) {
        console.error("Error fetching plans:", error);
        return {
            success: false,
            error: "Failed to fetch subscription plans"
        };
    }
}

/**
 * Upgrade subscription plan
 */
export async function upgradePlanAction(schoolSlug: string, newPlanId: string) {
    try {
        // Get school with current subscription
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: {
                id: true,
                subscription: {
                    select: {
                        id: true,
                        planId: true,
                        plan: {
                            select: {
                                tier: true,
                                price: true
                            }
                        },
                        endDate: true
                    }
                }
            }
        });

        if (!school) {
            return {
                success: false,
                error: "School not found"
            };
        }

        // Get new plan details
        const newPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: newPlanId },
            select: {
                id: true,
                name: true,
                tier: true,
                price: true,
                billingPeriod: true,
                includedModules: true,
            }
        });

        if (!newPlan) {
            return {
                success: false,
                error: "Plan not found"
            };
        }

        // Downgrades are allowed and take immediate effect, but billing stays until end of cycle
        const tierOrder = { free: 0, basic: 1, premium: 2, enterprise: 3 };
        const currentTier = school.subscription?.plan?.tier || "free";
        const newTier = newPlan.tier;

        const isDowngrade = tierOrder[newTier as keyof typeof tierOrder] < tierOrder[currentTier as keyof typeof tierOrder];

        // Calculate new end date (only if current subscription is expired or missing)
        let endDate = school.subscription?.endDate ? new Date(school.subscription.endDate) : new Date();
        const now = new Date();

        if (!school.subscription?.endDate || endDate < now) {
            endDate = new Date(now);
            if (newPlan.billingPeriod === "monthly") {
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (newPlan.billingPeriod === "yearly") {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }
        }

        // Update subscription
        if (school.subscription) {
            await prisma.subscription.update({
                where: { id: school.subscription.id },
                data: {
                    planId: newPlanId,
                    status: "ACTIVE",
                    endDate: endDate,
                }
            });
        } else {
            // Create new subscription if none exists
            await prisma.subscription.create({
                data: {
                    schoolId: school.id,
                    planId: newPlanId,
                    status: "ACTIVE",
                    startDate: now,
                    endDate: endDate,
                }
            });
        }

        // Update school's modules config if needed
        if (newPlan.includedModules) {
            const modules = typeof newPlan.includedModules === 'string'
                ? JSON.parse(newPlan.includedModules)
                : newPlan.includedModules;

            await prisma.school.update({
                where: { id: school.id },
                data: {
                    modulesConfig: JSON.stringify(modules)
                }
            });
        }

        revalidatePath(`/s/${schoolSlug}/dashboard`);
        revalidatePath(`/s/${schoolSlug}/settings`);

        return {
            success: true,
            data: {
                message: `Successfully upgraded to ${newPlan.name}!`,
                newPlan: {
                    name: newPlan.name,
                    tier: newPlan.tier,
                },
                endDate: endDate.toISOString(),
            }
        };
    } catch (error) {
        console.error("Error upgrading plan:", error);
        return {
            success: false,
            error: "Failed to upgrade plan"
        };
    }
}

/**
 * Calculate pro-rated upgrade price
 */
export async function calculateUpgradePriceAction(
    currentPlanId: string,
    newPlanId: string,
    daysRemaining: number
) {
    try {
        const [currentPlan, newPlan] = await Promise.all([
            prisma.subscriptionPlan.findUnique({
                where: { id: currentPlanId },
                select: { price: true, billingPeriod: true }
            }),
            prisma.subscriptionPlan.findUnique({
                where: { id: newPlanId },
                select: { price: true, billingPeriod: true }
            })
        ]);

        if (!currentPlan || !newPlan) {
            return {
                success: false,
                error: "Plans not found"
            };
        }

        // Simple pro-rated calculation
        const daysInPeriod = currentPlan.billingPeriod === "yearly" ? 365 : 30;
        const unusedCredit = (currentPlan.price / daysInPeriod) * daysRemaining;
        const newPlanCost = newPlan.price;
        const amountToPay = Math.max(0, newPlanCost - unusedCredit);

        return {
            success: true,
            data: {
                currentPlanPrice: currentPlan.price,
                newPlanPrice: newPlan.price,
                unusedCredit: Math.round(unusedCredit * 100) / 100,
                amountToPay: Math.round(amountToPay * 100) / 100,
                daysRemaining,
            }
        };
    } catch (error) {
        console.error("Error calculating price:", error);
        return {
            success: false,
            error: "Failed to calculate upgrade price"
        };
    }
}

/**
 * Buy additional users for a school
 */
export async function buyAdditionalUsersAction(schoolSlug: string, count: number) {
    try {
        if (count <= 0) return { success: false, error: "Count must be greater than 0" };

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            include: {
                subscription: {
                    include: { plan: true }
                }
            }
        });

        if (!school || !school.subscription) {
            return { success: false, error: "Subscription not found" };
        }

        const plan = school.subscription.plan;
        const currentAddonUsers = school.subscription.addonUsers || 0;

        // Parse tiers
        let tiers: any[] = [];
        try {
            tiers = typeof plan.addonUserTiers === 'string'
                ? JSON.parse(plan.addonUserTiers)
                : (plan.addonUserTiers || []);
        } catch (e) {
            tiers = [];
        }

        // If tiers are empty, calculateTieredAddonCost will use a default price

        const totalCost = calculateTieredAddonCost(currentAddonUsers, count, tiers);

        // In a real app, we would process payment here
        // simulate payment...

        // Update subscription
        await prisma.subscription.update({
            where: { id: school.subscription.id },
            data: {
                addonUsers: {
                    increment: count
                }
            }
        });

        revalidatePath(`/s/${schoolSlug}/settings/subscription`);
        revalidatePath(`/s/${schoolSlug}/dashboard`);

        return {
            success: true,
            data: {
                message: `Successfully added ${count} users.`,
                totalCost,
                currency: plan.currency
            }
        };
    } catch (error: any) {
        console.error("buyAdditionalUsersAction Error:", error);
        return { success: false, error: error.message };
    }
}
