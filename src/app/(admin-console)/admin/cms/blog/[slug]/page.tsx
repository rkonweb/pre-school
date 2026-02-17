'use client'

import { getBlogPostBySlugAction, updateBlogPostAction } from "@/app/actions/cms-actions"
import { BlogForm } from "@/components/admin-console/cms/BlogForm"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditPostPageProps {
    params: Promise<{
        slug: string
    }>
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const { slug } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [post, setPost] = useState<any>(null)

    useEffect(() => {
        async function loadPost() {
            const data = await getBlogPostBySlugAction(slug)
            if (!data) {
                toast.error("Post not found")
                router.push("/admin/cms/blog")
                return
            }
            setPost(data)
            setLoading(false)
        }
        loadPost()
    }, [slug, router])

    async function handleSubmit(data: any) {
        setSubmitting(true)
        const result = await updateBlogPostAction(post.id, data)

        if (result.success) {
            toast.success("Post updated successfully")
            router.push("/admin/cms/blog")
        } else {
            toast.error(result.error || "Failed to update post")
        }
        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Post Data...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <BlogForm
                initialData={post}
                onSubmit={handleSubmit}
                title="Edit Post"
                loading={submitting}
            />
        </div>
    )
}
