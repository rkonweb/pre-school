const { PrismaClient } = require('./src/generated/client_final')
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

async function testQuery() {
    console.time("DB Query Time");
    
    let whereClause = { status: { not: "ALUMNI" } };

    const [students, totalCount] = await prisma.$transaction([
        prisma.student.findMany({
            where: whereClause,
            select: { id: true, firstName: true, lastName: true },
            take: 50,
            skip: 0
        }),
        prisma.student.count({ where: whereClause })
    ]);
    
    console.timeEnd("DB Query Time");
    console.log(`Found ${students.length} students out of ${totalCount}`);
}

testQuery().catch(console.error).finally(() => prisma.$disconnect());
