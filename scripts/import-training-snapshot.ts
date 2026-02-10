
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    const jsonPath = path.join(process.cwd(), "prisma/seeds/data/training-snapshot.json");
    if (!fs.existsSync(jsonPath)) {
        console.error("❌ Snapshot file not found at", jsonPath);
        process.exit(1);
    }

    console.log("📥 Importing Training Data from Snapshot...");
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    const { categories, modules, topics, pages, attachments } = data;

    // 1. Categories
    console.log(`Processing ${categories.length} Categories...`);
    for (const cat of categories) {
        await prisma.trainingCategory.upsert({
            where: { id: cat.id },
            update: cat,
            create: cat
        });
    }

    // 2. Modules
    console.log(`Processing ${modules.length} Modules...`);
    for (const mod of modules) {
        await prisma.trainingModule.upsert({
            where: { id: mod.id },
            update: mod,
            create: mod
        });
    }

    // 3. Topics
    console.log(`Processing ${topics.length} Topics...`);
    for (const topic of topics) {
        await prisma.trainingTopic.upsert({
            where: { id: topic.id },
            update: topic,
            create: topic
        });
    }

    // 4. Pages
    console.log(`Processing ${pages.length} Pages...`);
    for (const page of pages) {
        await prisma.trainingPage.upsert({
            where: { id: page.id },
            update: page,
            create: page
        });
    }

    // 5. Attachments
    console.log(`Processing ${attachments.length} Attachments...`);
    for (const att of attachments) {
        await prisma.trainingAttachment.upsert({
            where: { id: att.id },
            update: att,
            create: att
        });
    }

    console.log("✅ Training Data Import Complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
