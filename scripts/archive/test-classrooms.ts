import { prisma } from "./src/lib/prisma";

async function run() {
    const classes = await prisma.classroom.findMany({
        take: 5,
    });
    console.log("Classrooms:", JSON.stringify(classes, null, 2));
}
run();
