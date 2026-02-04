
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking exact SubscriptionPlan query...");
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
            orderBy: { sortOrder: 'asc' }
        });
        console.log(`[SUCCESS] Found ${plans.length} plans.`);

        console.log("Checking exact CMSPage query...");
        const pages = await prisma.cMSPage.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        console.log(`[SUCCESS] Found ${pages.length} CMS pages.`);

        console.log("Diagnostic complete.");
    } catch (error) {
        console.error("DIAGNOSTIC FAILED:");
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
