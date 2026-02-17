
import { PrismaClient } from "../src/generated/client_v2";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function seedBlogPosts() {
    console.log('🌱 Seeding 10 Blog Posts...');

    // 1. Get an author (SUPER_ADMIN > ADMIN > ANY)
    let author = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (!author) {
        console.log('⚠️  No SUPER_ADMIN found. Looking for ADMIN...');
        author = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
    }

    if (!author) {
        console.log('⚠️  No ADMIN found. Looking for any user...');
        author = await prisma.user.findFirst();
    }

    if (!author) {
        console.error('❌ No users found in database. Creating a dummy author for seeding...');
        // Create a dummy user if absolutely no one exists
        try {
            author = await prisma.user.create({
                data: {
                    firstName: "Seeding",
                    lastName: "Author",
                    email: "seed-author@example.com",
                    mobile: "9999999999",
                    role: "ADMIN",
                    password: "dummy-password", // Should be hashed usually but for seeding purposes/local dev
                    securityKey: "dummy-key"
                }
            });
            console.log(`✅ Created dummy author: ${author.firstName} ${author.lastName}`);
        } catch (e) {
            console.error('❌ Failed to create dummy author:', e);
            process.exit(1);
        }
    } else {
        console.log(`👤 Using author: ${author.firstName} ${author.lastName} (${author.id}) - Role: ${author.role}`);
    }

    const posts = [
        {
            title: "Future of Early Childhood Education: 2026 Trends",
            slug: "early-childhood-trends-2026",
            excerpt: "Explore the emerging technologies and pedagogical shifts shaping preschool education in the coming year.",
            content: "<p>The landscape of early childhood education is rapidly evolving. From AI-driven personalized learning paths to a renewed focus on nature-based play, 2026 promises to be a transformative year.</p><h2>The Rise of AI Tutors</h2><p>While human interaction remains paramount, AI tools are beginning to offer personalized support for language acquisition and pattern recognition.</p>",
            coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
            tags: ["Trends", "EdTech", "Pedagogy"],
            publishedAt: new Date('2026-01-15')
        },
        {
            title: "Managing School Finances: A Guide for Owners",
            slug: "school-finance-management-guide",
            excerpt: "Practical strategies to optimize budget allocation and streamline fee collection in your preschool.",
            content: "<p>Efficient financial management is the backbone of a successful school. Automated fee collection systems not only save time but also improve cash flow reliability.</p><h3>Budgeting for Growth</h3><p>Allocating resources for staff development and facility upgrades yields distinct long-term ROI.</p>",
            coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2026&auto=format&fit=crop",
            tags: ["Management", "Finance", "Growth"],
            publishedAt: new Date('2026-01-20')
        },
        {
            title: "The Importance of Social-Emotional Learning",
            slug: "importance-social-emotional-learning",
            excerpt: "Why EQ matters just as much as IQ in the formative years of a child's development.",
            content: "<p>Social-Emotional Learning (SEL) provides the foundation for safe and positive learning, and enhances students' ability to succeed in school, careers, and life.</p>",
            coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop",
            tags: ["Pedagogy", "Child Development", "SEL"],
            publishedAt: new Date('2026-02-01')
        },
        {
            title: "Scaling Your Preschool Franchise",
            slug: "scaling-preschool-franchise",
            excerpt: "Key considerations for expanding your brand across multiple locations without diluting quality.",
            content: "<p>Scaling requires robust systems. Standard operating procedures (SOPs) must be digitized and accessible to ensure consistency across all branches.</p>",
            coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
            tags: ["Business", "Scaling", "Franchise"],
            publishedAt: new Date('2026-02-05')
        },
        {
            title: "Digital Safety in the Classroom",
            slug: "digital-safety-classroom",
            excerpt: "Best practices for introducing technology to toddlers while ensuring privacy and well-being.",
            content: "<p>As we integrate more screens, we must also teach digital hygiene. Screen time should be purposeful, interactive, and always supervised.</p>",
            coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
            tags: ["Safety", "Technology", "Parenting"],
            publishedAt: new Date('2026-02-08')
        },
        {
            title: "Nutrition Plans for Growing Minds",
            slug: "nutrition-plans-growing-minds",
            excerpt: "How a balanced diet directly impacts cognitive development and classroom behavior.",
            content: "<p>Sugar crashes are real. A diet rich in omega-3s, whole grains, and minimal processed sugars can significantly improve attention spans.</p>",
            coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop",
            tags: ["Health", "Nutrition", "Wellness"],
            publishedAt: new Date('2026-02-10')
        },
        {
            title: "Parent-Teacher Communication Styles",
            slug: "parent-teacher-communication-styles",
            excerpt: "Bridging the gap between home and school for better student outcomes.",
            content: "<p>Transparent, frequent communication builds trust. Utilizing apps for daily updates allows parents to feel connected to their child's day without being intrusive.</p>",
            coverImage: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
            tags: ["Communication", "Parents", "Community"],
            publishedAt: new Date('2026-02-12')
        },
        {
            title: "Designing the Perfect Classroom Layout",
            slug: "perfect-classroom-layout-design",
            excerpt: "Optimizing physical space to encourage exploration, focus, and safety.",
            content: "<p>Zones are key. Separate quiet reading nooks from active play areas. Use natural light and calming colors to regulate energy levels.</p>",
            coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
            tags: ["Design", "Facility", "Infrastructure"],
            publishedAt: new Date('2026-02-14')
        },
        {
            title: "Staff Retention Strategies for 2026",
            slug: "staff-retention-strategies-2026",
            excerpt: "Keeping your best talent motivated and engaged in a competitive job market.",
            content: "<p>It's not just about salary. Professional development opportunities and a supportive culture are top drivers for teacher retention.</p>",
            coverImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop",
            tags: ["HR", "Management", "Team"],
            publishedAt: new Date('2026-02-15')
        },
        {
            title: "The Role of Play in Cognitive Development",
            slug: "role-of-play-cognitive-development",
            excerpt: "Understanding the science behind 'learning through play' methodology.",
            content: "<p>Play is the work of the child. Through unstructured play, children develop executive function skills that formal instruction often misses.</p>",
            coverImage: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=2069&auto=format&fit=crop",
            tags: ["Pedagogy", "Science", "Learning"],
            publishedAt: new Date('2026-02-16')
        }
    ];

    for (const post of posts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {},
            create: {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                authorId: author.id,
                isPublished: true,
                publishedAt: post.publishedAt,
                tags: JSON.stringify(post.tags),
                metaTitle: post.title,
                metaDescription: post.excerpt,
                metaKeywords: post.tags.join(', ')
            }
        });
        console.log(`✅ Created post: ${post.title}`);
    }

    console.log('✨ Blog posts seeded successfully!');
}

seedBlogPosts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
