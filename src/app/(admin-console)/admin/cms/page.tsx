"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Newspaper, Briefcase, Home, Sparkles, CreditCard, Phone } from "lucide-react"
import Link from "next/link"

export default function CMSDashboardPage() {
    const modules = [
        {
            title: "Homepage",
            description: "Manage homepage sections, hero, features, and CTAs.",
            icon: Home,
            href: "/admin/cms/homepage",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "Features",
            description: "Manage feature cards, hero, and detailed highlights.",
            icon: Sparkles,
            href: "/admin/cms/features",
            color: "text-pink-500",
            bg: "bg-pink-50"
        },
        {
            title: "Pricing",
            description: "Manage pricing hero, FAQs, and comparison limits.",
            icon: CreditCard,
            href: "/admin/cms/pricing",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Pages",
            description: "Manage static pages like About Us, Terms, and Privacy.",
            icon: FileText,
            href: "/admin/cms/pages",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Blog",
            description: "Create and publish blog posts and articles.",
            icon: Newspaper,
            href: "/admin/cms/blog",
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "Careers",
            description: "Post job openings and manage career opportunities.",
            icon: Briefcase,
            href: "/admin/cms/careers",
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            title: "Contact",
            description: "Manage contact info, office locations, and form layout.",
            icon: Phone,
            href: "/admin/cms/contact",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage your website content, blog posts, and career openings.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {modules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {module.title}
                                </CardTitle>
                                <module.icon className={`h-4 w-4 ${module.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`w-12 h-12 rounded-full ${module.bg} flex items-center justify-center mb-4`}>
                                    <module.icon className={`h-6 w-6 ${module.color}`} />
                                </div>
                                <CardDescription>{module.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
