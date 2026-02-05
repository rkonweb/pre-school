
import { getContactPageContentAction } from "@/app/actions/cms-actions";
import { Mail, MapPin } from "lucide-react";
import ContactForm from "./contact-form";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const sections = await getContactPageContentAction();
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

export default async function ContactPage() {
    const sections = await getContactPageContentAction();

    const getSection = (key: string) => sections.find((s: any) => s.sectionKey === key);
    const parseContent = (section: any) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    const infoSection = getSection("info");
    const infoContent = parseContent(infoSection) || {
        title: "Let's start a conversation.",
        description: "Whether you're a small daycare or a large school network, we're here to help you transform your operations.",
        headquarters: { title: "Visit Us", address: "123 Education Lane\nBangalore, IN 560001" },
        email: { title: "Email Us", addresses: ["hello@bodhiboard.com", "support@bodhiboard.com"] }
    };

    const formSection = getSection("form");
    const formContent = parseContent(formSection);

    const addresses = infoContent.email?.addresses || [];

    return (
        <div className="bg-white font-sans text-navy">
            <div className="grid lg:grid-cols-2 min-h-screen">

                {/* Left: Contact Info (Dark) */}
                <div className="bg-navy text-white p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                    {/* Abstract BG */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-block px-5 py-2 bg-white text-navy rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-xl">
                            Contact Us
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[1]">{infoContent.title}</h1>
                        <p className="text-xl md:text-2xl text-white/40 font-bold uppercase tracking-widest max-w-lg mb-12">
                            {infoContent.description}
                        </p>

                        <div className="space-y-10">
                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-teal group-hover:border-teal transition-all duration-300">
                                    <Mail className="h-8 w-8 text-teal group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl mb-1 tracking-tight">{infoContent.email?.title || "Email Us"}</h3>
                                    {addresses.map((addr: string, i: number) => (
                                        <p key={i} className="text-white/40 font-bold">{addr}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange group-hover:border-orange transition-all duration-300">
                                    <MapPin className="h-8 w-8 text-orange group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl mb-1 tracking-tight">{infoContent.headquarters?.title || "Visit Us"}</h3>
                                    <p className="text-white/40 font-bold whitespace-pre-line">{infoContent.headquarters?.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-20 lg:mt-0">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">
                            © {new Date().getFullYear()} Bodhi Board. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="bg-white p-12 lg:p-24 flex items-center justify-center">
                    <ContactForm formContent={formContent} />
                </div>
            </div>
        </div>
    );
}
