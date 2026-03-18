import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const students = await prisma.student.findMany({ take: 10 });
  const grades = ['Pre-K', 'K1', 'K2', 'Grade 1', 'Grade 2'];
  
  for (let i = 0; i < students.length; i++) {
    await prisma.student.update({
      where: { id: students[i].id },
      data: { 
        grade: grades[i % grades.length],
        status: 'ACTIVE'
      }
    });
  }
  console.log('Successfully updated grades for 10 students');
}
main();
