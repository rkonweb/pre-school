const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('Querying MasterData where type: GRADE and parentId: null');
    try {
        const data = await prisma.masterData.findMany({
            where: { type: 'GRADE', parentId: null },
            orderBy: { name: 'asc' }
        });
        console.log('Results count:', data.length);
        data.forEach(g => console.log(`- ${g.name}`));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
