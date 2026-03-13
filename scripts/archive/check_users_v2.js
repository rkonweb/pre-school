const { PrismaClient } = require('./src/generated/client_final')
const prisma = new PrismaClient()
async function main() {
    const users = await prisma.user.findMany({
        where: { role: { in: ['STAFF', 'TEACHER'] } },
        select: { id: true, firstName: true, avatar: true, role: true }
    })
    console.log(JSON.stringify(users, null, 2))
    await prisma.$disconnect()
}
main().catch(e => {
    console.error(e)
    process.exit(1)
})
