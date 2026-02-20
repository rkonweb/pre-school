
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const drivers = await prisma.transportDriver.findMany({
        include: {
            school: true
        }
    });
    console.log('Total Drivers:', drivers.length);
    drivers.forEach(d => {
        console.log(`Driver: ${d.name}, School: ${d.school.slug}, ID: ${d.id}`);
    });
}

main();
