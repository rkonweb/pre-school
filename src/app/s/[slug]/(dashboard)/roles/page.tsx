import { getRolesAction, getTeachersWithAccessAction } from "@/app/actions/role-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import RolesClient from "./RolesClient";
import { notFound } from "next/navigation";

export default async function RolesPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [rolesRes, teachersRes, classesRes] = await Promise.all([
        getRolesAction(slug),
        getTeachersWithAccessAction(slug),
        getClassroomsAction(slug)
    ]);

    if (!rolesRes.success || !teachersRes.success || !classesRes.success) {
        // In a real app we might handle errors better, 
        // but for dashboard protected pages, this often means auth or db fail.
        console.error("Roles Page Load Error", { roles: rolesRes.error, teachers: teachersRes.error, classes: classesRes.error });
    }

    const roles = rolesRes.success ? rolesRes.roles : [];
    const teachers = teachersRes.success ? teachersRes.teachers : [];
    const classrooms = classesRes.success ? classesRes.data : [];

    return (
        <RolesClient
            schoolSlug={slug}
            initialRoles={roles || []}
            initialTeachers={teachers || []}
            classrooms={classrooms || []}
        />
    );
}
