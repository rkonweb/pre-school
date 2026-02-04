'use client'

import { createCMSPageAction } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPageForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [slug, setSlug] = useState("")

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const title = formData.get("title") as string
        const content = formData.get("content") as string
        const metaTitle = formData.get("metaTitle") as string
        const metaDescription = formData.get("metaDescription") as string

        // Auto-generate slug if dry
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        const result = await createCMSPageAction({
            title,
            slug: finalSlug,
            content,
            metaTitle,
            metaDescription
        })

        if (result.success) {
            toast.success("Page created successfully")
            router.push("/admin/cms/pages")
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/cms/pages">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Page</h1>
                    <p className="text-muted-foreground">Add a new page to your website.</p>
                </div>
            </div>

            <form action={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                            <CardDescription>Main page content and details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Page Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Terms of Service"
                                    required
                                    onChange={(e) => !slug && setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (URL Path)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">bodhiboard.in/</span>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="terms-of-service"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Page Content (HTML/Markdown)</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    placeholder="Enter your content here..."
                                    className="min-h-[400px] font-mono"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Basic HTML tags are supported.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                            <CardDescription>Optimize for search engines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input id="metaTitle" name="metaTitle" placeholder="Defaults to Page Title" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea id="metaDescription" name="metaDescription" placeholder="Brief summary for search results..." />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Create Page"}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
