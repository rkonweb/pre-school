import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

async function main() {
    try {
        const staff = await prisma.user.findMany({
            where: {
                email: { contains: 'test.' }
            },
            include: {
                school: true
            }
        });
        
        console.log(`Found ${staff.length} test staff members.`);
        if (staff.length > 0) {
            console.log(`First staff member school slug: ${staff[0].school?.slug}`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
