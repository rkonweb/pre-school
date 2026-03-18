const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching attendance...');
  const res = await prisma.attendance.findMany({ take: 5 });
  console.log(res);
}
main().catch(console.error).finally(() => prisma.$disconnect());
