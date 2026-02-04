import { getBlogPostBySlugAction } from "@/app/actions/cms-actions"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

// Force dynamic rendering for CMS content
export const dynamic = 'force-dynamic';


interface BlogPostPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getBlogPostBySlugAction(slug)
    if (!post) return { title: 'Post Not Found' }

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
            images: post.ogImage ? [post.ogImage] : undefined
        }
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params
    const post = await getBlogPostBySlugAction(slug)

    if (!post) {
        notFound()
    }

    // Parse tags
    let tags = [];
    try {
        tags = JSON.parse(post.tags);
    } catch (e) {
        tags = [];
    }

    return (
        <div className="bg-white min-h-screen font-sans text-navy">
            <div className="container mx-auto px-4 py-20 pt-32 max-w-4xl">
                <Link href="/blog" className="inline-flex items-center text-navy/40 hover:text-teal transition-all mb-12 font-black text-xs uppercase tracking-widest group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-2 transition-transform" /> Back to Journal
                </Link>

                <div className="bg-sky/20 rounded-[4rem] p-10 md:p-20 mb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -z-10" />
                    <div className="flex flex-wrap gap-2 mb-8">
                        {tags.map((tag: string, i: number) => (
                            <span key={i} className="px-5 py-2 rounded-full bg-white text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-navy mb-10 leading-[1] tracking-tighter">
                        {post.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-8 text-navy/30 font-black text-[10px] uppercase tracking-[0.25em] border-t border-navy/5 pt-10">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-teal" />
                            <span>{post.author.firstName} {post.author.lastName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-orange" />
                            <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>

                <article className="prose prose-xl prose-slate max-w-none prose-headings:font-black prose-headings:text-navy prose-headings:tracking-tighter prose-p:text-navy/60 prose-p:leading-relaxed prose-a:text-teal font-medium">
                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} className="blog-content" />
                </article>
            </div>
        </div>
    )
}

