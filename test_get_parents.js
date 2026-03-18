const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.student.findMany({
        take: 5,
        select: {
            firstName: true,
            lastName: true,
            parentMobile: true,
            fatherPhone: true,
            motherPhone: true,
            emergencyContactPhone: true
        }
    });
    console.log(students);
}
main().catch(console.error).finally(() => prisma.$disconnect());
