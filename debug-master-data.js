
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    const designations = await prisma.masterData.findMany({ where: { type: 'DESIGNATION' } });
    const departments = await prisma.masterData.findMany({ where: { type: 'DEPARTMENT' } });
    const employmentTypes = await prisma.masterData.findMany({ where: { type: 'EMPLOYMENT_TYPE' } });

    console.log("--- Designations ---");
    console.log(designations.map(d => ({ code: d.code, name: d.name })));

    console.log("--- Departments ---");
    console.log(departments.map(d => ({ code: d.code, name: d.name })));

    console.log("--- Employment Types ---");
    console.log(employmentTypes.map(d => ({ code: d.code, name: d.name })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
