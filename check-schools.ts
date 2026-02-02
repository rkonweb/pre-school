import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findUnique({
        where: { id: 'cmkzco27s00078s30tdtstxnw' },
        include: { school: true }
    });
    const admission = await prisma.admission.findUnique({
        where: { id: 'cmkzc495g00038s30mongg66i' },
        include: { school: true }
    });

    console.log('Student School:', student?.school?.slug, student?.schoolId);
    console.log('Admission School:', admission?.school?.slug, admission?.schoolId);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
