import { prisma } from "./src/lib/prisma";

async function run() {
    const sessions = await prisma.pTMSession.findMany();
    console.log("Sessions count:", sessions.length);
    for (const session of sessions) {
        console.log(`Session ${session.id}: classIds = '${session.classIds}'`);
    }
}
run();
