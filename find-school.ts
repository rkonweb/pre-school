import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchool() {
    const schools = await prisma.school.findMany();
    console.log("Schools:", schools.map(s => s.slug));
}

checkSchool().finally(() => prisma.$disconnect());
