const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('Checking MasterData entries...');
    try {
        const count = await prisma.masterData.count();
        console.log('Total entries:', count);

        const grades = await prisma.masterData.findMany({
            where: { type: 'GRADE' }
        });
        console.log('Grades found:', grades.length);
        grades.forEach(g => console.log(`- ${g.name} (${g.code})`));
    } catch (e) {
        console.error('Error accessing MasterData:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
