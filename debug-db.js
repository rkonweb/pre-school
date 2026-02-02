
const { PrismaClient } = require('./src/generated/prisma_v2');
const prisma = new PrismaClient();

async function main() {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: 'test4' }
        });
        console.log("SCHOOL_DATA_START");
        console.log(JSON.stringify(school, null, 2));
        console.log("SCHOOL_DATA_END");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
