import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const classrooms = await prisma.classroom.findMany();
  console.log('Classrooms:', classrooms.map(c => c.name));
  const distinctGrades = await prisma.student.findMany({ select: { grade: true }, distinct: ['grade']});
  console.log('Distinct Grades:', distinctGrades);
}
main();
