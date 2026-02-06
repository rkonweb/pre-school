import { RouteForm } from "@/components/dashboard/transport/RouteForm";
import {
    getVehiclesAction,
    getDriversAction,
    getRoutesAction
} from "@/app/actions/transport-actions";
import { notFound } from "next/navigation";

export default async function EditRoutePage({
    params
}: {
    params: Promise<{ slug: string, id: string }>
}) {
    const { slug, id } = await params;

    const [vehiclesRes, driversRes, routesRes] = await Promise.all([
        getVehiclesAction(slug),
        getDriversAction(slug),
        getRoutesAction(slug)
    ]);

    const route = routesRes.success && routesRes.data ? routesRes.data.find((r: any) => r.id === id) : null;

    if (!route) {
        notFound();
    }

    return (
        <div>
            <RouteForm
                slug={slug}
                routeId={id}
                initialData={route}
                vehicles={vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : []}
                drivers={driversRes.success && driversRes.data ? driversRes.data : []}
            />
        </div>
    );
}
