const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedFeaturesPageContent() {
    console.log('🌱 Seeding features page content...');

    const sections = [
        {
            sectionKey: 'hero',
            title: 'Everything you need to Excel',
            subtitle: 'A comprehensive suite of tools designed to handle the complexities of modern early education management.',
            content: JSON.stringify({
                badge: 'Powering over 500+ preschools globally',
                badgeIcon: 'Zap',
                headline: 'Everything you need to <span class="text-[#FF9F99] relative inline-block">Excel.</span>',
                description: 'A comprehensive suite of tools designed to handle the complexities of modern early education management, so you can focus on the children.'
            }),
            isEnabled: true,
            sortOrder: 1
        },
        {
            sectionKey: 'highlight',
            title: 'Step-by-Step Curriculum Guide',
            subtitle: 'Interactive curriculum planner.',
            content: JSON.stringify({
                badge: 'Signature Feature',
                title: 'Step-by-Step Curriculum Guide',
                description: 'Stop guessing what to teach. Our interactive curriculum planner maps out daily activities, milestones, and learning goals for every age group.',
                features: [
                    'Age-appropriate lesson plans pre-loaded',
                    'Resource materials and printable worksheets',
                    'Progress tracking against state standards',
                    'Teacher observation logs'
                ]
            }),
            isEnabled: true,
            sortOrder: 2
        },
        {
            sectionKey: 'features',
            title: 'All Features',
            subtitle: 'Complete feature set',
            content: JSON.stringify({
                features: [
                    {
                        icon: 'Users',
                        bgColor: '#B6E9F0',
                        textColor: 'text-cyan-700',
                        title: 'Admissions Management',
                        description: 'Streamline the entire enrollment process from inquiry to onboarding. Digital forms, document uploads, and automated status updates.'
                    },
                    {
                        icon: 'Calendar',
                        bgColor: '#FFD2CF',
                        textColor: 'text-rose-700',
                        title: 'Smart Attendance',
                        description: 'One-tap attendance for students and staff. Geo-fencing support, leave management, and instant notifications to parents.'
                    },
                    {
                        icon: 'CreditCard',
                        bgColor: '#D8F2C9',
                        textColor: 'text-emerald-700',
                        title: 'Fee Billing & Invoicing',
                        description: 'Automated recurring invoices, online payment integration, and overdue reminders. Never miss a payment again.'
                    },
                    {
                        icon: 'MessageCircle',
                        bgColor: '#FFE2C2',
                        textColor: 'text-orange-700',
                        title: 'Parent Communication',
                        description: 'A dedicated parent app for daily reports, photos, event calendars, and two-way messaging with teachers.'
                    },
                    {
                        icon: 'BookOpen',
                        bgColor: '#EDF7CB',
                        textColor: 'text-lime-700',
                        title: 'Curriculum Planning',
                        description: 'Design and track lesson plans, syllabus progress, and student assessments. Align with educational standards effortlessly.'
                    },
                    {
                        icon: 'Bus',
                        bgColor: '#FCEBC7',
                        textColor: 'text-amber-700',
                        title: 'Transport Tracking',
                        description: 'Real-time bus tracking for parents and admins. Route optimization and safe pickup/drop-off verification.'
                    },
                    {
                        icon: 'Utensils',
                        bgColor: '#BDF0D8',
                        textColor: 'text-teal-700',
                        title: 'Meal Management',
                        description: 'Plan weekly menus, track student allergies, and manage inventory for your school kitchen.'
                    },
                    {
                        icon: 'BarChart3',
                        bgColor: '#B6E9F0',
                        textColor: 'text-blue-700',
                        title: 'Analytics & Reports',
                        description: 'Deep insights into admission trends, revenue health, and academic performance. Exportable reports for board meetings.'
                    }
                ],
                ctaCard: {
                    title: 'And so much more...',
                    description: 'Explore the full potential of your preschool management with a personalized walkthrough.',
                    buttonText: 'Book a Demo',
                    buttonLink: '/demo'
                }
            }),
            isEnabled: true,
            sortOrder: 3
        }
    ];

    for (const section of sections) {
        await prisma.featuresPageContent.upsert({
            where: { sectionKey: section.sectionKey },
            create: section,
            update: section
        });
        console.log(`✅ Seeded features section: ${section.sectionKey}`);
    }

    console.log('✨ Features page content seeded successfully!');
}

seedFeaturesPageContent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
