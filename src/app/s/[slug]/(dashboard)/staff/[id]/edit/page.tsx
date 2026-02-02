import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getStaffMemberAction } from "@/app/actions/staff-actions";
import { EditStaffPageClient } from "./EditStaffPageClient";
import { notFound } from "next/navigation";

export default async function EditStaffPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = await params;

    const staffRes = await getStaffMemberAction(id);
    if (!staffRes.success || !staffRes.data) {
        return notFound();
    }

    // Fetch Roles
    const { getRolesAction } = await import("@/app/actions/role-actions");
    const rolesRes = await getRolesAction(slug);
    const roles = rolesRes.success ? rolesRes.roles : [];

    const { data: designations } = await getMasterDataAction("DESIGNATION");
    const { data: departments } = await getMasterDataAction("DEPARTMENT");
    const { data: employmentTypes } = await getMasterDataAction("EMPLOYMENT_TYPE");
    const { data: bloodGroups } = await getMasterDataAction("BLOOD_GROUP");
    const { data: genders } = await getMasterDataAction("GENDER");
    const { data: subjects } = await getMasterDataAction("SUBJECT");

    // Fetch Classrooms for Access Control
    const { getClassroomsAction } = await import("@/app/actions/classroom-actions");
    const classroomsRes = await getClassroomsAction(slug);
    const classrooms = classroomsRes.success && classroomsRes.data ? classroomsRes.data : [];

    return (
        <EditStaffPageClient
            slug={slug}
            roles={roles || []} // Pass Roles
            designations={designations || []}
            departments={departments || []}
            employmentTypes={employmentTypes || []}
            bloodGroups={bloodGroups || []}
            genders={genders || []}
            subjects={subjects || []}
            classrooms={classrooms}
            initialData={JSON.parse(JSON.stringify(staffRes.data))}
            staffId={id}
        />
    );
}
