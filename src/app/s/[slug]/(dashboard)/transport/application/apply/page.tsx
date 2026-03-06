import { getAllRoutesWithStopsAction } from "@/app/actions/transport-actions";
import ManualTransportAssignment from "./ManualTransportAssignment";
import { SectionHeader, C } from "@/components/ui/erp-ui";
import { Navigation } from "lucide-react";

export default async function ManualApplyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Pre-fetch routes for the dropdowns
    const routesRes = await getAllRoutesWithStopsAction(slug);
    const routes = routesRes.success && routesRes.data ? routesRes.data : [];

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Manual Assignment"
                subtitle="Search and enroll students directly into transport routes."
                icon={<Navigation size={18} color={C.amber} />}
            />
            <ManualTransportAssignment slug={slug} initialRoutes={routes} />
        </div>
    );
}
