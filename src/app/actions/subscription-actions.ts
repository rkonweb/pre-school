"use server";

import { prisma } from "@/lib/prisma";
import { CreateSubscriptionPlanInput, SubscriptionPlan } from "@/types/subscription";
import { revalidatePath } from "next/cache";

export async function getSubscriptionPlansAction() {
    try {
        let plans: any[] = await prisma.$queryRawUnsafe(`
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM Subscription s WHERE s.planId = p.id AND s.status = 'ACTIVE') as activeSubscribers
            FROM SubscriptionPlan p
            ORDER BY createdAt DESC
        `);

        if (plans.length === 0) {
            // Seed default plans
            const defaults = [
                { id: 'plan_free', name: 'Free Trial', slug: 'free', price: 0, tier: 'free', students: 25, staff: 5, modules: ['attendance', 'admissions'] },
                { id: 'plan_starter', name: 'Starter', slug: 'starter', price: 2499, tier: 'basic', students: 100, staff: 20, modules: ['attendance', 'admissions', 'billing', 'communication'] },
                { id: 'plan_growth', name: 'Growth', slug: 'growth', price: 5999, tier: 'premium', students: 500, staff: 100, modules: ['attendance', 'admissions', 'billing', 'communication', 'transport', 'curriculum'] },
            ];
            for (const d of defaults) {
                await prisma.$executeRawUnsafe(`
                    INSERT INTO SubscriptionPlan (id, name, slug, description, price, currency, features, maxStudents, maxStaff, maxStorageGB, tier, supportLevel, isActive, includedModules, createdAt, updatedAt)
                    VALUES (?, ?, ?, 'Automated seed plan', ?, 'INR', '[]', ?, ?, 10, ?, 'email', 1, ?, datetime('now'), datetime('now'))
                `, d.id, d.name, d.slug, d.price, d.students, d.staff, d.tier, JSON.stringify(d.modules));
            }
            return getSubscriptionPlansAction();
        }

        return plans.map(p => ({
            ...p,
            features: JSON.parse(p.features),
            includedModules: JSON.parse(p.includedModules),
            limits: {
                maxStudents: Number(p.maxStudents),
                maxStaff: Number(p.maxStaff),
                maxStorageGB: Number(p.maxStorageGB)
            },
            activeSubscribers: Number(p.activeSubscribers || 0)
        }));
    } catch (error: any) {
        console.error("getSubscriptionPlansAction Error:", error);
        return [];
    }
}

export async function getSubscriptionStatsAction() {
    try {
        // Total MRR
        const mrrRes: any[] = await prisma.$queryRawUnsafe(`
            SELECT SUM(p.price) as total_mrr
            FROM Subscription s
            JOIN SubscriptionPlan p ON s.planId = p.id
            WHERE s.status = 'ACTIVE'
        `);

        // Active Tenants
        const activeTenants: any[] = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) as count FROM Subscription WHERE status = 'ACTIVE'
        `);

        // Trialing Tenants
        const trials: any[] = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) as count FROM Subscription WHERE status = 'TRIAL'
        `);

        return {
            success: true,
            data: {
                totalMRR: Number(mrrRes[0].total_mrr || 0),
                activeTenants: Number(activeTenants[0].count || 0),
                trialTenants: Number(trials[0].count || 0),
                churnRate: 2.4 // Placeholder for now
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createSubscriptionPlanAction(data: CreateSubscriptionPlanInput) {
    try {
        const id = `plan_${Math.random().toString(36).substr(2, 9)}`;
        await prisma.$executeRawUnsafe(`
            INSERT INTO SubscriptionPlan (
                id, name, slug, description, price, currency, billingPeriod, 
                features, maxStudents, maxStaff, maxStorageGB, tier, 
                supportLevel, isActive, isPopular, includedModules, 
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
            id, data.name, data.slug, data.description, data.price, data.currency,
            data.billingPeriod, JSON.stringify(data.features),
            data.limits.maxStudents, data.limits.maxStaff, data.limits.maxStorageGB,
            data.tier, data.supportLevel, data.isActive ? 1 : 0,
            data.isPopular ? 1 : 0, JSON.stringify(data.includedModules)
        );
        revalidatePath("/admin/subscriptions");
        return { success: true, id };
    } catch (error: any) {
        console.error("createSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateSubscriptionPlanAction(id: string, data: Partial<SubscriptionPlan>) {
    try {
        const current: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM SubscriptionPlan WHERE id = ?`, id);
        if (!current.length) throw new Error("Plan not found");

        const p = current[0];
        const merged = { ...p, ...data };

        await prisma.$executeRawUnsafe(`
            UPDATE SubscriptionPlan SET
                name = ?, slug = ?, description = ?, price = ?, currency = ?, 
                billingPeriod = ?, features = ?, maxStudents = ?, maxStaff = ?, 
                maxStorageGB = ?, tier = ?, supportLevel = ?, isActive = ?, 
                isPopular = ?, includedModules = ?, updatedAt = datetime('now')
            WHERE id = ?
        `,
            merged.name, merged.slug, merged.description, merged.price, merged.currency,
            merged.billingPeriod, Array.isArray(merged.features) ? JSON.stringify(merged.features) : merged.features,
            merged.limits?.maxStudents ?? merged.maxStudents,
            merged.limits?.maxStaff ?? merged.maxStaff,
            merged.limits?.maxStorageGB ?? merged.maxStorageGB,
            merged.tier, merged.supportLevel, merged.isActive ? 1 : 0,
            merged.isPopular ? 1 : 0,
            Array.isArray(merged.includedModules) ? JSON.stringify(merged.includedModules) : merged.includedModules,
            id
        );
        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("updateSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlanAction(id: string) {
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM SubscriptionPlan WHERE id = ?`, id);
        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (error: any) {
        console.error("deleteSubscriptionPlanAction Error:", error);
        return { success: false, error: error.message };
    }
}
