const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({ include: { classroom: true } });
  if (!student) return;
  
  const totalHomework = await prisma.homework.count({
    where: { classroomId: student.classroomId }
  });
  
  const submittedHomework = await prisma.homeworkSubmission.count({
    where: { studentId: student.id, isSubmitted: true }
  });
  
  console.log("Total:", totalHomework, "Submitted:", submittedHomework);
}
main().catch(console.error).finally(() => prisma.$disconnect());
