const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHomepageContent() {
    console.log('🌱 Seeding homepage content...');

    const sections = [
        {
            sectionKey: 'hero',
            title: 'The happiest way to run your preschool',
            subtitle: 'Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.',
            content: JSON.stringify({
                badge: 'LOVED BY 500+ SCHOOLS',
                headline: 'The <span class="text-[#FF9F99]">happiest</span> way to run your preschool.',
                subheadline: 'Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.',
                primaryCTA: { text: 'Start My Free Trial', link: '/signup' },
                secondaryCTA: { text: 'See How It Works', link: '/demo' },
                socialProof: { rating: 4.9, text: 'from happy educators' }
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'features',
            title: 'Sweet solutions for sticky problems',
            subtitle: 'Say goodbye to paper piles and hello to peace of mind.',
            content: JSON.stringify({
                features: [
                    {
                        title: 'The Daily Guide',
                        description: 'Like a gentle hand guiding you through the day. Ratios, compliance, and billing checked automatically.',
                        color: '#B6E9F0',
                        icon: 'BookOpen'
                    },
                    {
                        title: 'Parent Joy',
                        description: 'Beautiful digital diaries, photos, and updates that make parents feel connected and happy.',
                        color: '#FFD2CF',
                        icon: 'Heart'
                    },
                    {
                        title: 'Smart Billing',
                        description: 'Invoices that send themselves. Get paid on time without the awkward conversations.',
                        color: '#D8F2C9',
                        icon: 'CreditCard'
                    }
                ]
            }),
            isEnabled: true,
            sortOrder: 2
        },
        {
            sectionKey: 'pricing',
            title: 'Invest in extra recess',
            subtitle: 'Clear plans that grow with your little learners.',
            content: JSON.stringify({
                badge: 'Simple Pricing',
                showPlans: true,
                plansFromDatabase: true
            }),
            isEnabled: true,
            sortOrder: 3
        },
        {
            sectionKey: 'cta',
            title: 'Ready to play?',
            subtitle: 'Join the community of educators who are making preschool management a breeze.',
            content: JSON.stringify({
                buttonText: 'Start Your Free Trial',
                buttonLink: '/signup',
                features: ['No credit card required', 'Cancel anytime']
            }),
            isEnabled: true,
            sortOrder: 4
        }
    ];

    for (const section of sections) {
        await prisma.homepageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded section: ${section.sectionKey}`);
    }

    console.log('✨ Homepage content seeded successfully!');
}

seedHomepageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
