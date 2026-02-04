const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedContactPageContent() {
    console.log('🌱 Seeding contact page content...');

    const sections = [
        {
            sectionKey: 'info',
            title: 'Contact Information',
            subtitle: 'Addresses and emails',
            content: JSON.stringify({
                title: "Let's start a conversation.",
                description: "Whether you're a small nursery or a large district, our Oxford-based team is here to help.",
                headquarters: {
                    title: "Headquarters",
                    address: "12 Innovation Way,<br />Oxford Science Park,<br />OX4 4GA, United Kingdom"
                },
                email: {
                    title: "Email Us",
                    addresses: [
                        "hello@bodhiboard.co.uk",
                        "support@bodhiboard.co.uk"
                    ]
                }
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'form',
            title: 'Form Settings',
            subtitle: 'Form labels',
            content: JSON.stringify({
                submitButtonText: "Send Message",
                successMessage: "Thanks! We'll be in touch."
            }),
            isEnabled: true,
            sortOrder: 2
        }
    ];

    for (const section of sections) {
        await prisma.contactPageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded contact section: ${section.sectionKey}`);
    }

    console.log('✨ Contact page content seeded successfully!');
}

seedContactPageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
