import { PrismaClient } from "../src/generated/client_final";

const prisma = new PrismaClient();

async function main() {
    const school = await prisma.school.findFirst();
    const student = await prisma.student.findFirst();

    console.log("--- DATA CHECK ---");
    console.log("School Slug:", school?.slug);
    console.log("Student ID:", student?.id);
    console.log("Student Name:", student?.firstName, student?.lastName);
    console.log("Parent Mobile:", student?.parentMobile);
    console.log("------------------");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
