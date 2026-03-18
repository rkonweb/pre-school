import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const school = await prisma.school.findUnique({ where: { slug: 'littlechanakyas' } })
  console.log(school)
}

main()
  .catch(e => console.error(e))
  .finally(async () => { await prisma.$disconnect() })
