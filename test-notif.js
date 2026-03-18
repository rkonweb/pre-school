const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cnt = await prisma.notification.count();
  console.log("Notifications count:", cnt);
  if (cnt === 0) {
     // Seed some notifications for testing
     await prisma.notification.createMany({
       data: [
         { userId: "9876543210", userType: "PARENT", title: "Urgent Meeting", message: "Parent-Teacher Meeting rescheduled to 15 Mar.", type: "urgent", isRead: false },
         { userId: "9876543210", userType: "PARENT", title: "Math Quiz", message: "Arjun scored 24/25 in today's Algebra surprise quiz.", type: "academic", isRead: false },
         { userId: "9876543210", userType: "PARENT", title: "Fee Due", message: "Term 2 fee of ₹14,500 is due by March 31.", type: "fee", isRead: true },
         { userId: "9876543210", userType: "PARENT", title: "Sports Event", message: "Annual Sports Day on Apr 5. Registration closes soon.", type: "event", isRead: true }
       ]
     });
     console.log("Seeded notifications");
  } else {
     const notifs = await prisma.notification.findMany({ take: 3 });
     console.log(notifs);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
