const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const countries = await prisma.masterData.findMany({ where: { type: 'COUNTRY' } });
        const states = await prisma.masterData.findMany({ where: { type: 'STATE' } });
        const cities = await prisma.masterData.findMany({ where: { type: 'CITY' } });

        console.log('Countries:', countries.length);
        console.log('States:', states.length);
        console.log('Cities:', cities.length);

        if (countries.length > 0) {
            console.log('Sample Country:', countries[0].name, 'ID:', countries[0].id, 'Parent:', countries[0].parentId);
        }
        if (states.length > 0) {
            console.log('Sample State:', states[0].name, 'ID:', states[0].id, 'Parent:', states[0].parentId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
