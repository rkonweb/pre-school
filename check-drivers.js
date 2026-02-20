
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const drivers = await prisma.transportDriver.findMany({
            include: {
                school: true
            }
        });
        console.log('Total Drivers:', drivers.length);
        drivers.forEach(d => {
            console.log(`Driver: ${d.name}, School: ${d.school.slug}, ID: ${d.id}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
