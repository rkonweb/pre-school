import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction, getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    // Fetch master data for classrooms and academic years
    const [classesRes, yearsRes, currentYearRes, schoolRes] = await Promise.all([
        getClassroomsAction(slug),
        getAcademicYearsAction(slug),
        getCurrentAcademicYearAction(slug),
        getSchoolSettingsAction(slug)
    ]);

    return (
        <AttendanceClient
            slug={slug}
            classrooms={classesRes.success && classesRes.data ? classesRes.data : []}
            academicYears={yearsRes.success && yearsRes.data ? yearsRes.data : []}
            currentAcademicYear={currentYearRes.success ? currentYearRes.data : null}
            schoolTimezone={schoolRes.success ? schoolRes.data?.timezone : undefined}
        />
    );
}
