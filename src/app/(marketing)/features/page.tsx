import { getFeaturesPageContentAction } from "@/app/actions/cms-actions";
import { Metadata } from "next";
import {
    Users, CreditCard, MessageCircle, Calendar, BookOpen,
    Bus, Utensils, BarChart3, Zap, CheckCircle2,
    ArrowRight, Star, ShieldCheck, Sparkles, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, any> = {
    Users, CreditCard, MessageCircle, Calendar, BookOpen,
    Bus, Utensils, BarChart3, Zap, Star
};

interface FeaturesSection {
    id: string;
    sectionKey: string;
    content: string;
    isEnabled: boolean;
}

export async function generateMetadata(): Promise<Metadata> {
    const sections = await getFeaturesPageContentAction();
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

export default async function FeaturesPage() {
    const allSections = await getFeaturesPageContentAction();
    const sections = allSections.filter(s => s.isEnabled);

    // const [loading, setLoading] = useState(true); // Removed for Server Component

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: FeaturesSection | undefined) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    // --- Content Definitions & "Selling" Copy ---

    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        badge: "Trusted by Modern Educators",
        headline: "Run your preschool like a <span class='text-teal'>Fortune 500</span> company.",
        description: "Stop drowning in paperwork. Start focusing on what matters: the children."
    };

    const featuresSection = getSection("features");
    // Refined "Selling" Copy - Short, Punchy, Benefit-driven
    const featuresContent = parseContent(featuresSection) || {
        features: [
            {
                icon: "Users",
                title: "Effortless Admissions",
                description: "Turn inquiries into enrollments 2x faster with our automated pipeline.",
                color: "bg-teal/10 text-teal border-teal/20"
            },
            {
                icon: "CreditCard",
                title: "Automated Revenue",
                description: "Collect fees on time, every time. Auto-invoicing and smart reminders.",
                color: "bg-orange/10 text-orange border-orange/20"
            },
            {
                icon: "MessageCircle",
                title: "Instant Trust",
                description: "Wow parents with real-time updates, photos, and dedicated messaging.",
                color: "bg-yellow/10 text-navy border-yellow/20"
            },
            {
                icon: "Calendar",
                title: "Zero-Error Attendance",
                description: "Geo-fenced check-ins ensure absolute safety and accurate records.",
                color: "bg-sky/10 text-teal border-sky/20"
            },
            {
                icon: "BookOpen",
                title: "World-Class Curriculum",
                description: "Plan lessons and track progress against international standards.",
                color: "bg-navy/5 text-navy border-navy/10"
            },
            {
                icon: "Bus",
                title: "Real-Time Safety",
                description: "Live bus tracking gives parents absolute peace of mind.",
                color: "bg-teal/5 text-teal border-teal/10"
            },
            {
                icon: "Utensils",
                title: "Healthy Dining",
                description: "Manage dietary needs and menus with allergy-aware controls.",
                color: "bg-orange/5 text-orange border-orange/10"
            },
            {
                icon: "BarChart3",
                title: "Data Superpowers",
                description: "Make smarter decisions with deep insights into growth and quality.",
                color: "bg-yellow/10 text-navy border-yellow/30"
            }
        ],
        ctaCard: {
            title: "Ready to transform your school?",
            description: "Join 500+ schools delivering excellence every day.",
            buttonText: "Start Free Trial",
            buttonLink: "/signup"
        }
    };


    // Loading removed

    return (
        <div className="bg-white font-sans text-slate-900">
            {/* Compact Punchy Hero */}
            <section className="pt-32 pb-16 text-center container mx-auto px-4 max-w-4xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky/20 rounded-full blur-3xl -z-10 opacity-30" />
                <div className="inline-flex items-center gap-2 bg-navy text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in-up shadow-xl">
                    <Sparkles className="h-3.5 w-3.5 text-yellow animate-pulse" />
                    {heroContent.badge}
                </div>
                <h1
                    className="text-4xl md:text-7xl font-black text-navy mb-8 tracking-tighter leading-[1.05] animate-fade-in-up delay-100"
                    dangerouslySetInnerHTML={{ __html: heroContent.headline }}
                />
                <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto animate-fade-in-up delay-200">
                    {heroContent.description}
                </p>
            </section>

            {/* Premium Card Grid */}
            <section className="pb-32 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {featuresContent.features.map((feature: any, index: number) => {
                        const IconComponent = ICON_MAP[feature.icon] || Zap;
                        // Default color fallback if not specified
                        const colorClass = feature.color || "bg-blue-50 text-blue-600 border-blue-100";

                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10">
                                    {/* Icon Container */}
                                    <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110 duration-300", colorClass)}>
                                        <IconComponent className="h-7 w-7" />
                                    </div>

                                    <h3 className="text-2xl font-black text-navy mb-3 group-hover:text-teal transition-colors tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-navy/50 font-bold leading-relaxed text-sm">
                                        {feature.description}
                                    </p>

                                    <div className="mt-8 flex items-center text-teal font-black text-xs uppercase tracking-widest opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        Learn More <ArrowRight className="h-4 w-4 ml-2" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Final Selling CTA */}
                <div className="mt-24 bg-navy rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden max-w-6xl mx-auto shadow-2xl shadow-navy/20">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal/20 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange/20 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter max-w-4xl mx-auto leading-tight">
                            {featuresContent.ctaCard.title}
                        </h2>
                        <a
                            href={featuresContent.ctaCard.buttonLink}
                            className="inline-flex h-20 px-12 bg-orange text-white rounded-full text-xl font-black hover:scale-105 hover:shadow-2xl hover:shadow-orange/30 transition-all items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            {featuresContent.ctaCard.buttonText}
                            <ArrowRight className="h-6 w-6" />
                        </a>
                        <div className="mt-10 flex justify-center gap-8 text-[10px] text-white/40 font-black uppercase tracking-[0.25em]">
                            <span>No credit card required</span>
                            <span className="h-1 w-1 rounded-full bg-yellow mt-1" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
