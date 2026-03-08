import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const studentCount = await prisma.student.count();
    const messageCount = await prisma.message.count();
    const attendanceCount = await prisma.attendance.count();
    const transportCount = await prisma.transportBoardingLog.count();
    const conversationCount = await prisma.conversation.count();

    console.log({
        studentCount,
        messageCount,
        attendanceCount,
        transportCount,
        conversationCount
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
