const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function check() {
    const schools = await prisma.school.findMany({
        select: { slug: true, googleMapsApiKey: true }
    });
    schools.forEach(s => {
        console.log(`School: ${s.slug}, API Key: ${s.googleMapsApiKey ? s.googleMapsApiKey.substring(0, 5) + '...' : 'EMPTY'}`);
    });
}

check().finally(() => prisma.$disconnect());
