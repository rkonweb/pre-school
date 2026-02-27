import { validateUserSchoolAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { getCanteenPackagesAction, getCanteenItemsAction } from "@/app/actions/canteen-actions";
import CanteenPackagesClient from "./CanteenPackagesClient";

export default async function CanteenPackagesPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const auth = await validateUserSchoolAction(params.slug);
    if (!auth.success || !auth.user) redirect(`/s/${params.slug}/login`);

    const [packagesRes, itemsRes] = await Promise.all([
        getCanteenPackagesAction(params.slug),
        getCanteenItemsAction(params.slug),
    ]);

    return (
        <CanteenPackagesClient
            slug={params.slug}
            packages={packagesRes.data ?? []}
            items={itemsRes.data ?? []}
        />
    );
}
