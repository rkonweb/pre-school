import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction, getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getMyClassTeacherClassroomsAction } from "@/app/actions/class-teacher-actions";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    // Get current user and their class teacher classrooms
    const [userRes, classesRes, yearsRes, currentYearRes, schoolRes] = await Promise.all([
        getCurrentUserAction(),
        getClassroomsAction(slug),
        getAcademicYearsAction(slug),
        getCurrentAcademicYearAction(slug),
        getSchoolSettingsAction(slug)
    ]);

    const isAdmin = userRes.success && (userRes.data?.role === "ADMIN" || userRes.data?.role === "SUPER_ADMIN");
    const allClassrooms = classesRes.success && classesRes.data ? classesRes.data : [];

    // For non-admins: only show classrooms they are Class Teacher of
    let visibleClassrooms = allClassrooms;
    let classTeacherClassroomIds: string[] = [];

    if (!isAdmin) {
        const ctRes = await getMyClassTeacherClassroomsAction(slug);
        classTeacherClassroomIds = ctRes.classrooms.map((c: any) => c.id);
        visibleClassrooms = allClassrooms.filter((c: any) => classTeacherClassroomIds.includes(c.id));
    }

    return (
        <AttendanceClient
            slug={slug}
            classrooms={visibleClassrooms}
            academicYears={yearsRes.success && yearsRes.data ? yearsRes.data : []}
            currentAcademicYear={currentYearRes.success ? currentYearRes.data : null}
            schoolTimezone={schoolRes.success ? schoolRes.data?.timezone : undefined}
            isAdmin={isAdmin}
            classTeacherClassroomIds={classTeacherClassroomIds}
        />
    );
}

