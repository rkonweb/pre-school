import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const staff = await prisma.user.findFirst({ where: { role: 'STAFF' }});
  const students = await prisma.student.findMany({
    where: { schoolId: staff?.schoolId! },
    include: { classroom: true }
  });
  
  const groups: any = {};
  students.forEach(s => {
    const cname = s.classroom ? s.classroom.name : "UNASSIGNED";
    if (!groups[cname]) groups[cname] = 0;
    groups[cname]++;
  });
  
  console.log("Students by classroom:");
  console.log(groups);
}

main().catch(console.error).finally(() => prisma.$disconnect());
