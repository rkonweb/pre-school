import { PrismaClient } from "./src/generated/client";
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
    });
    console.log("Audit Logs:", JSON.stringify(logs, null, 2));

    const otps = await prisma.otp.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log("Recent OTPs:", JSON.stringify(otps, null, 2));

    const students = await prisma.student.findMany({
        where: { parentMobile: "9755560721" }
    });
    console.log("Parent matches (9755560721):", JSON.stringify(students, null, 2));
}

main().finally(() => prisma.$disconnect());
