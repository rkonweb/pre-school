/**
 * Migration Script: Seed About Page to CMS
 * This preserves the existing About page content by moving it to the CMS database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAboutPage() {
    console.log('🌱 Seeding About page to CMS...');

    try {
        // Check if about page already exists
        const existing = await prisma.cMSPage.findUnique({
            where: { slug: 'about' }
        });

        if (existing) {
            console.log('⚠️  About page already exists in CMS. Skipping...');
            return;
        }

        // Create the About page with structured JSON content
        const aboutPageContent = JSON.stringify({
            hero: {
                badge: "Born in the UK",
                title: "Pedagogy meets",
                titleHighlight: "Playfulness.",
                subtitle: "Developed by a collective of Oxford educationists and top-tier scholars who believe early childhood software should be as thoughtful as the curriculum itself."
            },
            oxfordSection: {
                title: "Not just code.",
                titleHighlight: "Academic Rigour.",
                paragraph1: "Most platforms are built by software engineers who have never stepped into a nursery. Bodhi Board is different.",
                paragraph2: "Our founding team met in the hallowed halls of **Oxford University**. Combining backgrounds in **Developmental Psychology**, **Early Years Education**, and **Computer Science**, we set out to build a system that respects the nuance of child development while leveraging cutting-edge technology.",
                teamBadge: "Trusted by alumni from\nOxford, Cambridge, & LSE"
            },
            stats: {
                sectionTitle: "A British Standard of Excellence",
                items: [
                    { label: "Universities Represented", value: "12" },
                    { label: "PhD Researchers", value: "5" },
                    { label: "Years of Research", value: "20+" },
                    { label: "Global Campuses", value: "3" }
                ]
            },
            cta: {
                title: "Experience the difference.",
                buttonText: "Meet the Faculty",
                buttonLink: "/contact"
            }
        });

        await prisma.cMSPage.create({
            data: {
                title: 'About Us',
                slug: 'about',
                content: aboutPageContent,
                metaTitle: 'About Bodhi Board - Oxford-Backed Early Education Platform',
                metaDescription: 'Developed by Oxford educationists and top-tier scholars. Experience pedagogy that meets playfulness in early childhood education software.',
                metaKeywords: 'Oxford education, early childhood, preschool management, academic rigour, UK education',
                isPublished: true
            }
        });

        console.log('✅ About page successfully seeded to CMS!');
    } catch (error) {
        console.error('❌ Error seeding About page:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedAboutPage()
    .then(() => {
        console.log('🎉 Migration complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    });
