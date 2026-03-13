
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = "test1";
    console.log("Checking School:", slug);

    // Check School Table
    const school = await prisma.school.findUnique({
        where: { slug: slug }
    });
    console.log("School Record:", school);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
