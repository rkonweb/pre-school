"use server";

import { prisma } from "@/lib/prisma";
import { CreateSubscriptionPlanInput, SubscriptionPlan as SubscriptionPlanType } from "@/types/subscription";
import { revalidatePath } from "next/cache";

export async function getSubscriptionPlansAction() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            include: {
                _count: {
                    select: {
                        subscriptions: {
                            where: { status: "ACTIVE" }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (plans.length === 0) {
            // Seed default plans
            const defaults = [
                { id: 'plan_free', name: 'Free Trial', slug: 'free', price: 0, tier: 'free', students: 25, staff: 5, modules: ['attendance', 'admissions'] },
                { id: 'plan_starter', name: 'Starter', slug: 'starter', price: 299, tier: 'basic', students: 100, staff: 20, modules: ['attendance', 'admissions', 'billing', 'communication'] },
                { id: 'plan_growth', name: 'Growth', slug: 'growth', price: 599, tier: 'premium', students: 500, staff: 100, modules: ['attendance', 'admissions', 'billing', 'communication', 'transport', 'curriculum'] },
            ];

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
            return getSubscriptionPlansAction();
        }

        return plans.map(p => ({
            ...p,
            features: JSON.parse(p.features || "[]"),
            includedModules: JSON.parse(p.includedModules || "[]"),
            limits: {
                maxStudents: p.maxStudents,
                maxStaff: p.maxStaff,
                maxStorageGB: p.maxStorageGB
            },
            activeSubscribers: p._count.subscriptions
        }));
    } catch (error: any) {
        console.error("getSubscriptionPlansAction Error:", error);
        return [];
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
        await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                price: data.price,
                currency: data.currency,
                billingPeriod: data.billingPeriod,
                features: JSON.stringify(data.features),
                maxStudents: data.limits.maxStudents,
                maxStaff: data.limits.maxStaff,
                maxStorageGB: data.limits.maxStorageGB,
                tier: data.tier,
                supportLevel: data.supportLevel,
                isActive: data.isActive,
                isPopular: data.isPopular,
                includedModules: JSON.stringify(data.includedModules)
            }
        });

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

        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("updateSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlanAction(id: string) {
    try {
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
