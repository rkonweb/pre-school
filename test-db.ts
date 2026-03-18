import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.student.count();
  console.log("Total students in DB:", count);
  const userCount = await prisma.user.count({ where: { role: 'PARENT' } });
  console.log("Total parents in DB:", userCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
