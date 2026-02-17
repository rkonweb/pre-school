
import { PrismaClient } from "../src/generated/client_v2";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, mobile: true, role: true }
    });
    console.log("ALL_USERS:", JSON.stringify(users, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
