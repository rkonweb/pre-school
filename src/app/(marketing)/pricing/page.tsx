import { Fragment } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { getPricingPageContentAction } from "@/app/actions/cms-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import { CheckCircle2, HelpCircle, ArrowRight, X } from "lucide-react";
import { Metadata } from "next";
import PricingViews from "./pricing-views";

interface PricingSection {
    sectionKey: string;
    content: string;
    isEnabled: boolean;
}

export async function generateMetadata(): Promise<Metadata> {
    const sections = await getPricingPageContentAction();
    const seoSection = sections.find((s: any) => s.sectionKey === "seo");

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

export default async function PricingPage() {
    const plansPromise = getSubscriptionPlansAction();
    const sectionsPromise = getPricingPageContentAction();

    const [plans, allSections] = await Promise.all([plansPromise, sectionsPromise]);
    const sections = (allSections as PricingSection[]); // Cast if needed, or rely on type

    // const [loading, setLoading] = useState(true); // Removed logic

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: PricingSection | undefined) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    // Default Fallbacks
    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        headline: "Simple pricing, <br/><span class='text-teal'>transparent value</span>.",
        description: "Everything you need to run a modern educational institution. No hidden fees. Cancel anytime.",
        badge: "Simple Pricing",
    };

    const faqSection = getSection("faq");
    const faqContent = parseContent(faqSection) || {
        title: "Questions? We have answers.",
        questions: [
            { "q": "Can I upgrade my plan later?", "a": "Yes, you can upgrade specific modules or your entire plan tier at any time from your admin dashboard." },
            { "q": "Do you offer a free trial?", "a": "Absolutely! We offer a 14-day full access trial for the Professional plan, no credit card required." },
            { "q": "What about data security?", "a": "We use enterprise-grade encryption and daily backups to ensure your school's data is always safe and recoverable." },
            { "q": "Is training included?", "a": "Yes, all paid plans come with a dedicated onboarding session and access to our video training library." }
        ]
    };

    const comparisonSection = getSection("comparison");
    const comparisonContent = parseContent(comparisonSection) || { showTable: true, title: "Compare features", description: "Detailed breakdown of what's included." };

    // Loading removed

    return (
        <div className="bg-slate-50 font-sans text-navy selection:bg-sky/30">
            {/* Hero Section - Gradient Background */}
            {/* Hero & Pricing Cards (Client Interactive) */}
            <PricingViews plans={plans} heroContent={heroContent} />

            {/* Feature Comparison Table */}
            {(!comparisonSection || comparisonSection.isEnabled) && comparisonContent.showTable && (
                <section className="container mx-auto px-4 pb-32">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-navy mb-4 tracking-tight">{comparisonContent.title}</h2>
                            <p className="text-navy/40 font-bold uppercase tracking-widest text-sm">Find the perfect fit for your institution.</p>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-teal/5">
                                            <th className="p-8 w-1/2 text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">Module Breakdown</th>
                                            {plans.map(plan => (
                                                <th key={plan.id} className="p-8 text-center bg-white/50">
                                                    <div className="text-xs font-black text-navy uppercase tracking-widest">{plan.name}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(Object.keys(MODULE_CATEGORIES) as Array<keyof typeof MODULE_CATEGORIES>).map((catKey) => {
                                            const categoryModules = ALL_MODULES.filter(m => m.category === catKey);
                                            if (categoryModules.length === 0) return null;

                                            return (
                                                <Fragment key={catKey}>
                                                    <tr>
                                                        <td colSpan={plans.length + 1} className="px-6 py-3 bg-slate-50/30">
                                                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                                                                {MODULE_CATEGORIES[catKey]}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {categoryModules.map(mod => (
                                                        <tr key={mod.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-8">
                                                                <div className="font-black text-navy text-sm tracking-tight">{mod.label}</div>
                                                                <div className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-1">{mod.description}</div>
                                                            </td>
                                                            {plans.map(plan => {
                                                                const isIncluded = (plan.includedModules || []).includes(mod.id);
                                                                return (
                                                                    <td key={plan.id} className="p-8 text-center">
                                                                        {isIncluded ? (
                                                                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-teal/10 text-teal">
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="inline-flex items-center justify-center p-1 rounded-full">
                                                                                <X className="h-4 w-4 text-navy/10" />
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ with cleaner styling */}
            {(!faqSection || faqSection.isEnabled) && (
                <section className="py-24 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex h-12 w-12 rounded-2xl bg-slate-100 items-center justify-center mb-6">
                                <HelpCircle className="h-6 w-6 text-slate-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900">{faqContent.title}</h2>
                        </div>

                        <div className="grid gap-6">
                            {(faqContent.questions || []).map((faq: any, i: number) => (
                                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <h3 className="font-bold text-lg text-slate-900 mb-3">
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-40 bg-navy text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[200px] opacity-20 pointer-events-none" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">Ready to get started?</h2>
                    <p className="text-xl md:text-2xl text-teal mb-16 font-bold uppercase tracking-[0.2em]">Join thousands of educators transforming their schools today.</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/signup" className="h-20 px-12 bg-orange text-white rounded-full font-black text-2xl hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3">
                            Start Free Trial
                            <ArrowRight className="h-7 w-7" />
                        </Link>
                        <Link href="/demo" className="h-20 px-12 bg-white/5 border border-white/10 text-white rounded-full font-black text-2xl hover:bg-white/10 transition-all flex items-center">
                            Book a Demo
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
