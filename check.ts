import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const staffArray = await prisma.user.findMany({
    where: { role: 'STAFF' }
  });
  
  for (const staff of staffArray) {
    const scope = await prisma.classAccess.findMany({
      where: { userId: staff.id }
    });
    
    const classrooms = scope.map((s: any) => s.classroomId);

    const managedClassrooms = await prisma.classroom.findMany({
      where: { teacherId: staff.id },
      select: { id: true, name: true }
    });
    
    console.log(`\n\nStaff ${staff.firstName} ${staff.lastName} (${staff.id}):`);
    console.log(`  Allowed Classrooms via ClassAccess: ${classrooms.length}`);
    console.log(`  Classrooms as Teacher: ${managedClassrooms.map(c => c.name).join(', ')}`);

    const allAllowedClassrooms = [...new Set([...classrooms, ...managedClassrooms.map(c => c.id)])];

    let students = [];
    if (allAllowedClassrooms.length > 0) {
      students = await prisma.student.findMany({
        where: {
          schoolId: staff.schoolId!,
          classroomId: { in: allAllowedClassrooms }
        },
        orderBy: { firstName: 'asc' }
      });
    }

    if (students.length > 0) {
      console.log(`  Allowed Students (Total): ${students.length}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
