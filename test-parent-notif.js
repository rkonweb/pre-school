const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.student.findFirst();
  if (s) {
    const p = s.parentMobile;
    console.log('Mobile', p);
    await prisma.notification.createMany({
       data: [
         { userId: p, userType: 'PARENT', title: 'Urgent: Weather Alert', message: 'School starts 1 hour late tomorrow due to heavy rains.', type: 'urgent', isRead: false },
         { userId: p, userType: 'PARENT', title: 'Math Quiz Result', message: 'Your child scored 24/25 in today\'s Algebra surprise quiz — highest in class! Great effort.', type: 'academic', isRead: false },
         { userId: p, userType: 'PARENT', title: 'Fee Due Reminder', message: 'Term 2 fee of ₹14,500 is due by March 31. Pay online to avoid late charges.', type: 'fee', isRead: true },
         { userId: p, userType: 'PARENT', title: 'Science Exhibition Entry', message: 'Your child has been selected for the Inter-School Science Fair on Mar 22.', type: 'event', isRead: true }
       ]
    });
    console.log('Inserted parent notifications for', p);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
