export const dynamic = "force-dynamic";

import { getCanteenAccountsLedgerAction } from "@/app/actions/canteen-actions";
import CanteenAccountsClient from "./CanteenAccountsClient";

export default async function CanteenAccountsPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const res = await getCanteenAccountsLedgerAction(params.slug);
    const data = res.success ? (res.data as any) : null;

    return <CanteenAccountsClient slug={params.slug} initialData={data} />;
}
