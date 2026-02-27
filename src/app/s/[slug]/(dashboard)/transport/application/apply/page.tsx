import { getAllRoutesWithStopsAction } from "@/app/actions/transport-actions";
import ManualTransportAssignment from "./ManualTransportAssignment";

export default async function ManualApplyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Pre-fetch routes for the dropdowns
    const routesRes = await getAllRoutesWithStopsAction(slug);
    const routes = routesRes.success && routesRes.data ? routesRes.data : [];

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">Manual Transport Assignment</h1>
                <p className="text-zinc-500 font-medium mt-1">
                    Search and enroll students directly into transport routes.
                </p>
            </div>

            <ManualTransportAssignment slug={slug} initialRoutes={routes} />
        </div>
    );
}
