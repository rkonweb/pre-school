"use client";

import { AddStaffForm } from "@/components/dashboard/staff/AddStaffForm";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErpCard, Btn, SectionHeader } from "@/components/ui/erp-ui";

interface AddStaffPageClientProps {
    slug: string;
    designations: any[];
    departments: any[];
    employmentTypes: any[];
    bloodGroups: any[];
    genders: any[];
    subjects: any[];
    roles: any[];
    branches: any[];
}

export function AddStaffPageClient({ slug, designations, departments, employmentTypes, bloodGroups, genders, subjects, roles, branches }: AddStaffPageClientProps) {
    const router = useRouter();

    return (
        <div className="mx-auto max-w-4xl p-8">
            <div className="mb-6 flex items-center gap-4">
                <Btn
                    variant="outline"
                    icon={ArrowLeft}
                    onClick={() => router.push(`/s/${slug}/hr/directory`)}
                    title="Back to Directory"
                />
            </div>

            <SectionHeader
                title="Add Staff Member"
                subtitle="Create a new staff profile with personal details, role, and documents."
                icon={UserPlus}
            />

            <ErpCard className="mt-6 p-8">
                <AddStaffForm
                    schoolSlug={slug}
                    designations={designations}
                    departments={departments}
                    employmentTypes={employmentTypes}
                    bloodGroups={bloodGroups}
                    genders={genders}
                    subjects={subjects}
                    roles={roles}
                    branches={branches}
                    onCancel={() => router.push(`/s/${slug}/hr/directory`)}
                    onSuccess={() => router.push(`/s/${slug}/hr/directory`)}
                />
            </ErpCard>
        </div>
    );
}
