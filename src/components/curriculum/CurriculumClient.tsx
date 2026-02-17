"use client";

import { motion } from "motion/react";
import {
    BookOpen,
    Users,
    Target,
    CheckCircle2,
    Award,
    Globe,
    Lightbulb,
    Heart,
    Activity,
    Palette,
    MessageSquare,
    Calculator,
    Hand,
    Sparkles,
    GraduationCap,
    UserCheck,
    Baby,
    Bus,
    Briefcase,
    ClipboardList,
    School,
    TrendingUp,
    Shield,
    ArrowRight,
    Phone,
    Building2,
    Network,
    Star,
    Zap,
    Eye,
    FileText,
    Settings,
    BookMarked,
    Layers,
    RefreshCw,
    Lock,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CurriculumClient() {
    const router = useRouter();

    const curriculumDifferentiators = [
        {
            icon: Target,
            title: "Clear Learning Objectives",
            description: "Every lesson has age-appropriate learning goals mapped to developmental milestones."
        },
        {
            icon: BookOpen,
            title: "Daily / Weekly Lesson Planning",
            description: "Complete lesson plans ready to use — no more Sunday night scrambling."
        },
        {
            icon: Activity,
            title: "Activity-Based, Play-Led Approach",
            description: "Children learn through exploration, not rote memorization."
        },
        {
            icon: Heart,
            title: "Emotional & Social Development",
            description: "Building confident, empathetic, and socially aware children."
        },
        {
            icon: Eye,
            title: "Continuous Observation & Tracking",
            description: "Document progress, identify patterns, and share meaningful reports with parents."
        }
    ];

    const learningAreas = [
        {
            icon: MessageSquare,
            title: "Language & Communication",
            description: "Vocabulary building, listening skills, expression, and early literacy."
        },
        {
            icon: Calculator,
            title: "Early Numeracy",
            description: "Number recognition, counting, shapes, patterns, and logical thinking."
        },
        {
            icon: Hand,
            title: "Motor Skill Development",
            description: "Fine and gross motor activities for physical coordination and confidence."
        },
        {
            icon: Sparkles,
            title: "Sensory Learning",
            description: "Hands-on exploration through touch, sight, sound, taste, and smell."
        },
        {
            icon: Heart,
            title: "Social & Emotional Growth",
            description: "Building empathy, sharing, self-regulation, and emotional awareness."
        },
        {
            icon: Palette,
            title: "Creative Exploration",
            description: "Art, music, storytelling, and imaginative play for cognitive flexibility."
        }
    ];

    const trainingRoles = [
        {
            icon: Briefcase,
            role: "Owner / Management Induction",
            gradient: "from-teal-500 to-cyan-600",
            modules: [
                "Vision & culture alignment",
                "Academic oversight & quality control",
                "Admissions & parent engagement",
                "Staff leadership & team building",
                "SOP-driven operations management"
            ]
        },
        {
            icon: GraduationCap,
            role: "Teacher Training",
            gradient: "from-cyan-500 to-teal-600",
            modules: [
                "Deep curriculum understanding",
                "Classroom execution & time management",
                "Child psychology & learning styles",
                "Observation techniques & reporting",
                "Parent communication & collaboration"
            ]
        },
        {
            icon: Baby,
            role: "Nanny / Caregiver Training",
            gradient: "from-teal-600 to-cyan-500",
            modules: [
                "Child safety & hygiene protocols",
                "Emotional sensitivity & comfort",
                "Classroom support & routine handling",
                "Emergency response procedures",
                "Communication with teachers & parents"
            ]
        },
        {
            icon: Bus,
            role: "Driver Training",
            gradient: "from-cyan-600 to-teal-500",
            modules: [
                "Child safety & transportation protocols",
                "Pick-up & drop-off discipline",
                "Emergency handling & first response",
                "Professional conduct & communication",
                "Vehicle safety & daily checks"
            ]
        },
        {
            icon: UserCheck,
            role: "Admin & Office Staff Training",
            gradient: "from-teal-500 to-cyan-600",
            modules: [
                "Admissions workflows & lead management",
                "Fee collection & payment handling",
                "Communication etiquette & professionalism",
                "ERP system best practices",
                "Parent interaction & relationship building"
            ]
        }
    ];

    const sopCategories = [
        { icon: Users, title: "Admissions SOPs", description: "Inquiry to enrollment journey" },
        { icon: School, title: "Classroom Routines", description: "Daily schedules & transitions" },
        { icon: MessageSquare, title: "Parent Communication", description: "Update standards & protocols" },
        { icon: ClipboardList, title: "Staff Responsibilities", description: "Role clarity & accountability" },
        { icon: Shield, title: "Safety & Compliance", description: "Emergency & regulatory processes" }
    ];

    const targetAudience = [
        {
            icon: Sparkles,
            title: "New Preschool Founders",
            description: "Launch with expert curriculum and training from day one.",
            benefit: "Start strong with proven frameworks"
        },
        {
            icon: TrendingUp,
            title: "Existing Schools Upgrading Quality",
            description: "Replace ad-hoc approaches with structured systems.",
            benefit: "Elevate teaching quality instantly"
        },
        {
            icon: Network,
            title: "School Chains & Franchises",
            description: "Maintain consistent quality across all locations.",
            benefit: "Standardize excellence at scale"
        },
        {
            icon: Award,
            title: "Educator-Led Institutions",
            description: "Built by educators who understand what schools truly need.",
            benefit: "Designed for your success"
        }
    ];

    const outcomes = [
        {
            icon: Award,
            title: "Consistent Teaching Quality",
            description: "Every teacher delivers the same high standard, regardless of experience level."
        },
        {
            icon: Zap,
            title: "Faster Onboarding",
            description: "New staff members are productive within days, not months."
        },
        {
            icon: Users,
            title: "Reduced Dependency on Individuals",
            description: "Your school isn't dependent on one 'star teacher' — systems carry quality."
        },
        {
            icon: Heart,
            title: "Higher Parent Trust",
            description: "Parents see structure, professionalism, and consistent child progress."
        },
        {
            icon: Building2,
            title: "Stronger School Culture",
            description: "Shared training creates unified vision, language, and expectations."
        },
        {
            icon: TrendingUp,
            title: "Scalable Growth",
            description: "Open new branches or expand enrollment without compromising quality."
        }
    ];

    return (
        <div className="bg-white pt-[100px]">
            {/* SECTION 1 — PAGE HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/20 py-20 md:py-32">
                {/* Decorative background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-5xl mx-auto text-center space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-block">
                            <div className="px-4 py-2 bg-teal-100 border-2 border-teal-400 rounded-full">
                                <span className="text-sm font-bold text-teal-800">Expert-Designed • Research-Backed</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                            Curriculum & Training
                        </h1>

                        <p className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            The Foundation of a Great School
                        </p>

                        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto">
                            Well-defined curriculum, well-trained people, and well-established systems — all in one platform.
                        </p>

                        <motion.div
                            className="pt-6"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 px-10 py-7 text-lg font-bold rounded-full shadow-2xl shadow-teal-500/30"
                            >
                                Explore Curriculum & Training
                                <ChevronRight className="h-6 w-6 ml-2" />
                            </Button>
                        </motion.div>

                        {/* Hero Visual - Abstract Academic Connection */}
                        <motion.div
                            className="pt-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <div className="relative max-w-4xl mx-auto h-64">
                                {/* Central Node */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl">
                                        <BookOpen className="h-10 w-10 text-white" />
                                    </div>
                                </div>

                                {/* Connected Nodes */}
                                {[
                                    { icon: GraduationCap, label: "Teachers", position: "top-0 left-1/4", delay: 0.4 },
                                    { icon: Baby, label: "Children", position: "top-0 right-1/4", delay: 0.5 },
                                    { icon: Settings, label: "Systems", position: "bottom-0 left-1/3", delay: 0.6 },
                                    { icon: Target, label: "Outcomes", position: "bottom-0 right-1/3", delay: 0.7 }
                                ].map((node) => {
                                    const Icon = node.icon;
                                    return (
                                        <motion.div
                                            key={node.label}
                                            className={`absolute ${node.position}`}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, delay: node.delay }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="h-16 w-16 rounded-xl bg-white border-2 border-teal-200 flex items-center justify-center shadow-lg mb-2">
                                                    <Icon className="h-7 w-7 text-teal-600" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{node.label}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Connection Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                    <line x1="50%" y1="50%" x2="25%" y2="15%" stroke="#14B8A6" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="75%" y2="15%" stroke="#14B8A6" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="33%" y2="85%" stroke="#14B8A6" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="67%" y2="85%" stroke="#14B8A6" strokeWidth="2" />
                                </svg>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2 — CURRICULUM BY EXPERT EDUCATIONISTS */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                                Designed by Education Experts.{" "}
                                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                    Refined in Real Classrooms.
                                </span>
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {[
                                {
                                    icon: Award,
                                    title: "Designed with Expert Educationists",
                                    description: "Curriculum developed by experienced early childhood education specialists with decades of classroom and leadership experience."
                                },
                                {
                                    icon: Globe,
                                    title: "UK Education Collaboration",
                                    description: "Informed by collaboration with UK education professionals, bringing global best practices to Indian classrooms."
                                },
                                {
                                    icon: GraduationCap,
                                    title: "Oxford-Level Pedagogical Exposure",
                                    description: "Built on research-backed pedagogical frameworks with Oxford pedagogy exposure, adapted for Indian context."
                                },
                                {
                                    icon: Lightbulb,
                                    title: "Research-Driven & Developmentally Appropriate",
                                    description: "Every learning milestone is aligned with child development research and age-appropriate expectations."
                                }
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        className="flex gap-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="h-14 w-14 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-7 w-7 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{item.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Prestige Banner */}
                        <motion.div
                            className="bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 rounded-2xl p-8 border-2 border-teal-200"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Globe className="h-8 w-8 text-teal-600" />
                                <p className="text-xl font-bold text-slate-800 text-center">
                                    Global Research → UK Pedagogy → Indian Classroom Reality
                                </p>
                                <ArrowRight className="h-6 w-6 text-teal-600" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 3 — WHAT MAKES THE CURRICULUM DIFFERENT */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Not Just What to Teach —{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                But How to Teach
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Classroom-ready, not theoretical. Built for teachers to execute with confidence.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                        {curriculumDifferentiators.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.title}
                                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-amber-50 border-2 border-amber-300 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-amber-600" />
                            <span className="text-lg font-bold text-amber-900">Classroom-ready, not theoretical</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 4 — PRESCHOOL CURRICULUM (DAY-ONE READY) */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Built for{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Early Childhood Excellence
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Comprehensive learning areas covering every dimension of child development.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                        {learningAreas.map((area, index) => {
                            const Icon = area.icon;
                            return (
                                <motion.div
                                    key={area.title}
                                    className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all group"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{area.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{area.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-6 max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-start gap-4">
                            <BookMarked className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                            <p className="text-lg text-slate-800">
                                <span className="font-bold">Every module includes:</span> Teacher guidance, activity sheets, learning materials, and expected developmental outcomes — ready to use from day one.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 5 — STRUCTURED INDUCTION & TRAINING PROGRAMS */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Because{" "}
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                People Build Schools
                            </span>
                        </h2>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Great curriculum means nothing without great people to deliver it. Structured training ensures every team member — from owner to driver — understands their role and delivers consistent quality.
                        </p>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Training isn't a one-time event. It's the foundation of your school's culture, consistency, and capacity to scale.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 6 — ROLE-BASED TRAINING MODULES */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Role-Based{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Training Programs
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Every role has unique training — because everyone contributes to the child's experience.
                        </p>
                    </motion.div>

                    <div className="space-y-12 max-w-6xl mx-auto">
                        {trainingRoles.map((training, index) => {
                            const Icon = training.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={training.role}
                                    className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-10 shadow-xl border-2 border-slate-200"
                                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                                        <div className="lg:col-span-1">
                                            <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${training.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                                                <Icon className="h-10 w-10 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900">{training.role}</h3>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <div className="space-y-3">
                                                {training.modules.map((module, mIndex) => (
                                                    <div key={mIndex} className="flex items-start gap-3">
                                                        <CheckCircle2 className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-lg text-slate-700">{module}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SECTION 7 — SOPs (STANDARD OPERATING PROCEDURES) */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-teal-50/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Consistency Is the{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Secret to Scale
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            SOPs aren't PDFs in a folder. They're built into your daily workflows — living, accessible, and always followed.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                        {sopCategories.map((sop, index) => {
                            const Icon = sop.icon;
                            return (
                                <motion.div
                                    key={sop.title}
                                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{sop.title}</h3>
                                    <p className="text-slate-600">{sop.description}</p>
                                </motion.div>
                            );
                        })}

                        {/* Additional SOPs to complete the grid */}
                        <motion.div
                            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Reporting Standards</h3>
                            <p className="text-slate-600">Progress tracking & parent updates</p>
                        </motion.div>
                    </div>

                    <motion.div
                        className="max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-300">
                            <div className="grid md:grid-cols-2 gap-8">
                                {[
                                    { icon: Layers, text: "Built into your workflows" },
                                    { icon: RefreshCw, text: "Easy to update & improve" },
                                    { icon: Lock, text: "Role-based access control" },
                                    { icon: CheckCircle2, text: "Compliance & audit-ready" }
                                ].map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.text} className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-white border-2 border-teal-300 flex items-center justify-center flex-shrink-0">
                                                <Icon className="h-6 w-6 text-teal-600" />
                                            </div>
                                            <span className="text-lg font-bold text-slate-800">{item.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 8 — FULLY INTEGRATED INSIDE BODHI BOARD */}
            <section className="py-20 md:py-28 bg-slate-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                A Living System —{" "}
                                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                    Not Static Documents
                                </span>
                            </h2>
                            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                                Curriculum, training, and SOPs aren't separate downloads. They're woven into the platform teachers use every day.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {[
                                {
                                    icon: Layers,
                                    title: "Integrated Into Daily Workflows",
                                    description: "Teachers access lesson plans, activities, and guidance right where they work — no switching between systems."
                                },
                                {
                                    icon: Users,
                                    title: "Role-Based Access",
                                    description: "Everyone sees exactly what they need — owner dashboards, teacher portals, caregiver checklists."
                                },
                                {
                                    icon: RefreshCw,
                                    title: "Easy Updates",
                                    description: "Curriculum and training evolve. Updates roll out instantly to all users — no re-training chaos."
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Continuous Learning Culture",
                                    description: "Training isn't a one-time event. Ongoing modules, refreshers, and new content keep teams sharp."
                                }
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={feature.title}
                                        className="bg-slate-800/50 backdrop-blur-sm border border-teal-400/20 rounded-2xl p-8 hover:border-teal-400/40 transition-all"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Visual Placeholder - Platform UI */}
                        <motion.div
                            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 flex items-center justify-center">
                                <div className="text-center">
                                    <BookOpen className="h-20 w-20 text-white opacity-40 mx-auto mb-4" />
                                    <p className="text-white/80 text-lg font-medium">Platform UI Preview</p>
                                    <p className="text-white/60 text-sm">Curriculum & Training Embedded in Workflows</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 9 — WHO THIS IS FOR */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            Built For{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Every School Journey
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {targetAudience.map((audience, index) => {
                            const Icon = audience.icon;
                            return (
                                <motion.div
                                    key={audience.title}
                                    className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg">
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{audience.title}</h3>
                                    <p className="text-slate-600 leading-relaxed mb-4">{audience.description}</p>
                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-sm font-bold text-teal-700 flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            {audience.benefit}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SECTION 10 — OUTCOMES & IMPACT */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-teal-50/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                            What Schools{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                Achieve
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Real outcomes when curriculum, training, and systems work together.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {outcomes.map((outcome, index) => {
                            const Icon = outcome.icon;
                            return (
                                <motion.div
                                    key={outcome.title}
                                    className="bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-200 hover:border-teal-300 hover:shadow-2xl transition-all"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{outcome.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{outcome.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SECTION 11 — FINAL CTA */}
            <section className="py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Build a School That Runs on{" "}
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                Knowledge — Not Guesswork
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl text-slate-300">
                            Expert curriculum. Trained people. Built-in systems. Everything you need to build a school that scales with quality.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => router.push("/signup")}
                                    size="lg"
                                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 px-12 py-8 text-xl font-bold rounded-full shadow-2xl shadow-amber-500/30"
                                >
                                    Start 30-Day Free Trial
                                    <ArrowRight className="h-6 w-6 ml-2" />
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-teal-400 bg-transparent text-teal-300 hover:bg-teal-400/10 px-12 py-8 text-xl font-bold rounded-full"
                                >
                                    <Phone className="h-6 w-6 mr-2" />
                                    Talk to Our Education Team
                                </Button>
                            </motion.div>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                            {[
                                "Expert-Designed Curriculum",
                                "Role-Based Training",
                                "Built-In SOPs"
                            ].map((item, index) => (
                                <motion.div
                                    key={item}
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                    <span className="text-slate-400">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
