import { PrismaClient } from "./src/generated/client_final";

const prisma = new PrismaClient();

async function checkSchool() {
    const schools = await prisma.school.findMany();
    console.log("Schools:", schools.map(s => s.slug));
}

checkSchool().finally(() => prisma.$disconnect());
