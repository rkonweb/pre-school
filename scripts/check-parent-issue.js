
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const phone = "9445901265";
    console.log("Checking User:", phone);

    // Check User Table
    const user = await prisma.user.findUnique({
        where: { mobile: phone },
        include: { school: true }
    });
    console.log("User Table Record:", user);

    if (!user) {
        console.log("User not found in Users table. Checking Students...");
        // Check Student Table
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { parentMobile: phone },
                    { emergencyContactPhone: phone }
                ]
            },
            include: { school: true }
        });
        console.log("Student Match:", student ? `Found for Student ${student.firstName} (School: ${student.school?.slug})` : "No student found");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
