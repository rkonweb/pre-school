'use client'

import { createJobPostingAction } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewJobForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const title = formData.get("title") as string
        const department = formData.get("department") as string
        const location = formData.get("location") as string
        const type = formData.get("type") as string
        const description = formData.get("description") as string
        const requirements = formData.get("requirements") as string

        const result = await createJobPostingAction({
            title,
            department,
            location,
            type,
            description,
            requirements
        })

        if (result.success) {
            toast.success("Job posted successfully")
            router.push("/admin/cms/careers")
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/cms/careers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Post a Job</h1>
                    <p className="text-muted-foreground">Find new talent for your team.</p>
                </div>
            </div>

            <form action={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input id="title" name="title" required placeholder="Pre-Primary Teacher" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" name="department" required placeholder="Academics" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" name="location" required placeholder="New Delhi Branch" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Employment Type</Label>
                                    <Select name="type" required defaultValue="Full-time">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Job Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    className="min-h-[150px]"
                                    placeholder="Responsibilities and role overview..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="requirements">Requirements</Label>
                                <Textarea
                                    id="requirements"
                                    name="requirements"
                                    className="min-h-[150px]"
                                    placeholder="Skills, experience, and qualifications..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Posting..." : "Post Job Opening"}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
