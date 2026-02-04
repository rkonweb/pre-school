'use server'

import { prisma } from "@/lib/prisma"

export async function seedDesignAction() {
    try {
        console.log('🌊 Seeding homepage with Refreshing Summer Fun content...');

        // Hero Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'hero' },
            update: {
                title: 'Hero Section',
                subtitle: 'Main headline and CTA',
                content: JSON.stringify({
                    badge: "Loved by 500+ Schools",
                    headline: "The <span class='text-teal'>happiest</span> way to run your preschool.",
                    subheadline: "Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.",
                    primaryCTA: { text: "Start My Free Trial ✨", link: "/signup" },
                    secondaryCTA: { text: "See How It Works", link: "/demo" },
                    socialProof: { rating: 4.95, text: "from happy educators" }
                }),
                isEnabled: true,
                sortOrder: 1
            },
            create: {
                sectionKey: 'hero',
                title: 'Hero Section',
                subtitle: 'Main headline and CTA',
                content: JSON.stringify({
                    badge: "Loved by 500+ Schools",
                    headline: "The <span class='text-teal'>happiest</span> way to run your preschool.",
                    subheadline: "Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.",
                    primaryCTA: { text: "Start My Free Trial ✨", link: "/signup" },
                    secondaryCTA: { text: "See How It Works", link: "/demo" },
                    socialProof: { rating: 4.95, text: "from happy educators" }
                }),
                isEnabled: true,
                sortOrder: 1
            }
        });

        // Features Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'features' },
            update: {
                title: 'Features',
                subtitle: 'Core platform capabilities',
                content: JSON.stringify({
                    features: [
                        {
                            title: "Automated Billing",
                            description: "Invoices generated and sent automatically. Accept payments online and never chase late fees again.",
                            icon: "CreditCard",
                            type: "billing"
                        },
                        {
                            title: "Parent Communication",
                            description: "Beautiful daily reports, photos, and messaging. Keep parents engaged and informed in real-time.",
                            icon: "Smartphone",
                            type: "communication"
                        },
                        {
                            title: "Admissions Pipeline",
                            description: "Track inquiries, tours, and enrollments. Digital forms that write directly to your database.",
                            icon: "BarChart3",
                            type: "admissions"
                        },
                        {
                            title: "Curriculum Planning",
                            description: "Plan lessons, track milestones, and share progress with parents effortlessly.",
                            icon: "Calendar",
                            type: "curriculum"
                        },
                        {
                            title: "Staff Management",
                            description: "Manage schedules, payroll, and performance reviews in one place.",
                            icon: "Users",
                            type: "staff"
                        },
                        {
                            title: "Secure Data",
                            description: "Bank-grade encryption and daily backups to keep your school's data safe.",
                            icon: "Lock",
                            type: "security"
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 2
            },
            create: {
                sectionKey: 'features',
                title: 'Features',
                subtitle: 'Core platform capabilities',
                content: JSON.stringify({
                    features: [
                        {
                            title: "Automated Billing",
                            description: "Invoices generated and sent automatically. Accept payments online and never chase late fees again.",
                            icon: "CreditCard",
                            type: "billing"
                        },
                        {
                            title: "Parent Communication",
                            description: "Beautiful daily reports, photos, and messaging. Keep parents engaged and informed in real-time.",
                            icon: "Smartphone",
                            type: "communication"
                        },
                        {
                            title: "Admissions Pipeline",
                            description: "Track inquiries, tours, and enrollments. Digital forms that write directly to your database.",
                            icon: "BarChart3",
                            type: "admissions"
                        },
                        {
                            title: "Curriculum Planning",
                            description: "Plan lessons, track milestones, and share progress with parents effortlessly.",
                            icon: "Calendar",
                            type: "curriculum"
                        },
                        {
                            title: "Staff Management",
                            description: "Manage schedules, payroll, and performance reviews in one place.",
                            icon: "Users",
                            type: "staff"
                        },
                        {
                            title: "Secure Data",
                            description: "Bank-grade encryption and daily backups to keep your school's data safe.",
                            icon: "Lock",
                            type: "security"
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 2
            }
        });

        // CTA Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'cta' },
            update: {
                title: 'Call to Action',
                subtitle: 'Final conversion section',
                content: JSON.stringify({
                    headline: "Ready to transform your preschool?",
                    subheadline: "Join hundreds of schools already running smoother, happier operations.",
                    buttonText: "Get Started Now",
                    buttonLink: "/signup",
                    features: ["14-day free trial", "No credit card required", "Cancel anytime"]
                }),
                isEnabled: true,
                sortOrder: 3
            },
            create: {
                sectionKey: 'cta',
                title: 'Call to Action',
                subtitle: 'Final conversion section',
                content: JSON.stringify({
                    headline: "Ready to transform your preschool?",
                    subheadline: "Join hundreds of schools already running smoother, happier operations.",
                    buttonText: "Get Started Now",
                    buttonLink: "/signup",
                    features: ["14-day free trial", "No credit card required", "Cancel anytime"]
                }),
                isEnabled: true,
                sortOrder: 3
            }
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error seeding homepage:', error);
        return { success: false, error: String(error) };
    }
}
