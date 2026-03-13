const { PrismaClient } = require("./src/generated/client");
const prisma = new PrismaClient();

async function check() {
    const school = await prisma.school.findUnique({
        where: { slug: "gggggggggg" },
        select: { googleMapsApiKey: true }
    });
    console.log("API Key for gggggggggg:", school?.googleMapsApiKey ? `${school.googleMapsApiKey.substring(0, 5)}...` : "EMPTY");
}

check().finally(() => prisma.$disconnect());
