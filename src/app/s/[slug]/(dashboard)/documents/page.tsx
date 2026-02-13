
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DocumentBrowser } from "@/components/documents/DocumentBrowser";
import { FileText, FolderOpen } from "lucide-react";

export default async function DocumentsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 1. Fetch "School Resources" Category
    const category = await prisma.trainingCategory.findUnique({
        where: { slug: "school-resources" },
        include: {
            modules: {
                where: { isPublished: true },
                orderBy: { order: "asc" },
                include: {
                    topics: {
                        orderBy: { order: "asc" },
                        include: {
                            pages: {
                                where: { isPublished: true },
                                orderBy: { order: "asc" },
                                include: {
                                    attachments: true
                                }
                            },
                        },
                    },
                },
            },
        },
    });

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <div className="bg-zinc-100 p-4 rounded-full mb-4">
                    <FolderOpen className="h-8 w-8 text-zinc-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">No Documents Found</h2>
                <p className="text-zinc-500 max-w-md mt-2">
                    The "School Resources" category hasn't been set up yet. Please contact the Super Admin.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-brand" />
                    {category.name}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {category.description || "Access important school documents and resources."}
                </p>
            </div>

            <DocumentBrowser category={category} />
        </div>
    );
}
