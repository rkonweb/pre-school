import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const school = await prisma.school.findUnique({
        where: { slug: 'test4' },
        select: {
            name: true,
            slug: true,
            logo: true,
            brandColor: true,
            primaryColor: true
        }
    });

    console.log('\n🎨 School Branding for test4:\n');
    console.log(JSON.stringify(school, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
