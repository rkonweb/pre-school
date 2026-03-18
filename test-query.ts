import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const grades = await prisma.student.findMany({ select: { grade: true }, distinct: ['grade'] });
  console.log('Existing grades:', grades);
}
main();
