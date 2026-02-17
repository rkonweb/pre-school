import { prisma } from "@/lib/prisma";
import RequestManager from "./RequestManager";

export default async function RequestsPage({ params }: { params: { slug: string } }) {
    const school = await prisma.school.findUnique({
        where: { slug: params.slug },
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

    return <RequestManager requests={requests} routes={school.transportRoutes} />;
}
