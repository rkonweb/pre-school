"use client";

import { AddStaffForm } from "@/components/dashboard/staff/AddStaffForm";
import { SalaryPackageSection } from "@/components/dashboard/staff/SalaryPackageSection";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StaffClassAccess } from "@/components/dashboard/staff/StaffClassAccess";
import { StaffLibraryHistory } from "@/components/dashboard/staff/StaffLibraryHistory";
import { StaffBiometricSection } from "@/components/dashboard/staff/StaffBiometricSection";
import { StaffRolePermissions } from "@/components/dashboard/staff/StaffRolePermissions";

interface EditStaffPageClientProps {
    slug: string;
    roles: any[];
    designations: any[];
    departments: any[];
    employmentTypes: any[];
    bloodGroups: any[];
    genders: any[];
    subjects: any[];
    classrooms: any[];
    branches: any[];
    initialData: any;
    initialAccess: any[];
    staffId: string;
}

export function EditStaffPageClient({ slug, roles, designations, departments, employmentTypes, bloodGroups, genders, subjects, classrooms, branches, initialData, initialAccess, staffId }: EditStaffPageClientProps) {
    const router = useRouter();
    const isAdmin = initialData?.role === "ADMIN" || initialData?.role === "SUPER_ADMIN";

    return (
        <div className="mx-auto max-w-4xl p-8">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href={`/s/${slug}/hr/directory`}
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
                        branches={branches}
                        initialData={initialData}
                        staffId={staffId}
                        onCancel={() => router.push(`/s/${slug}/hr/directory`)}
                        onSuccess={() => router.push(`/s/${slug}/hr/directory`)}
                    />
                </div>

                {/* Roles & Permissions + Class Access — only for non-Admin staff */}
                {!isAdmin && (
                    <>
                        <StaffRolePermissions
                            staffId={staffId}
                            schoolSlug={slug}
                            roles={roles}
                            initialRoleId={initialData?.customRoleId || null}
                        />

                        <StaffClassAccess
                            staffId={staffId}
                            schoolSlug={slug}
                            classrooms={classrooms}
                            initialAccess={initialAccess}
                        />
                    </>
                )}

                {isAdmin && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Administrator — Full Access</h3>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                    This staff member has Administrator privileges and has complete access to all modules. Role-based restrictions do not apply.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                    <StaffBiometricSection staffId={staffId} schoolSlug={slug} />
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                    <SalaryPackageSection
                        staffId={staffId}
                        schoolSlug={slug}
                        salaryRevisions={initialData?.salaryRevisions || []}
                    />
                </div>

                <StaffLibraryHistory
                    staffId={staffId}
                    schoolSlug={slug}
                    currency={initialData.school?.currency || "USD"}
                />
            </div>
        </div>
    );
}

