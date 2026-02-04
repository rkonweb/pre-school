import { getCMSPageBySlugAction } from "@/app/actions/cms-actions"
import { notFound } from "next/navigation"
import { Metadata } from "next"

// Force dynamic rendering
export const dynamic = 'force-dynamic';


interface CMSPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: CMSPageProps): Promise<Metadata> {
    const { slug } = await params
    const page = await getCMSPageBySlugAction(slug)
    if (!page) return { title: 'Page Not Found' }

    return {
        title: page.metaTitle || page.title,
        description: page.metaDescription,
        openGraph: {
            images: page.ogImage ? [page.ogImage] : undefined
        }
    }
}

export default async function GenericCMSPage({ params }: CMSPageProps) {
    const { slug } = await params
    const page = await getCMSPageBySlugAction(slug)

    // If the page matches a reserved route, we should probably not handle it here, 
    // but Next.js file system routing handles precedence (specific folders beats dynamic routes).
    // So 'blog', 'careers', 'about' (if folder exists) will take precedence.
    // This will catch 'terms', 'privacy', etc.

    if (!page) {
        notFound()
    }

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
    )
}

