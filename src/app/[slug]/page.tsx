import { SchoolLogin } from "@/components/figma/login/SchoolLogin";
import { Suspense } from "react";
import { getCMSPageBySlugAction } from "@/app/actions/cms-actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTenantsAction } from "@/app/actions/tenant-actions";

export const dynamic = 'force-dynamic';

interface SlugPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getCMSPageBySlugAction(slug);

    if (page) {
        return {
            title: page.metaTitle || page.title,
            description: page.metaDescription,
            openGraph: {
                images: page.ogImage ? [page.ogImage] : undefined
            }
        };
    }

    // Try finding tenant
    const tenants = await getTenantsAction();
    const tenant = tenants.find(t => t.subdomain === slug || t.customDomain === slug || t.id.toLowerCase() === slug.toLowerCase());

    if (tenant) {
        return { title: `Login | ${tenant.name}` };
    }

    return { title: 'Page Not Found' };
}

export default async function SlugPage({ params }: SlugPageProps) {
    const { slug } = await params;

    // 1. Check if it's a CMS Page (Terms, Privacy, etc.)
    const page = await getCMSPageBySlugAction(slug);

    if (page) {
        return (
            <div className="bg-white min-h-screen font-sans text-navy">
                <div className="container mx-auto px-4 py-20 pt-40 max-w-4xl">
                    <h1 className="text-5xl md:text-8xl font-black text-navy mb-12 tracking-tighter uppercase leading-[1]">
                        {page.title}
                    </h1>

                    <article className="prose prose-xl prose-slate max-w-none prose-p:text-navy/60 prose-headings:text-navy prose-headings:font-black prose-a:text-teal">
                        <div dangerouslySetInnerHTML={{ __html: page.content }} />
                    </article>
                </div>
            </div>
        );
    }

    // 2. Otherwise, check if it's a Tenant Login Route.
    // getTenantsAction already returns all fields we need: logo, motto, foundingYear,
    // address, contactPhone, contactEmail, website, brandColor, etc.
    const tenants = await getTenantsAction();
    const school = tenants.find(t => t.subdomain === slug || t.customDomain === slug || t.id.toLowerCase() === slug.toLowerCase());

    if (!school) {
        notFound();
    }

    const accent = school.brandColor || "#AE7B64";

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SchoolLogin
                tenantName={school.name}
                tenantSlug={school.subdomain}
                brandColor={accent}
                logoUrl={school.logo}
                tagline={school.motto}
                address={school.address}
                city={school.city}
                state={school.state}
                zip={school.zip}
                phone={school.contactPhone}
                email={school.contactEmail}
                website={school.website}
                foundingYear={school.foundingYear}
            />
        </Suspense>
    );
}

