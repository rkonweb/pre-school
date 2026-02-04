const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBlogPageContent() {
    console.log('🌱 Seeding blog page content...');

    const sections = [
        {
            sectionKey: 'hero',
            title: 'Blog Header',
            subtitle: 'Main headline and intro',
            content: JSON.stringify({
                badge: "The Chalkboard",
                headline: "Insights from the <br /> <span class='text-[#FF9F99]'>academic edge.</span>",
                description: "Research-backed articles on early childhood education, school management, and pedagogy."
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'newsletter',
            title: 'Newsletter Section',
            subtitle: 'Call to action',
            content: JSON.stringify({
                title: "Pedagogy in your inbox.",
                subtitle: "Join 10,000+ educators receiving our weekly digest.",
                placeholder: "Enter your email",
                buttonText: "Subscribe"
            }),
            isEnabled: true,
            sortOrder: 2
        }
    ];

    for (const section of sections) {
        await prisma.blogPageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded blog section: ${section.sectionKey}`);
    }

    console.log('✨ Blog page content seeded successfully!');
}

seedBlogPageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
