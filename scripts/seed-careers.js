const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCareersPageContent() {
    console.log('🌱 Seeding careers page content...');

    const sections = [
        {
            sectionKey: 'hero',
            title: 'Careers Hero',
            subtitle: 'Main headline and intro',
            content: JSON.stringify({
                badge: "We are hiring",
                headline: "Build the <span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF9F99] to-[#D68F8A]'>classroom</span> <br /> of tomorrow.",
                description: "Join a team of Oxford scholars, ex-teachers, and world-class engineers redefining early education."
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'culture',
            title: 'Culture & Values',
            subtitle: 'Highlights of company culture',
            content: JSON.stringify({
                hqCard: { title: "London HQ", description: "Based in the heart of London with satellite hubs in Oxford and Cambridge." },
                statCard: { value: "4.5", label: "Glassdoor Score" }
            }),
            isEnabled: true,
            sortOrder: 2
        }
    ];

    for (const section of sections) {
        await prisma.careersPageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded careers section: ${section.sectionKey}`);
    }

    console.log('✨ Careers page content seeded successfully!');
}

seedCareersPageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
