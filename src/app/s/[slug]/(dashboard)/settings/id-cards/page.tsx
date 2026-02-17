import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, Trash2, CreditCard, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateListClient } from "./TemplateListClient";

export default async function IDCardTemplatesPage({ params }: { params: { slug: string } }) {
    const school = await prisma.school.findUnique({
        where: { slug: params.slug },
        include: {
            idCardTemplates: true,
            idCardSettings: true
        }
    });

    if (!school) return <div>School not found</div>;

    const templates = await prisma.iDCardTemplate.findMany({
        where: {
            OR: [
                { schoolId: school.id },
                { isSystem: true, schoolId: null }
            ]
        },
        include: {
            childTemplates: {
                where: { schoolId: school.id }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        ID Card Templates
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Create and manage reusable ID card templates for students and staff.
                    </p>
                </div>
                <Link href={`/s/${params.slug}/settings/id-cards/designer/new`}>
                    <Button className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
                        <Plus className="h-4 w-4" /> Create Template
                    </Button>
                </Link>
            </div>

            <TemplateListClient
                slug={params.slug}
                schoolId={school.id}
                initialTemplates={templates}
            />
        </div>
    );
}
