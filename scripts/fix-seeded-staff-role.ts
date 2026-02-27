import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

async function main() {
    try {
        const updated = await prisma.user.updateMany({
            where: {
                email: { contains: 'test.' },
                role: { in: ['TEACHER', 'DRIVER'] }
            },
            data: {
                role: 'STAFF'
            }
        });
        
        console.log(`Updated ${updated.count} test staff members to have role 'STAFF'`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
