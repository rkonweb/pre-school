
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
    const school = await prisma.school.findFirst();
    console.log("SCHOOL_ID:", school?.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
