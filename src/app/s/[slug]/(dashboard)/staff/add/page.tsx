import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { AddStaffPageClient } from "./AddStaffPageClient";

export default async function AddStaffPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: designations } = await getMasterDataAction("DESIGNATION");
    const { data: departments } = await getMasterDataAction("DEPARTMENT");
    const { data: employmentTypes } = await getMasterDataAction("EMPLOYMENT_TYPE");
    const { data: bloodGroups } = await getMasterDataAction("BLOOD_GROUP");
    const { data: genders } = await getMasterDataAction("GENDER");
    const { data: subjects } = await getMasterDataAction("SUBJECT");

    // Fetch Roles
    const { getRolesAction } = await import("@/app/actions/role-actions");
    const rolesRes = await getRolesAction(slug);
    const roles = rolesRes.success ? rolesRes.roles : [];

    return (
        <AddStaffPageClient
            slug={slug}
            designations={designations || []}
            departments={departments || []}
            employmentTypes={employmentTypes || []}
            bloodGroups={bloodGroups || []}
            genders={genders || []}
            subjects={subjects || []}
            roles={roles || []}
        />
    );
}
