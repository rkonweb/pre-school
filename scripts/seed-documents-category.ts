
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding School Resources (DMS)...");

    // 1. Create/Update "School Resources" Category
    const category = await prisma.trainingCategory.upsert({
        where: { slug: "school-resources" },
        update: {
            name: "School Resources",
            description: "Official documents, policies, and resources for school administration.",
        },
        create: {
            name: "School Resources",
            slug: "school-resources",
            description: "Official documents, policies, and resources for school administration.",
        },
    });

    console.log(`✅ Category '${category.name}' ready.`);

    // 2. Create Modules (Folders)
    const modules = [
        {
            title: "HR Documents",
            slug: "hr-documents",
            description: "Human Resources policies, leave forms, and employee handbooks.",
            order: 1,
            topics: [
                {
                    title: "Policies",
                    order: 1,
                    pages: [
                        { title: "Leave Policy 2026", content: "<p>Standard leave policy content...</p>" },
                        { title: "Code of Conduct", content: "<p>Employee code of conduct...</p>" }
                    ]
                },
                {
                    title: "Forms",
                    order: 2,
                    pages: [
                        { title: "Reimbursement Form", content: "<p>Download the form below.</p>" }
                    ]
                }
            ]
        },
        {
            title: "Legal & Compliance",
            slug: "legal-compliance",
            description: "Regulatory documents, agreements, and safety guidelines.",
            order: 2,
            topics: [
                {
                    title: "Agreements",
                    order: 1,
                    pages: [
                        { title: "Service Agreement Template", content: "<p>Standard template.</p>" },
                        { title: "NDA Format", content: "<p>Non-Disclosure Agreement format.</p>" }
                    ]
                }
            ]
        },
        {
            title: "Operations",
            slug: "operations",
            description: "Daily operational checklists and guidelines.",
            order: 3,
            topics: []
        }
    ];

    for (const mod of modules) {
        const moduleRecord = await prisma.trainingModule.upsert({
            where: { slug: mod.slug },
            update: {
                title: mod.title,
                description: mod.description,
                categoryId: category.id,
                order: mod.order,
                isPublished: true,
            },
            create: {
                title: mod.title,
                slug: mod.slug,
                description: mod.description,
                categoryId: category.id,
                order: mod.order,
                isPublished: true,
            },
        });

        console.log(`   📁 Module '${moduleRecord.title}' ready.`);

        if (mod.topics) {
            for (const topic of mod.topics) {
                const topicRecord = await prisma.trainingTopic.create({
                    data: {
                        title: topic.title,
                        moduleId: moduleRecord.id,
                        order: topic.order,
                        pages: {
                            create: topic.pages.map((page, idx) => ({
                                title: page.title,
                                content: page.content,
                                order: idx + 1,
                                isPublished: true
                            }))
                        }
                    }
                });
                console.log(`      Example Topic '${topicRecord.title}' created with ${topic.pages.length} pages.`);
            }
        }
    }

    console.log("✅ Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
