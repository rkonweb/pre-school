const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        take: 5,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            parentMobile: true,
            fatherPhone: true,
            motherPhone: true,
            emergencyContactPhone: true
        }
    });
    console.log("Found students:", students.length);
    console.log(JSON.stringify(students, null, 2));

    const users = await prisma.user.findMany({
        where: { role: 'PARENT' },
        take: 5
    });
    console.log("Found Users:", users.length);
    console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
