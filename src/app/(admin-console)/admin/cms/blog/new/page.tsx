'use client'

import { createBlogPostAction } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewBlogPostForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [slug, setSlug] = useState("")

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const title = formData.get("title") as string
        const excerpt = formData.get("excerpt") as string
        const content = formData.get("content") as string
        const tags = formData.get("tags") as string

        // Auto-generate slug if dry
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Process tags
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean)

        const result = await createBlogPostAction({
            title,
            slug: finalSlug,
            excerpt,
            content,
            tags: JSON.stringify(tagsArray)
        })

        if (result.success) {
            toast.success("Post published successfully")
            router.push("/admin/cms/blog")
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/cms/blog">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
                    <p className="text-muted-foreground">Share news and updates.</p>
                </div>
            </div>

            <form action={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Article Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    onChange={(e) => !slug && setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt / Summary</Label>
                                <Textarea id="excerpt" name="excerpt" placeholder="Short description for cards..." rows={3} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    placeholder="Write your article here..."
                                    className="min-h-[400px] font-mono"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags (Comma separated)</Label>
                                <Input id="tags" name="tags" placeholder="News, Updates, Event" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Publishing..." : "Publish Post"}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
