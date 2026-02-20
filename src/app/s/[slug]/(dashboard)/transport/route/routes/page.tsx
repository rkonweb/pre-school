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
                    driver: true,
                    pickupVehicle: true,
                    dropVehicle: true,
                    _count: {
                        select: {
                            students: true,
                            stops: true
                        }
                    }
                }
            }
        }
    });

    if (!school) return <div>School not found</div>;

    // Map the relation names back to what RouteManager expects (no mapping needed now)
    const routes = school.transportRoutes;

    return <RouteManager schoolSlug={slug} initialRoutes={routes} vehicles={school.transportVehicles} />;
}
