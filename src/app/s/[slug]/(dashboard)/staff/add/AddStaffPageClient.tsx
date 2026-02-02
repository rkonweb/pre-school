"use client";

import { AddStaffForm } from "@/components/dashboard/staff/AddStaffForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AddStaffPageClientProps {
    slug: string;
    designations: any[];
    departments: any[];
    employmentTypes: any[];
    bloodGroups: any[];
    genders: any[];
}

export function AddStaffPageClient({ slug, designations, departments, employmentTypes, bloodGroups, genders }: AddStaffPageClientProps) {
    const router = useRouter();

    return (
        <div className="mx-auto max-w-4xl p-8">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href={`/s/${slug}/staff`}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Add Staff Member
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Create a new staff profile with personal details, role, and documents.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                <AddStaffForm
                    schoolSlug={slug}
                    designations={designations}
                    departments={departments}
                    employmentTypes={employmentTypes}
                    bloodGroups={bloodGroups}
                    genders={genders}
                    onCancel={() => router.push(`/s/${slug}/staff`)}
                    onSuccess={() => router.push(`/s/${slug}/staff`)}
                />
            </div>
        </div>
    );
}
