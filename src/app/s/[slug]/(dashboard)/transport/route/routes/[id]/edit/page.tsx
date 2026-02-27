import { RouteForm } from "@/components/dashboard/transport/RouteForm";
import {
    getVehiclesAction,
    getDriversAction,
    getRouteDetailsAction
} from "@/app/actions/transport-actions";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function EditRoutePage({
    params
}: {
    params: Promise<{ slug: string, id: string }>
}) {
    const { slug, id } = await params;

    const [vehiclesRes, driversRes, routeRes, school] = await Promise.all([
        getVehiclesAction(slug),
        getDriversAction(slug),
        getRouteDetailsAction(id, slug),
        prisma.school.findUnique({
            where: { slug },
            select: { googleMapsApiKey: true }
        })
    ]);

    const route = routeRes.success ? routeRes.data : null;

    if (!route || !school) {
        notFound();
    }

    return (
        <div>
            {!driversRes.success && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-bold">
                    Failed to load drivers: {driversRes.error}
                </div>
            )}
            <RouteForm
                slug={slug}
                routeId={id}
                initialData={route}
                vehicles={vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : []}
                drivers={driversRes.success && driversRes.data ? driversRes.data : []}
                apiKey={school.googleMapsApiKey || ""}
            />
        </div>
    );
}
