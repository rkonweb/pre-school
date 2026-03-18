const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log(await prisma.student.findFirst({
        where: {
            OR: [
                { parentMobile: { contains: '9779963940' } },
                { fatherPhone: { contains: '9779963940' } },
                { motherPhone: { contains: '9779963940' } }
            ]
        }
    }));
}
main().catch(console.error).finally(() => prisma.$disconnect());
