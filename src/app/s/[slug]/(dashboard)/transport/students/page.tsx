import { getFleetStudentsAction } from "@/app/actions/transport-actions";
import { FleetStudentsList } from "@/components/dashboard/transport/FleetStudentsList";
import { SectionHeader, C } from "@/components/ui/erp-ui";
import { Users } from "lucide-react";

export default async function FleetStudentsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const studentsRes = await getFleetStudentsAction(slug);
    const students = studentsRes.success && studentsRes.data ? studentsRes.data : [];

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Fleet Manifest"
                subtitle="Manage student boarding, track attendance, and monitor live fleet passengers."
                icon={<Users size={18} color={C.amber} />}
            />

            <FleetStudentsList slug={slug} initialStudents={students} />
        </div>
    );
}
