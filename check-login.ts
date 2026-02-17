import { PrismaClient } from "./src/generated/client";
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        take: 5,
        select: { parentMobile: true, firstName: true }
    });
    console.log("Students:", JSON.stringify(students, null, 2));

    const admissions = await prisma.admission.findMany({
        take: 5,
        select: { fatherPhone: true, motherPhone: true, parentPhone: true }
    });
    console.log("Admissions:", JSON.stringify(admissions, null, 2));
}

main().finally(() => prisma.$disconnect());
