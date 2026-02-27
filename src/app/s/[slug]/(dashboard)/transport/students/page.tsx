import { getFleetStudentsAction } from "@/app/actions/transport-actions";
import { FleetStudentsList } from "@/components/dashboard/transport/FleetStudentsList";

export default async function FleetStudentsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const studentsRes = await getFleetStudentsAction(slug);
    const students = studentsRes.success && studentsRes.data ? studentsRes.data : [];

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">Fleet Manifest</h1>
                <p className="text-zinc-500 font-medium mt-1">
                    Manage student boarding, track attendance, and monitor live fleet passengers.
                </p>
            </div>

            <FleetStudentsList slug={slug} initialStudents={students} />
        </div>
    );
}
