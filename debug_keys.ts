
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("Checking prisma keys...");
    const keys = Object.keys(prisma);
    console.log("Keys on prisma instance:", keys);

    // Check if tenant exists in any form (case sensitivity)
    const tenantKey = keys.find(k => k.toLowerCase() === 'tenant');
    console.log("Tenant key found:", tenantKey);

    if (tenantKey) {
        // @ts-ignore
        const count = await prisma[tenantKey].count();
        console.log(`Tenant count: ${count}`);
    }
}

main()
    .catch(e => console.error(e));
