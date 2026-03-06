import { prisma } from "@/lib/prisma";
import RequestManager from "./RequestManager";
import { SectionHeader, C } from "@/components/ui/erp-ui";
import { ClipboardList } from "lucide-react";

export default async function RequestsPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const school = await prisma.school.findUnique({
        where: { slug: slug },
        include: {
            transportRoutes: { include: { stops: true } }
        }
    });

    if (!school) return <div>School not found</div>;

    const requests = await prisma.studentTransportProfile.findMany({
        where: {
            student: { schoolId: school.id },
            status: "PENDING"
        },
        include: { student: true }
    });

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Transport Applications"
                subtitle="Review and process student enrollment requests for fleet services."
                icon={<ClipboardList size={18} color={C.amber} />}
            />
            <RequestManager requests={requests} routes={school.transportRoutes} slug={slug} />
        </div>
    );
}
