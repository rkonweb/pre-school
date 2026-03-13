import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const school = await prisma.school.findUnique({ where: { slug: 'littlechanakyas' } });
  if (!school) { console.log('School not found'); return; }
  
  const studentCount = await prisma.student.count({ where: { schoolId: school.id } });
  const studentsWithoutBranch = await prisma.student.count({ where: { schoolId: school.id, branchId: null } });
  
  const users = await prisma.user.findMany({ 
    where: { schoolId: school.id },
    select: { id: true, firstName: true, role: true, currentBranchId: true }
  });

  const branches = await prisma.branch.findMany({ where: { schoolId: school.id } });

  console.log('School:', school.name, '(', school.id, ')');
  console.log('Branches:', branches.map(b => ({ id: b.id, name: b.name })));
  console.log('Total Students:', studentCount);
  console.log('Students without branchId:', studentsWithoutBranch);
  
  const branchStudentCounts = await Promise.all(branches.map(async b => {
    const count = await prisma.student.count({ where: { branchId: b.id } });
    return { name: b.name, id: b.id, count };
  }));
  console.log('Student counts by branch:', branchStudentCounts);

  console.log('Users in this school:', users.map(u => ({ 
    name: u.firstName, 
    role: u.role, 
    currentBranchId: u.currentBranchId 
  })));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
