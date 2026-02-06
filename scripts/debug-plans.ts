
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching Subscription Plans from DB...");
    const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { sortOrder: 'asc' }
    });
    console.log("PLANS IN DB:", JSON.stringify(plans, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
