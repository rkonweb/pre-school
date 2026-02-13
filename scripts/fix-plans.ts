
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing subscription plans...");

    // 1. Update FREE plan
    await prisma.subscriptionPlan.upsert({
        where: { id: 'plan_free' },
        update: {
            name: 'FREE',
            slug: 'free',
            price: 0,
            tier: 'free',
            maxStudents: 25,
            maxStaff: 5,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance']),
            isActive: true
        },
        create: {
            id: 'plan_free',
            name: 'FREE',
            slug: 'free',
            price: 0,
            tier: 'free',
            maxStudents: 25,
            maxStaff: 5,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance']),
            isActive: true
        }
    });

    // 2. Update GROWTH plan
    await prisma.subscriptionPlan.upsert({
        where: { id: 'plan_growth' },
        update: {
            name: 'Growth',
            slug: 'growth',
            price: 1999,
            tier: 'basic',
            maxStudents: 200,
            maxStaff: 30,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication']),
            isActive: true
        },
        create: {
            id: 'plan_growth',
            name: 'Growth',
            slug: 'growth',
            price: 1999,
            tier: 'basic',
            maxStudents: 200,
            maxStaff: 30,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication']),
            isActive: true
        }
    });

    // 3. Create PREMIUM plan (and handle potential conflict if we want to reuse starter? No, let's just make new)
    await prisma.subscriptionPlan.upsert({
        where: { id: 'plan_premium' },
        update: {
            name: 'Premium',
            slug: 'premium',
            price: 4999,
            tier: 'premium',
            maxStudents: 1000,
            maxStaff: 100,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication', 'inventory', 'transport', 'library']),
            isActive: true
        },
        create: {
            id: 'plan_premium',
            name: 'Premium',
            slug: 'premium',
            price: 4999,
            tier: 'premium',
            maxStudents: 1000,
            maxStaff: 100,
            includedModules: JSON.stringify(['students', 'staff', 'settings', 'attendance', 'admissions', 'billing', 'academics', 'diary', 'communication', 'inventory', 'transport', 'library']),
            isActive: true
        }
    });

    // 4. Deactivate legacy Starter plan
    const starter = await prisma.subscriptionPlan.findUnique({ where: { id: 'plan_starter' } });
    if (starter) {
        await prisma.subscriptionPlan.update({
            where: { id: 'plan_starter' },
            data: { isActive: false, name: 'Starter (Legacy)' }
        });
        console.log("Deactivated legacy Starter plan");
    }

    console.log("Plans updated successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
