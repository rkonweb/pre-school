import { prisma } from "@/lib/prisma";
import FleetTrackerClient from "./FleetTrackerClient";
import { notFound } from "next/navigation";

export default async function FleetTrackerPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const school = await prisma.school.findUnique({
        where: { slug },
        select: { googleMapsApiKey: true }
    });

    if (!school) {
        notFound();
    }

    return <FleetTrackerClient apiKey={school.googleMapsApiKey || ""} />;
}
