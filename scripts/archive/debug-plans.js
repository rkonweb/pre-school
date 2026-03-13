
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    try {
        const plansCount = await prisma.subscriptionPlan.count();
        console.log(`Found ${plansCount} plans.`);

        if (plansCount === 0) {
            console.log("Seeding default plans...");
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
                        includedModules: JSON.stringify(d.modules),
                        sortOrder: 0
                    }
                });
                console.log(`Created ${d.name}`);
            }
            console.log("Seeding complete.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
