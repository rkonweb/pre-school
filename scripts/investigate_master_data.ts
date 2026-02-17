import { prisma } from '../src/lib/prisma';

async function main() {
    try {
        const departments = await prisma.masterData.findMany({
            where: { type: 'DEPARTMENT' }
        });

        const designations = await prisma.masterData.findMany({
            where: { type: 'DESIGNATION' }
        });

        console.log('--- ALL DEPARTMENTS ---');
        console.log(JSON.stringify(departments, null, 2));

        console.log('--- ALL DESIGNATIONS ---');
        console.log(JSON.stringify(designations, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
