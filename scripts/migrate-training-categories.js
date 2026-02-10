
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    const roles = [
        { name: 'Teacher', slug: 'teacher', roleKey: 'TEACHER' },
        { name: 'Nanny', slug: 'nanny', roleKey: 'NANNY' },
        { name: 'Driver', slug: 'driver', roleKey: 'DRIVER' },
    ];

    for (const role of roles) {
        console.log(`Processing category: ${role.name}`);

        // upsert category
        const category = await prisma.trainingCategory.upsert({
            where: { slug: role.slug },
            update: {},
            create: {
                name: role.name,
                slug: role.slug,
                description: `Training modules for ${role.name}s`
            }
        });

        console.log(`Category ensured: ${category.name} (${category.id})`);

        // Update existing modules with this role to pointing to this category
        const result = await prisma.trainingModule.updateMany({
            where: { role: role.roleKey, categoryId: null },
            data: { categoryId: category.id }
        });

        console.log(`Updated ${result.count} modules for ${role.name}`);
    }

    console.log('Migration complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
