import { PrismaClient } from '@prisma/client'
import { getEnforcedScope } from './src/lib/access-control'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }});
  if (!admin) {
    console.log("No admin found");
    return;
  }
  
  console.log(`Admin ${admin.firstName} ${admin.lastName} (${admin.id}) in School ${admin.schoolId}`);
  const scope = await getEnforcedScope(admin.id, admin.role);
  
  let studentWhere: any = { schoolId: admin.schoolId };

  if (scope.restriction) {
      if (scope.allowedIds.length > 0) {
          studentWhere.classroomId = { in: scope.allowedIds };
      } else {
          studentWhere.id = "_NONE_"; // block
      }
  }

  const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          status: true
      },
      orderBy: { firstName: 'asc' }
  });

  console.log(`Admin fetched students: ${students.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
