import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { getHomepageContentAction } from "@/app/actions/cms-actions";
import { Metadata } from "next";
import { SubscriptionPlan } from "@/types/subscription";
import {
    CheckCircle2, Ticket, ShieldCheck, Zap, Crown,
    Users, CreditCard, Heart, ArrowRight,
    Play, Star, BarChart3, Lock, Smartphone, Globe,
    Mail, Calendar, FileText, Bell, Search, Menu, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

interface HomepageSection {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string;
    isEnabled: boolean;
    sortOrder: number;
}

export async function generateMetadata(): Promise<Metadata> {
    const sections = await getHomepageContentAction();
    const seoSection = sections.find(s => s.sectionKey === "seo");

    if (seoSection) {
        try {
            const data = JSON.parse(seoSection.content);
            return {
                title: data.metaTitle,
                description: data.metaDescription,
                openGraph: {
                    images: data.ogImage ? [{ url: data.ogImage }] : []
                }
            };
        } catch (e) { console.error("SEO Parse Error", e); }
    }
    return {};
}

export default async function Home() {
    const plansPromise = getSubscriptionPlansAction();
    const sectionsPromise = getHomepageContentAction();

    const [allPlans, allSections] = await Promise.all([plansPromise, sectionsPromise]);

    const plans = allPlans.slice(0, 3);
    const sections = allSections.filter(s => s.isEnabled);

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: HomepageSection | undefined) => {
        if (!section) return null;
        try {
            return JSON.parse(section.content);
        } catch {
            return null;
        }
    };

    // Default content if CMS is not configured
    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        badge: "Trusted by 500+ Schools",
        headline: "The Operating System for <span class='text-teal'>Modern</span> Preschools.",
        subheadline: "Streamline admissions, automate billing, and delight parents with a platform built for the future of education.",
        primaryCTA: { text: "Start Free Trial", link: "/signup" },
        secondaryCTA: { text: "Watch Demo", link: "/demo" },
        socialProof: { rating: 4.9, text: "average rating" },
        headerImage: "/images/teacher-hero.png"
    };

    const featuresSection = getSection("features");
    const featuresContent = parseContent(featuresSection) || {
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
                description: "Track inquiries, tours, and enrollments. Digital text forms that write directly to your database.",
                icon: "BarChart3",
                type: "admissions"
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
    };

    const ctaSection = getSection("cta");
    const ctaContent = parseContent(ctaSection) || {
        buttonText: "Get Started Now",
        buttonLink: "/signup",
        features: ["14-day free trial", "No credit card required", "Cancel anytime"]
    };

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = { CreditCard, Smartphone, BarChart3, Heart, Lock, Globe, Users };
        return icons[iconName] || Star;
    };

    // Skeleton Visuals for Bento Grid
    const SkeletonBilling = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-sky/10 to-teal/5 p-4 flex-col gap-2 border border-teal/10">
            <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-navy/10 rounded" />
                <div className="h-4 w-8 bg-orange/20 rounded" />
            </div>
            <div className="h-2 w-full bg-teal/5 rounded mt-2" />
            <div className="h-2 w-2/3 bg-teal/5 rounded" />
            <div className="mt-auto flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                <div className="h-6 w-6 rounded-full bg-teal/10" />
                <div className="h-3 w-12 bg-navy/10 rounded" />
            </div>
        </div>
    );

    const SkeletonPhone = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-teal/10 p-2 relative overflow-hidden shadow-inner bg-slate-50/50">
            <div className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-teal/5 flex items-center px-2 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal" />
            </div>
            <div className="mt-8 space-y-2">
                <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky/20" />
                    <div className="flex-1 bg-teal/5 p-2 rounded-r-lg rounded-bl-lg text-[8px] text-teal font-bold uppercase tracking-tight">
                        Mrs. Jones posted a new photo of Alex.
                    </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-teal" />
                    <div className="flex-1 bg-white p-2 border border-teal/5 rounded-l-lg rounded-br-lg text-[8px] text-navy/60 font-medium">
                        That looks great! Thanks for sharing.
                    </div>
                </div>
            </div>
        </div>
    );

    const SkeletonAdmissions = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white border border-teal/10 p-4 flex-col gap-2">
            <div className="text-[10px] uppercase font-black text-navy/40 tracking-widest mb-2">Pipeline Progress</div>
            <div className="flex gap-1.5 h-full items-end">
                <div className="w-full bg-sky/30 h-[40%] rounded-t-sm" />
                <div className="w-full bg-teal/40 h-[60%] rounded-t-sm" />
                <div className="w-full bg-teal/60 h-[80%] rounded-t-sm" />
                <div className="w-full bg-orange/40 h-[30%] rounded-t-sm" />
            </div>
        </div>
    );

    const SkeletonGeneric = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
            <div className="space-y-2 animate-pulse">
                <div className="h-2 w-1/2 bg-slate-200 rounded" />
                <div className="h-2 w-full bg-slate-200 rounded" />
                <div className="h-2 w-3/4 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded-full mt-4" />
            </div>
        </div>
    );


    return (
        <div className="isolate bg-white font-sans text-slate-900">
            {/* 1. HERO SECTION (Full Width Banner) */}
            {(!heroSection || heroSection.isEnabled) && (
                <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
                    {/* Background Image with Parallax-like feel */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-slow-zoom"
                        style={{ backgroundImage: `url('${heroContent.headerImage || '/images/teacher-hero.png'}')` }}
                    >
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-transparent"></div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 pt-20">
                        <div className="max-w-3xl">
                            {/* Animated Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl mb-8 animate-fade-in-up">
                                <Sparkles className="h-4 w-4 text-yellow animate-pulse" />
                                <span className="text-sm font-bold tracking-widest uppercase">{heroContent.badge}</span>
                            </div>

                            {/* Headline with Staggered Animation */}
                            <h1
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter mb-8 animate-fade-in-up delay-100 drop-shadow-xl"
                                dangerouslySetInnerHTML={{ __html: heroContent.headline }}
                            />

                            {/* Subheadline */}
                            <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed mb-12 max-w-2xl animate-fade-in-up delay-200 drop-shadow-md">
                                {heroContent.subheadline}
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-5 animate-fade-in-up delay-300">
                                <Link
                                    href={heroContent.primaryCTA.link}
                                    className="h-16 px-12 rounded-full bg-orange text-white font-black text-xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,136,0,0.4)] hover:bg-orange/90 hover:scale-105 transition-all duration-300 group"
                                >
                                    {heroContent.primaryCTA.text}
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={heroContent.secondaryCTA.link}
                                    className="h-16 px-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all duration-300"
                                >
                                    <Play className="h-5 w-5 fill-white" />
                                    {heroContent.secondaryCTA.text}
                                </Link>
                            </div>

                            {/* Trust Badge / Additional Social Proof */}
                            <div className="mt-16 flex items-center gap-4 animate-fade-in-up delay-500">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-10 w-10 rounded-full border-2 border-navy bg-slate-200 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-yellow text-yellow" />)}
                                    </div>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Trusted by 500+ Schools</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
                </section>
            )}

            {/* 2. SOCIAL PROOF */}
            <section className="py-12 border-y border-slate-100 bg-slate-50/50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">Trusted by forward-thinking educators</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {["BrightHorizons", "Montessori", "KinderCare", "Primrose", "Goddard"].map((logo) => (
                            <div key={logo} className="text-2xl font-black text-slate-800 tracking-tighter hover:text-blue-600 cursor-default transition-colors">{logo}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. BENTO GRID FEATURES */}
            {(!featuresSection || featuresSection.isEnabled) && (
                <section className="py-32 bg-slate-50/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                {featuresSection?.title || "Everything you need to run a world-class school."}
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                                {featuresSection?.subtitle || "Powerful features wrapped in a simple, elegant interface."}
                            </p>
                        </div>

                        <BentoGrid className="max-w-6xl mx-auto">
                            {featuresContent.features.map((item: any, i: number) => {
                                const isBilling = item.icon === "CreditCard" || item.type === "billing";
                                const isCommunication = item.icon === "Smartphone" || item.type === "communication";
                                const isAdmissions = item.icon === "BarChart3" || item.type === "admissions";

                                const IconComponent = getIconComponent(item.icon);

                                return (
                                    <BentoGridItem
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        header={
                                            isBilling ? <SkeletonBilling /> :
                                                isCommunication ? <SkeletonPhone /> :
                                                    isAdmissions ? <SkeletonAdmissions /> :
                                                        <SkeletonGeneric />
                                        }
                                        icon={<IconComponent className="h-6 w-6 text-teal group-hover:text-orange transition-colors" />}
                                        className={cn(i === 3 || i === 6 ? "md:col-span-2" : "", "group/bento hover:border-teal/30 transition-all")}
                                    />
                                );
                            })}
                        </BentoGrid>
                    </div>
                </section>
            )}

            {/* 4. PRICING */}
            <section id="pricing" className="py-32 bg-white border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Simple, transparent pricing.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">No hidden fees. No long-term contracts.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                        {plans.length === 0 ? (
                            [1, 2, 3].map(i => <div key={i} className="h-[500px] rounded-3xl bg-white border border-slate-200 animate-pulse" />)
                        ) : (
                            plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex flex-col rounded-[2rem] p-8 transition-all duration-500",
                                        plan.isPopular
                                            ? "bg-navy text-white shadow-2xl shadow-navy/20 border border-navy z-10 scale-105 md:-translate-y-4"
                                            : "bg-white border border-teal/10 hover:border-teal/30 hover:shadow-xl shadow-sm"
                                    )}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                            <Sparkles className="h-3 w-3 fill-white" /> Recommended
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className={cn("text-2xl font-black mb-2 tracking-tight", plan.isPopular ? "text-white" : "text-navy")}>{plan.name}</h3>
                                        <p className={cn("text-sm font-bold uppercase tracking-widest leading-relaxed", plan.isPopular ? "text-teal" : "text-navy/40")}>{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className={cn("text-5xl font-black tracking-tighter", plan.isPopular ? "text-white" : "text-navy")}>
                                                {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                            </span>
                                            {plan.price > 0 && <span className={cn("text-base font-black uppercase tracking-widest", plan.isPopular ? "text-teal/60" : "text-navy/20")}>/mo</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        <div className={cn("flex items-center gap-3 text-sm font-black uppercase tracking-widest", plan.isPopular ? "text-white" : "text-navy")}>
                                            <Users className={cn("h-5 w-5", plan.isPopular ? "text-teal" : "text-teal")} />
                                            <span>{plan.limits?.maxStudents} Students</span>
                                        </div>
                                        {plan.features.slice(0, 5).map((feature, idx) => (
                                            <div key={idx} className={cn("flex items-start gap-3 text-sm font-semibold", plan.isPopular ? "text-teal/70" : "text-navy/50")}>
                                                <CheckCircle2 className={cn("h-5 w-5 shrink-0", plan.isPopular ? "text-teal" : "text-teal")} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/signup"
                                        className={cn(
                                            "w-full h-14 rounded-2xl flex items-center justify-center font-black text-base transition-all duration-300 uppercase tracking-widest shadow-lg",
                                            plan.isPopular
                                                ? "bg-teal text-white hover:bg-teal/90 shadow-teal/20"
                                                : "bg-navy text-white hover:bg-navy/90 shadow-navy/10"
                                        )}
                                    >
                                        Select {plan.name}
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 5. BIG CTA */}
            {(!ctaSection || ctaSection.isEnabled) && (
                <section className="bg-navy py-40 overflow-hidden relative">
                    {/* Abstract BG */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[150px] opacity-20" />
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange rounded-full blur-[120px] opacity-10" />
                        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky rounded-full blur-[120px] opacity-10" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter max-w-5xl mx-auto leading-tight">
                            {ctaSection?.title || "Ready to transform your school?"}
                        </h2>
                        <p className="text-xl md:text-2xl text-teal mb-16 font-bold uppercase tracking-widest max-w-2xl mx-auto">
                            {ctaSection?.subtitle || "Join thousands of educators who trust Bodhi Board to run their schools efficiently."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                href={ctaContent.buttonLink}
                                className="h-20 px-12 bg-orange text-white rounded-full font-black text-2xl hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{ctaContent.buttonText}</span>
                                <ArrowRight className="h-7 w-7 relative z-10" />
                            </Link>
                        </div>

                        <div className="mt-20 flex flex-wrap justify-center gap-10 text-xs font-black text-white/40 uppercase tracking-[0.2em]">
                            {ctaContent.features.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-yellow shadow-[0_0_8px_rgba(252,193,26,0.5)]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
