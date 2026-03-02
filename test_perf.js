const { PrismaClient } = require('./src/generated/client_final')
const prisma = new PrismaClient()

async function testQuery() {
    console.time("DB Query Time");
    
    const search = "ra"; // typical short search
    let whereClause = { status: { not: "ALUMNI" } };
    
    const cleanSearch = search.trim().replace(/\s+/g, ' ');
    const searchTerms = cleanSearch.split(' ');
    whereClause.AND = searchTerms.map(term => ({
        OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { admissionNumber: { contains: term, mode: 'insensitive' } },
            { parentMobile: { contains: term, mode: 'insensitive' } }
        ]
    }));

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
