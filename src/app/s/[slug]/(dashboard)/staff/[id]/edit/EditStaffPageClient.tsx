"use client";

import { AddStaffForm } from "@/components/dashboard/staff/AddStaffForm";
import { SalaryPackageSection } from "@/components/dashboard/staff/SalaryPackageSection";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffClassAccess } from "@/components/dashboard/staff/StaffClassAccess";
import { StaffLibraryHistory } from "@/components/dashboard/staff/StaffLibraryHistory";

interface EditStaffPageClientProps {
    slug: string;
    roles: any[];
    designations: any[];
    departments: any[];
    employmentTypes: any[];
    bloodGroups: any[];
    genders: any[];
    subjects: any[];
    classrooms: any[]; // New prop
    initialData: any;
    staffId: string;
}

export function EditStaffPageClient({ slug, roles, designations, departments, employmentTypes, bloodGroups, genders, subjects, classrooms, initialData, staffId }: EditStaffPageClientProps) {
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
                        Edit Staff Member
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Update staff profile information and documents.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                    <AddStaffForm
                        schoolSlug={slug}
                        roles={roles}
                        designations={designations}
                        departments={departments}
                        employmentTypes={employmentTypes}
                        bloodGroups={bloodGroups}
                        genders={genders}
                        subjects={subjects}
                        initialData={initialData}
                        staffId={staffId}
                        onCancel={() => router.push(`/s/${slug}/staff`)}
                        onSuccess={() => router.push(`/s/${slug}/staff`)}
                    />
                </div>

                <StaffClassAccess
                    staffId={staffId}
                    classrooms={classrooms}
                />

                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                    <SalaryPackageSection
                        staffId={staffId}
                        salaryRevisions={initialData?.salaryRevisions || []}
                    />
                </div>

                <StaffLibraryHistory
                    staffId={staffId}
                    schoolSlug={slug}
                    currency={initialData.school?.currency || "USD"} // Assuming initialData usually has school info nested, if not default
                />
            </div>
        </div>
    );
}
