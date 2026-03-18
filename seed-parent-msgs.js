const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.student.findFirst();
  if (!s) return console.log('No student found');
  
  // Seed a conversation with the class teacher (Ms. Priya Sharma)
  let c1 = await prisma.conversation.create({
    data: {
      studentId: s.id,
      type: 'TEACHER',
      title: 'Ms. Priya Sharma',
      participantType: 'BOTH'
    }
  });

  await prisma.message.createMany({
    data: [
      { conversationId: c1.id, content: "Good morning! Arjun did really well in today's Algebra test. Score: 24/25! 🎉", senderType: 'STAFF', senderName: 'Ms. Priya Sharma', type: 'TEXT', isRead: true },
      { conversationId: c1.id, content: "He's been consistently improving. I think he's ready for the term exam.", senderType: 'STAFF', senderName: 'Ms. Priya Sharma', type: 'TEXT', isRead: true },
      { conversationId: c1.id, content: "Thank you so much! We've been encouraging him to practice daily. 😊", senderType: 'PARENT', senderName: 'Rahul', type: 'TEXT', isRead: true },
    ]
  });

  // Seed another conversation 
  let c2 = await prisma.conversation.create({
    data: {
      studentId: s.id,
      type: 'GENERAL',
      title: 'School Administration',
      participantType: 'BOTH'
    }
  });

  await prisma.message.createMany({
    data: [
      { conversationId: c2.id, content: "Dear Parent — the Parent-Teacher Meeting is scheduled for March 15, 2025.", senderType: 'STAFF', senderName: 'School Admin', type: 'TEXT', isRead: false },
      { conversationId: c2.id, content: "Book your preferred slot through the portal by March 12.", senderType: 'STAFF', senderName: 'School Admin', type: 'TEXT', isRead: false },
    ]
  });

  console.log('Seeded conversations for student', s.id);
  
  // Also fix lastMessageAt
  await prisma.conversation.update({ where: { id: c1.id }, data: { lastMessageAt: new Date() }});
  await prisma.conversation.update({ where: { id: c2.id }, data: { lastMessageAt: new Date() }});
}

main().catch(console.error).finally(() => prisma.$disconnect());
