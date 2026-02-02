import { getClassroomsAction } from "@/app/actions/classroom-actions";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    // Fetch master data for classrooms
    const { success, data: classrooms } = await getClassroomsAction(slug);

    return (
        <AttendanceClient
            slug={slug}
            classrooms={success && classrooms ? classrooms : []}
        />
    );
}
