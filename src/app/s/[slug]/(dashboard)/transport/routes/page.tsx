import { prisma } from "@/lib/prisma";
import RouteManager from "./RouteManager";

export default async function RoutesPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const school = await prisma.school.findUnique({
        where: { slug },
        include: {
            transportVehicles: true,
            transportRoutes: {
                include: {
                    stops: { orderBy: { sequenceOrder: 'asc' } },
                    TransportVehicle_TransportRoute_pickupVehicleIdToTransportVehicle: true,
                    TransportVehicle_TransportRoute_dropVehicleIdToTransportVehicle: true
                }
            }
        }
    });

    if (!school) return <div>School not found</div>;

    // Map the relation names back to what RouteManager expects
    const routes = school.transportRoutes.map((r: any) => ({
        ...r,
        pickupVehicle: r.TransportVehicle_TransportRoute_pickupVehicleIdToTransportVehicle,
        dropVehicle: r.TransportVehicle_TransportRoute_dropVehicleIdToTransportVehicle
    }));

    return <RouteManager schoolSlug={slug} initialRoutes={routes} vehicles={school.transportVehicles} />;
}
