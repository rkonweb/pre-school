import { prisma } from "@/lib/prisma";
import RouteManager from "./RouteManager";

export default async function RoutesPage({ params }: { params: { slug: string } }) {
    const school = await prisma.school.findUnique({
        where: { slug: params.slug },
        include: {
            transportVehicles: true,
            transportRoutes: { include: { stops: { orderBy: { sequenceOrder: 'asc' } }, pickupVehicle: true, dropVehicle: true } }
        }
    });

    if (!school) return <div>School not found</div>;

    return <RouteManager schoolSlug={params.slug} initialRoutes={school.transportRoutes} vehicles={school.transportVehicles} />;
}
