
const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Fixing Marketing Templates Status ---');

        const update = await prisma.marketingTemplate.updateMany({
            data: { isActive: true }
        });

        console.log(`Updated ${update.count} templates to Active.`);

        // Verify
        const templates = await prisma.marketingTemplate.findMany();
        templates.forEach(t => {
            console.log(`[${t.id}] ${t.name} -> Active: ${t.isActive}`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
