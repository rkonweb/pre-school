import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ include: { school: true } });
  console.log("Users and their schools:");
  console.log(users.map(u => ({ email: u.email, school: u.school?.slug, lat: u.school?.latitude, lng: u.school?.longitude, name: u.name })));
}
run().catch(console.error).finally(() => prisma.$disconnect());
