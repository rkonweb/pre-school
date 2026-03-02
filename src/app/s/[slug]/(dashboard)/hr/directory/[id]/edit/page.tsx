import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getStaffMemberAction } from "@/app/actions/staff-actions";
import { EditStaffPageClient } from "./EditStaffPageClient";
import { notFound } from "next/navigation";

export default async function EditStaffPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = await params;

    const staffRes = await getStaffMemberAction(slug, id);
    if (!staffRes.success || !staffRes.data) {
        return notFound();
    }

    // Prepare parallel fetches
    const { getRolesAction } = await import("@/app/actions/role-actions");
    const { getClassroomsAction } = await import("@/app/actions/classroom-actions");
    const { getBranchesAction } = await import("@/app/actions/branch-actions");
    const { getStaffClassAccessAction } = await import("@/app/actions/staff-actions");

    const [
        rolesRes,
        designationsRes,
        departmentsRes,
        employmentTypesRes,
        bloodGroupsRes,
        gendersRes,
        subjectsRes,
        classroomsRes,
        branchesRes,
        accessRes
    ] = await Promise.all([
        getRolesAction(slug),
        getMasterDataAction("DESIGNATION"),
        getMasterDataAction("DEPARTMENT"),
        getMasterDataAction("EMPLOYMENT_TYPE"),
        getMasterDataAction("BLOOD_GROUP"),
        getMasterDataAction("GENDER"),
        getMasterDataAction("SUBJECT"),
        getClassroomsAction(slug),
        getBranchesAction(slug),
        getStaffClassAccessAction(slug, id)
    ]);

    const classrooms = classroomsRes.success && classroomsRes.data ? classroomsRes.data : [];
    const roles = rolesRes.success ? rolesRes.roles : [];
    const branches = branchesRes.success && branchesRes.data ? branchesRes.data : [];
    const initialAccess: any[] = (accessRes.success && accessRes.access) ? accessRes.access : [];

    return (
        <EditStaffPageClient
            slug={slug}
            roles={roles || []}
            designations={designationsRes.data || []}
            departments={departmentsRes.data || []}
            employmentTypes={employmentTypesRes.data || []}
            bloodGroups={bloodGroupsRes.data || []}
            genders={gendersRes.data || []}
            subjects={subjectsRes.data || []}
            classrooms={classrooms}
            branches={branches}
            initialData={JSON.parse(JSON.stringify(staffRes.data))}
            initialAccess={initialAccess}
            staffId={id}
        />
    );
}
