const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Debugging Marketing Templates ---');

        // Check Attributes
        const categories = await prisma.marketingAttribute.findMany({ where: { type: 'CATEGORY' } });
        console.log(`Categories found: ${categories.length}`);
        categories.forEach(c => console.log(` - ${c.name}`));

        const formats = await prisma.marketingAttribute.findMany({ where: { type: 'FORMAT' } });
        console.log(`Formats found: ${formats.length}`);
        formats.forEach(f => console.log(` - ${f.name}`));

        // Check Templates
        const templates = await prisma.marketingTemplate.findMany();
        console.log(`\nTemplates found: ${templates.length}`);

        templates.forEach(t => {
            console.log(`[${t.id}] ${t.name}`);
            console.log(`  Type: ${t.type}, Category: ${t.category}`);
            console.log(`  Active: ${t.isActive}`);
            console.log(`  Created: ${t.createdAt}`);
            console.log('---');
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
