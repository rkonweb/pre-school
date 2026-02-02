
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USER DEBUG ---');
    // 1. Find the test user
    const users = await prisma.user.findMany({
        where: {
            firstName: 'David',
            lastName: 'Anderson'
        },
        include: { classAccesses: { include: { classroom: true } } }
    });
    console.log('User found:', JSON.stringify(users, null, 2));

    if (users.length > 0) {
        const user = users[0];
        const allowedNames = user.classAccesses.map(ca => ca.classroom.name);
        console.log('Allowed Class Names:', allowedNames);

        // 2. Check Curriculum
        console.log('--- CURRICULUM DEBUG ---');
        const allCurriculums = await prisma.curriculum.findMany({});
        console.log('Available Curriculums:', allCurriculums.map(c => c.name));

        // 3. Test Match
        const matches = allCurriculums.filter(c => allowedNames.includes(c.name));
        console.log('Exact Matches:', matches.map(c => c.name));

        // 4. Test Case Insensitive Match
        const fuzzyMatches = allCurriculums.filter(c =>
            allowedNames.some(an => an.toLowerCase() === c.name.toLowerCase())
        );
        console.log('Fuzzy Matches:', fuzzyMatches.map(c => c.name));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
