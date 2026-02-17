import { getBlogPostBySlugAction, getRelatedPostsAction } from "@/app/actions/cms-actions"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { BlogPostClient } from "@/components/blog/BlogPostClient";

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
    const relatedPosts = await getRelatedPostsAction(slug);

    if (!post) {
        notFound()
    }

    return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

