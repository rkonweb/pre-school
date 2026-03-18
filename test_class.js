const { jwtSign } = require("jose");
const { PrismaClient } = require("@prisma/client");
const http = require("http");

async function main() {
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({ where: { email: "krishna.singh@example.com" }});
    console.log("Teacher:", user.id);

    // To sign using jose without ES modules overhead, wait, just use fetch inside the node script.
}
main().catch(console.error);
