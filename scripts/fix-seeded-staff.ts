import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

async function main() {
    try {
        const school = await prisma.school.findFirst();
        if(!school) return;

        const branch = await prisma.branch.findFirst({
            where: { schoolId: school.id }
        });

        if (!branch) {
            console.log("No branch found!");
            return;
        }

        const updated = await prisma.user.updateMany({
            where: {
                email: { contains: 'test.' },
                branchId: null
            },
            data: {
                branchId: branch.id
            }
        });
        
        console.log(`Updated ${updated.count} test staff members to have branchId ${branch.id}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
