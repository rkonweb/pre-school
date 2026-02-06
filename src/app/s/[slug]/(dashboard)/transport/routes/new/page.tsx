import { RouteForm } from "@/components/dashboard/transport/RouteForm";
import { getVehiclesAction, getDriversAction } from "@/app/actions/transport-actions";

export default async function NewRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const [vehiclesRes, driversRes] = await Promise.all([
        getVehiclesAction(slug),
        getDriversAction(slug)
    ]);

    return (
        <div>
            <RouteForm
                slug={slug}
                vehicles={vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : []}
                drivers={driversRes.success && driversRes.data ? driversRes.data : []}
            />
        </div>
    );
}
