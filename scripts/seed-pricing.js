const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPricingPageContent() {
    console.log('🌱 Seeding pricing page content...');

    const sections = [
        {
            sectionKey: 'hero',
            title: 'Transparent Pricing for Every School',
            subtitle: 'Pricing page hero section',
            content: JSON.stringify({
                headline: "Transparent Pricing <span class='text-[#FF9F99]'>for Every School</span>",
                description: "Whether you are a small daycare or a multi-campus institution, we have a plan that fits your needs perfectly.",
                badge: "No hidden fees. Cancel anytime.",
                badgeIcon: "Star"
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'comparison',
            title: 'Feature Comparison',
            subtitle: 'Detailed breakdown table',
            content: JSON.stringify({
                title: "Comprehensive Comparison",
                description: "Detailed breakdown of what's included in each plan so you can make an informed decision.",
                showTable: true
            }),
            isEnabled: true,
            sortOrder: 2
        },
        {
            sectionKey: 'faq',
            title: 'FAQ Section',
            subtitle: 'Common pre-sales questions',
            content: JSON.stringify({
                title: "Frequently Asked Questions",
                questions: [
                    { "q": "Can I upgrade my plan later?", "a": "Yes, you can upgrade or downgrade your plan at any time from your admin dashboard." },
                    { "q": "Do you offer a free trial?", "a": "Absolutely! You can start with our Free subscription to test the waters with up to 20 students." },
                    { "q": "What happens if I exceed my student limit?", "a": "We will notify you when you approach your limit. You'll need to upgrade to the next tier to add more students." },
                    { "q": "Is my data secure?", "a": "Security is our top priority. We use industry-standard encryption and backup your data daily." }
                ]
            }),
            isEnabled: true,
            sortOrder: 3
        }
    ];

    for (const section of sections) {
        await prisma.pricingPageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded pricing section: ${section.sectionKey}`);
    }

    console.log('✨ Pricing page content seeded successfully!');
}

seedPricingPageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
