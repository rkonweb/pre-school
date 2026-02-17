'use client'

import { createBlogPostAction } from "@/app/actions/cms-actions"
import { BlogForm } from "@/components/admin-console/cms/BlogForm"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewBlogPostPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(data: any) {
        setLoading(true)
        // Ensure ID is generated for new posts if not in DB auto-gen
        // The schema uses @id on String for id, so we should provide one if needed.
        // Prisma cuid() is usually handled by @default(cuid()), let's check schema.

        const submissionData = {
            ...data,
            id: Math.random().toString(36).substring(2, 15) // Fallback client-side ID if needed, though DB should handle it if defaulted
        }

        const result = await createBlogPostAction(submissionData)

        if (result.success) {
            toast.success("Post created successfully")
            router.push("/admin/cms/blog")
        } else {
            toast.error(result.error || "Failed to create post")
        }
        setLoading(false)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <BlogForm
                onSubmit={handleSubmit}
                title="Create New Post"
                loading={loading}
            />
        </div>
    )
}
