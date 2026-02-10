
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking TrainingModule model...");
        if (prisma.trainingModule) {
            console.log("TrainingModule model exists on Prisma client.");
            const count = await prisma.trainingModule.count();
            console.log(`Current TrainingModule count: ${count}`);
        } else {
            console.error("ERROR: TrainingModule model does NOT exist on Prisma client.");
        }
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
