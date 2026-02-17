const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHomepage() {
    console.log('🎨 Seeding homepage with Figma design content...');

    try {
        // 1. Hero Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'hero' },
            create: {
                sectionKey: 'hero',
                title: 'Hero Section',
                subtitle: 'Main headline and CTA',
                content: JSON.stringify({
                    badge: "Trusted by Educators. Built by School Founders.",
                    headline: "The Operating System for Modern Schools",
                    subheadline: "Bodhi Board is a complete education platform that combines ERP, curriculum, staff training, marketing, and parent communication — so schools don't just run, they grow.",
                    primaryCTA: { text: "Start Free 30-Day Trial", link: "/signup" },
                    secondaryCTA: { text: "Watch Product Demo", link: "#" },
                    stats: [
                        { value: "500+", label: "Schools" },
                        { value: "12,000+", label: "Students" },
                        { value: "850+", label: "Teachers" },
                        { value: "15+", label: "Countries" }
                    ]
                }),
                isEnabled: true,
                sortOrder: 1
            },
            update: {
                content: JSON.stringify({
                    badge: "Trusted by Educators. Built by School Founders.",
                    headline: "The Operating System for Modern Schools",
                    subheadline: "Bodhi Board is a complete education platform that combines ERP, curriculum, staff training, marketing, and parent communication — so schools don't just run, they grow.",
                    primaryCTA: { text: "Start Free 30-Day Trial", link: "/signup" },
                    secondaryCTA: { text: "Watch Product Demo", link: "#" },
                    stats: [
                        { value: "500+", label: "Schools" },
                        { value: "12,000+", label: "Students" },
                        { value: "850+", label: "Teachers" },
                        { value: "15+", label: "Countries" }
                    ]
                })
            }
        });

        // 2. Problem/Solution Section (Comparison)
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'comparison' },
            create: {
                sectionKey: 'comparison',
                title: 'Problem/Solution Comparison',
                subtitle: 'Transformation stories',
                content: JSON.stringify({
                    badge: "The Transformation",
                    headline: "Stop Struggling. <span class='bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>Start Growing.</span>",
                    subheadline: "See how every challenge transforms into an opportunity",
                    transformations: [
                        {
                            problem: {
                                title: "Admissions scattered across calls, WhatsApp, and paper",
                                icon: "Phone",
                                stat: "40%",
                                statLabel: "Lost Leads"
                            },
                            solution: {
                                title: "Smart lead management with automated follow-ups",
                                icon: "Target",
                                stat: "2x",
                                statLabel: "Conversion"
                            }
                        },
                        {
                            problem: {
                                title: "Manual follow-ups eating staff hours every day",
                                icon: "Clock",
                                stat: "15hr",
                                statLabel: "Wasted Weekly"
                            },
                            solution: {
                                title: "AI-powered automation handles repetitive tasks",
                                icon: "Zap",
                                stat: "95%",
                                statLabel: "Time Saved"
                            }
                        },
                        {
                            problem: {
                                title: "Untrained staff creating inconsistent experiences",
                                icon: "Users",
                                stat: "60%",
                                statLabel: "Quality Issues"
                            },
                            solution: {
                                title: "Built-in training with performance tracking",
                                icon: "GraduationCap",
                                stat: "4.8★",
                                statLabel: "Parent Rating"
                            }
                        },
                        {
                            problem: {
                                title: "Curriculum chaos with scattered documents",
                                icon: "BookOpen",
                                stat: "3hr",
                                statLabel: "Daily Search"
                            },
                            solution: {
                                title: "Ready-to-use curriculum with lesson plans",
                                icon: "Book",
                                stat: "1 week",
                                statLabel: "To Launch"
                            }
                        },
                        {
                            problem: {
                                title: "Parents calling constantly for updates",
                                icon: "MessageSquare",
                                stat: "50+",
                                statLabel: "Daily Calls"
                            },
                            solution: {
                                title: "Real-time updates keep parents informed",
                                icon: "User",
                                stat: "90%",
                                statLabel: "Fewer Calls"
                            }
                        },
                        {
                            problem: {
                                title: "Multiple tools that don't talk to each other",
                                icon: "Wrench",
                                stat: "5+",
                                statLabel: "Separate Apps"
                            },
                            solution: {
                                title: "One unified platform for everything",
                                icon: "PieChart",
                                stat: "100%",
                                statLabel: "Connected"
                            }
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 2
            },
            update: {
                content: JSON.stringify({
                    badge: "The Transformation",
                    headline: "Stop Struggling. <span class='bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent'>Start Growing.</span>",
                    subheadline: "See how every challenge transforms into an opportunity",
                    transformations: [
                        {
                            problem: {
                                title: "Admissions scattered across calls, WhatsApp, and paper",
                                icon: "Phone",
                                stat: "40%",
                                statLabel: "Lost Leads"
                            },
                            solution: {
                                title: "Smart lead management with automated follow-ups",
                                icon: "Target",
                                stat: "2x",
                                statLabel: "Conversion"
                            }
                        },
                        {
                            problem: {
                                title: "Manual follow-ups eating staff hours every day",
                                icon: "Clock",
                                stat: "15hr",
                                statLabel: "Wasted Weekly"
                            },
                            solution: {
                                title: "AI-powered automation handles repetitive tasks",
                                icon: "Zap",
                                stat: "95%",
                                statLabel: "Time Saved"
                            }
                        },
                        {
                            problem: {
                                title: "Untrained staff creating inconsistent experiences",
                                icon: "Users",
                                stat: "60%",
                                statLabel: "Quality Issues"
                            },
                            solution: {
                                title: "Built-in training with performance tracking",
                                icon: "GraduationCap",
                                stat: "4.8★",
                                statLabel: "Parent Rating"
                            }
                        },
                        {
                            problem: {
                                title: "Curriculum chaos with scattered documents",
                                icon: "BookOpen",
                                stat: "3hr",
                                statLabel: "Daily Search"
                            },
                            solution: {
                                title: "Ready-to-use curriculum with lesson plans",
                                icon: "Book",
                                stat: "1 week",
                                statLabel: "To Launch"
                            }
                        },
                        {
                            problem: {
                                title: "Parents calling constantly for updates",
                                icon: "MessageSquare",
                                stat: "50+",
                                statLabel: "Daily Calls"
                            },
                            solution: {
                                title: "Real-time updates keep parents informed",
                                icon: "User",
                                stat: "90%",
                                statLabel: "Fewer Calls"
                            }
                        },
                        {
                            problem: {
                                title: "Multiple tools that don't talk to each other",
                                icon: "Wrench",
                                stat: "5+",
                                statLabel: "Separate Apps"
                            },
                            solution: {
                                title: "One unified platform for everything",
                                icon: "PieChart",
                                stat: "100%",
                                statLabel: "Connected"
                            }
                        }
                    ]
                })
            }
        });

        // 3. Features Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'features' },
            create: {
                sectionKey: 'features',
                title: 'Core Features',
                subtitle: 'Complete platform capabilities',
                content: JSON.stringify({
                    headline: "Not Just an ERP. <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>A Complete School Operating System.</span>",
                    features: [
                        {
                            icon: "UserCheck",
                            title: "Admissions & Lead Intelligence",
                            description: "Track inquiries, automate follow-ups, manage school tours, and convert leads faster with AI-powered pipelines.",
                            highlights: [
                                { icon: "Target", text: "Lead tracking" },
                                { icon: "Zap", text: "Auto follow-ups" }
                            ]
                        },
                        {
                            icon: "BookOpen",
                            title: "Integrated Preschool Curriculum",
                            description: "Ready-to-use curriculum, lesson plans, learning outcomes, and progress tracking — designed by educators.",
                            highlights: [
                                { icon: "FileText", text: "Lesson plans" },
                                { icon: "BarChart3", text: "Progress tracking" }
                            ]
                        },
                        {
                            icon: "GraduationCap",
                            title: "Staff & Induction Training Modules",
                            description: "Structured onboarding for teachers, nannies, drivers, and staff — ensuring consistent quality from day one.",
                            highlights: [
                                { icon: "Users", text: "Team onboarding" },
                                { icon: "Target", text: "Quality standards" }
                            ]
                        },
                        {
                            icon: "MessageSquare",
                            title: "Parent Communication That Builds Trust",
                            description: "Attendance, diary updates, announcements, progress reports, and instant communication through a beautiful parent app.",
                            highlights: [
                                { icon: "Zap", text: "Instant updates" },
                                { icon: "FileText", text: "Digital diary" }
                            ]
                        },
                        {
                            icon: "DollarSign",
                            title: "Billing, Attendance & Operations",
                            description: "Fees, attendance, classes, timetable, inventory, transport, and documents — fully connected and automated.",
                            highlights: [
                                { icon: "BarChart3", text: "Fee management" },
                                { icon: "Target", text: "Automation" }
                            ]
                        },
                        {
                            icon: "TrendingUp",
                            title: "Marketing & Growth Tools",
                            description: "WhatsApp automation, templates, reports, and analytics to help schools grow without guesswork.",
                            highlights: [
                                { icon: "Megaphone", text: "WhatsApp tools" },
                                { icon: "BarChart3", text: "Analytics" }
                            ]
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 3
            },
            update: {
                content: JSON.stringify({
                    headline: "Not Just an ERP. <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>A Complete School Operating System.</span>",
                    features: [
                        {
                            icon: "UserCheck",
                            title: "Admissions & Lead Intelligence",
                            description: "Track inquiries, automate follow-ups, manage school tours, and convert leads faster with AI-powered pipelines.",
                            highlights: [
                                { icon: "Target", text: "Lead tracking" },
                                { icon: "Zap", text: "Auto follow-ups" }
                            ]
                        },
                        {
                            icon: "BookOpen",
                            title: "Integrated Preschool Curriculum",
                            description: "Ready-to-use curriculum, lesson plans, learning outcomes, and progress tracking — designed by educators.",
                            highlights: [
                                { icon: "FileText", text: "Lesson plans" },
                                { icon: "BarChart3", text: "Progress tracking" }
                            ]
                        },
                        {
                            icon: "GraduationCap",
                            title: "Staff & Induction Training Modules",
                            description: "Structured onboarding for teachers, nannies, drivers, and staff — ensuring consistent quality from day one.",
                            highlights: [
                                { icon: "Users", text: "Team onboarding" },
                                { icon: "Target", text: "Quality standards" }
                            ]
                        },
                        {
                            icon: "MessageSquare",
                            title: "Parent Communication That Builds Trust",
                            description: "Attendance, diary updates, announcements, progress reports, and instant communication through a beautiful parent app.",
                            highlights: [
                                { icon: "Zap", text: "Instant updates" },
                                { icon: "FileText", text: "Digital diary" }
                            ]
                        },
                        {
                            icon: "DollarSign",
                            title: "Billing, Attendance & Operations",
                            description: "Fees, attendance, classes, timetable, inventory, transport, and documents — fully connected and automated.",
                            highlights: [
                                { icon: "BarChart3", text: "Fee management" },
                                { icon: "Target", text: "Automation" }
                            ]
                        },
                        {
                            icon: "TrendingUp",
                            title: "Marketing & Growth Tools",
                            description: "WhatsApp automation, templates, reports, and analytics to help schools grow without guesswork.",
                            highlights: [
                                { icon: "Megaphone", text: "WhatsApp tools" },
                                { icon: "BarChart3", text: "Analytics" }
                            ]
                        }
                    ]
                })
            }
        });

        // 4. Personas Section (Who Is It For)
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'personas' },
            create: {
                sectionKey: 'personas',
                title: 'Who Is It For',
                subtitle: 'Target audiences',
                content: JSON.stringify({
                    headline: "Designed for <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>Every School Builder</span>",
                    audiences: [
                        {
                            icon: "Sparkles",
                            title: "New Preschool Founders",
                            description: "Starting a Preschool? Bodhi Board guides you step-by-step — from admissions setup to curriculum delivery and parent communication.",
                            benefits: [
                                { icon: "Rocket", text: "Quick setup" },
                                { icon: "Award", text: "Proven curriculum" }
                            ]
                        },
                        {
                            icon: "Building2",
                            title: "Existing Schools",
                            description: "Already Running a School? Replace manual work with intelligent systems and gain complete operational visibility.",
                            benefits: [
                                { icon: "TrendingUp", text: "Automation" },
                                { icon: "Users", text: "Visibility" }
                            ]
                        },
                        {
                            icon: "Network",
                            title: "School Chains & Franchises",
                            description: "Managing Multiple Branches? Central control, standardized curriculum, and consistent processes across locations.",
                            benefits: [
                                { icon: "Network", text: "Multi-branch" },
                                { icon: "Award", text: "Standardized" }
                            ]
                        },
                        {
                            icon: "Heart",
                            title: "Educator-Led Institutions",
                            description: "Education Comes First? Built by educators, not just developers — pedagogy-driven and human-centric.",
                            benefits: [
                                { icon: "Heart", text: "Pedagogy-first" },
                                { icon: "Users", text: "Human-centric" }
                            ]
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 4
            },
            update: {
                content: JSON.stringify({
                    headline: "Designed for <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>Every School Builder</span>",
                    audiences: [
                        {
                            icon: "Sparkles",
                            title: "New Preschool Founders",
                            description: "Starting a Preschool? Bodhi Board guides you step-by-step — from admissions setup to curriculum delivery and parent communication.",
                            benefits: [
                                { icon: "Rocket", text: "Quick setup" },
                                { icon: "Award", text: "Proven curriculum" }
                            ]
                        },
                        {
                            icon: "Building2",
                            title: "Existing Schools",
                            description: "Already Running a School? Replace manual work with intelligent systems and gain complete operational visibility.",
                            benefits: [
                                { icon: "TrendingUp", text: "Automation" },
                                { icon: "Users", text: "Visibility" }
                            ]
                        },
                        {
                            icon: "Network",
                            title: "School Chains & Franchises",
                            description: "Managing Multiple Branches? Central control, standardized curriculum, and consistent processes across locations.",
                            benefits: [
                                { icon: "Network", text: "Multi-branch" },
                                { icon: "Award", text: "Standardized" }
                            ]
                        },
                        {
                            icon: "Heart",
                            title: "Educator-Led Institutions",
                            description: "Education Comes First? Built by educators, not just developers — pedagogy-driven and human-centric.",
                            benefits: [
                                { icon: "Heart", text: "Pedagogy-first" },
                                { icon: "Users", text: "Human-centric" }
                            ]
                        }
                    ]
                })
            }
        });

        // 5. Apps/Product Ecosystem Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'apps' },
            create: {
                sectionKey: 'apps',
                title: 'Product Ecosystem',
                subtitle: 'Multiple connected experiences',
                content: JSON.stringify({
                    headline: "One Platform. <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>Multiple Experiences.</span>",
                    platforms: [
                        {
                            icon: "Monitor",
                            title: "School Web Dashboard",
                            description: "Admin, admissions, reports, billing, staff, and operations",
                            bgColor: "bg-teal-50",
                            features: ["📊 Analytics", "⚙️ Settings"]
                        },
                        {
                            icon: "Users",
                            title: "Teacher & Staff App",
                            description: "Attendance, diary, class updates, tasks, and communication",
                            bgColor: "bg-slate-50",
                            features: ["✅ Attendance", "📝 Daily diary"]
                        },
                        {
                            icon: "Smartphone",
                            title: "Parent App",
                            description: "Daily updates, attendance, progress, announcements, and trust",
                            bgColor: "bg-teal-50",
                            features: ["📱 Mobile-first", "🔔 Real-time"]
                        },
                        {
                            icon: "Truck",
                            title: "Driver App",
                            description: "Routes, attendance, communication, and accountability",
                            bgColor: "bg-slate-50",
                            features: ["🗺️ GPS tracking", "✓ Check-ins"]
                        }
                    ]
                }),
                isEnabled: true,
                sortOrder: 5
            },
            update: {
                content: JSON.stringify({
                    headline: "One Platform. <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>Multiple Experiences.</span>",
                    platforms: [
                        {
                            icon: "Monitor",
                            title: "School Web Dashboard",
                            description: "Admin, admissions, reports, billing, staff, and operations",
                            bgColor: "bg-teal-50",
                            features: ["📊 Analytics", "⚙️ Settings"]
                        },
                        {
                            icon: "Users",
                            title: "Teacher & Staff App",
                            description: "Attendance, diary, class updates, tasks, and communication",
                            bgColor: "bg-slate-50",
                            features: ["✅ Attendance", "📝 Daily diary"]
                        },
                        {
                            icon: "Smartphone",
                            title: "Parent App",
                            description: "Daily updates, attendance, progress, announcements, and trust",
                            bgColor: "bg-teal-50",
                            features: ["📱 Mobile-first", "🔔 Real-time"]
                        },
                        {
                            icon: "Truck",
                            title: "Driver App",
                            description: "Routes, attendance, communication, and accountability",
                            bgColor: "bg-slate-50",
                            features: ["🗺️ GPS tracking", "✓ Check-ins"]
                        }
                    ]
                })
            }
        });

        // 6. Pricing Header
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'pricingHeader' },
            create: {
                sectionKey: 'pricingHeader',
                title: 'Pricing Header',
                subtitle: 'Pricing section introduction',
                content: JSON.stringify({
                    headline: "Simple, Honest Pricing <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>That Grows With Your School</span>",
                    subheadline: "No hidden fees. No long-term lock-ins. Just value."
                }),
                isEnabled: true,
                sortOrder: 6
            },
            update: {
                content: JSON.stringify({
                    headline: "Simple, Honest Pricing <span class='bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent'>That Grows With Your School</span>",
                    subheadline: "No hidden fees. No long-term lock-ins. Just value."
                })
            }
        });

        // 7. Team Section (Built By Educators)
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'team' },
            create: {
                sectionKey: 'team',
                title: 'Team Section',
                subtitle: 'About the founders',
                content: JSON.stringify({
                    headline: "Built by People <span class='bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent'>Who Run Schools</span>",
                    quote: "Bodhi Board is powered by the real-world experience of Little Chanakyas, a successful preschool brand with proven curriculum, trained staff, and happy parents.",
                    tagline: "This platform is shaped by classrooms, not boardrooms.",
                    credentials: [
                        { icon: "Award", text: "Founded by educators" },
                        { icon: "Target", text: "Proven curriculum" },
                        { icon: "Trophy", text: "Industry recognized" },
                        { icon: "CheckCircle2", text: "Parent-approved" }
                    ],
                    trustStats: [
                        { icon: "Users", value: "50+", label: "Schools" },
                        { icon: "BookOpen", value: "10+", label: "Years Experience" },
                        { icon: "Heart", value: "100%", label: "Educator-Led" }
                    ]
                }),
                isEnabled: true,
                sortOrder: 7
            },
            update: {
                content: JSON.stringify({
                    headline: "Built by People <span class='bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-500 bg-clip-text text-transparent'>Who Run Schools</span>",
                    quote: "Bodhi Board is powered by the real-world experience of Little Chanakyas, a successful preschool brand with proven curriculum, trained staff, and happy parents.",
                    tagline: "This platform is shaped by classrooms, not boardrooms.",
                    credentials: [
                        { icon: "Award", text: "Founded by educators" },
                        { icon: "Target", text: "Proven curriculum" },
                        { icon: "Trophy", text: "Industry recognized" },
                        { icon: "CheckCircle2", text: "Parent-approved" }
                    ],
                    trustStats: [
                        { icon: "Users", value: "50+", label: "Schools" },
                        { icon: "BookOpen", value: "10+", label: "Years Experience" },
                        { icon: "Heart", value: "100%", label: "Educator-Led" }
                    ]
                })
            }
        });

        // 8. Final CTA Section
        await prisma.homepageContent.upsert({
            where: { sectionKey: 'cta' },
            create: {
                sectionKey: 'cta',
                title: 'Final CTA',
                subtitle: 'Bottom call-to-action',
                content: JSON.stringify({
                    badge: "Join 50+ Schools Already Growing with Bodhi Board",
                    headline: "Ready to Build a Better School?",
                    subheadline: "Whether you're opening your first preschool or scaling an institution, Bodhi Board is your long-term education partner.",
                    primaryCTA: { text: "Start Free 30-Day Trial", link: "/signup" },
                    secondaryCTA: { text: "Book a Free Consultation", link: "#" },
                    guarantees: [
                        { icon: "Shield", text: "Secure & Reliable" },
                        { icon: "Award", text: "Award-Winning Platform" },
                        { icon: "Zap", text: "Lightning Fast Setup" },
                        { icon: "CheckCircle2", text: "No Lock-in Contract" }
                    ]
                }),
                isEnabled: true,
                sortOrder: 8
            },
            update: {
                content: JSON.stringify({
                    badge: "Join 50+ Schools Already Growing with Bodhi Board",
                    headline: "Ready to Build a Better School?",
                    subheadline: "Whether you're opening your first preschool or scaling an institution, Bodhi Board is your long-term education partner.",
                    primaryCTA: { text: "Start Free 30-Day Trial", link: "/signup" },
                    secondaryCTA: { text: "Book a Free Consultation", link: "#" },
                    guarantees: [
                        { icon: "Shield", text: "Secure & Reliable" },
                        { icon: "Award", text: "Award-Winning Platform" },
                        { icon: "Zap", text: "Lightning Fast Setup" },
                        { icon: "CheckCircle2", text: "No Lock-in Contract" }
                    ]
                })
            }
        });

        console.log('✅ Homepage seeded successfully with Figma design!');
    } catch (error) {
        console.error('❌ Error seeding homepage:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedHomepage()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
