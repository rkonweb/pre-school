import { prisma } from './src/lib/prisma';

async function main() {
    const roles = await prisma.role.findMany();

    const sec = roles.filter((r: any) => r.name.toLowerCase().includes("security"));
    console.log("Found Security role anywhere?", sec);

    const schools = await prisma.school.findMany({ select: { id: true, slug: true, name: true } });
    console.log("Available Schools:", schools);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
