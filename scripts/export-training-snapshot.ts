
import { PrismaClient } from "../src/generated/client_final";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("📦 Exporting Training Data Snapshot...");

    const categories = await prisma.trainingCategory.findMany();
    const modules = await prisma.trainingModule.findMany();
    const topics = await prisma.trainingTopic.findMany();
    const pages = await prisma.trainingPage.findMany();
    const attachments = await prisma.trainingAttachment.findMany();

    const data = {
        categories,
        modules,
        topics,
        pages,
        attachments
    };

    const outputPath = path.join(process.cwd(), "prisma/seeds/data/training-snapshot.json");

    // Ensure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Snapshot saved to ${outputPath}`);
    console.log(`Stats:
    - ${categories.length} Categories
    - ${modules.length} Modules
    - ${topics.length} Topics
    - ${pages.length} Pages
    - ${attachments.length} Attachments`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
