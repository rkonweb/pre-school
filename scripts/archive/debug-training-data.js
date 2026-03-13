
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Training Categories...');
    const categories = await prisma.trainingCategory.findMany({
        include: { _count: { select: { modules: true } } }
    });
    console.log(JSON.stringify(categories, null, 2));

    console.log('\nChecking Training Modules (First 10)...');
    const modules = await prisma.trainingModule.findMany({
        take: 10,
        select: { id: true, title: true, role: true, categoryId: true }
    });
    console.log(JSON.stringify(modules, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
