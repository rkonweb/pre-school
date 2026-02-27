export const dynamic = "force-dynamic";

import { getCanteenAnalyticsAction } from "@/app/actions/canteen-actions";
import CanteenDashboardClient from "./CanteenDashboardClient";

export default async function CanteenDashboardPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const res = await getCanteenAnalyticsAction(params.slug);
    const analytics = res.success ? (res.data as any) : null;

    return <CanteenDashboardClient slug={params.slug} initialData={analytics} />;
}
