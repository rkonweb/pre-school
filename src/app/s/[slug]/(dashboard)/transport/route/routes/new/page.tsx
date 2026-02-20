import { RouteForm } from "@/components/dashboard/transport/RouteForm";
import { getVehiclesAction, getDriversAction } from "@/app/actions/transport-actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NewRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const [vehiclesRes, driversRes, school] = await Promise.all([
        getVehiclesAction(slug),
        getDriversAction(slug),
        prisma.school.findUnique({
            where: { slug },
            select: { googleMapsApiKey: true }
        })
    ]);

    if (!school) {
        notFound();
    }

    return (
        <div>
            <RouteForm
                slug={slug}
                vehicles={vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data : []}
                drivers={driversRes.success && driversRes.data ? driversRes.data : []}
                apiKey={school.googleMapsApiKey || ""}
            />
        </div>
    );
}
