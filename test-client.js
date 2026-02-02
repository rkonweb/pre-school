
import { PrismaClient } from './src/generated/prisma_v2/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing punches...");
    const attendance = await prisma.staffAttendance.findFirst({
        include: { punches: true }
    });
    console.log("Latest attendance punches count:", attendance?.punches.length || 0);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
