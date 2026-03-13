
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { mobile: "9999999999" },
        include: { school: true }
    });
    console.log("User found:", user);

    // Also create a dummy parent if needed
    /*
    const parent = await prisma.user.upsert({
        where: { mobile: "8888888888" },
        update: {},
        create: {
            mobile: "8888888888",
            firstName: "Parent",
            lastName: "Demo",
            role: "PARENT",
            schoolId: user?.schoolId
        }
    });
    console.log("Parent User ensure (8888888888):", parent);
    */
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
