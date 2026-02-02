
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    try {
        const count = await prisma.classAccess.count();
        console.log("ClassAccess count:", count);

        // Also check if 'accesses' relation works on Classroom
        // We'll try a raw query or just a simple findFirst with include
        // Note: Raw query is safest to check table existence
        const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='ClassAccess';`;
        console.log("Tables:", tables);

    } catch (e) {
        console.error("Error:", e);
    }
}
main();
