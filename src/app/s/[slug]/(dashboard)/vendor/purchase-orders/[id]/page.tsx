import { getPurchaseOrderAction } from "@/app/actions/vendor-actions";
import PODetailsClient from "./PODetailsClient";
import { redirect } from "next/navigation";

export default async function PurchaseOrderDetailsPage({ params }: { params: { slug: string; id: string } }) {
    const { slug, id } = params;

    const poRes = await getPurchaseOrderAction(slug, id);
    if (!poRes.success || !poRes.data) {
        redirect(`/s/${slug}/vendor/purchase-orders`);
    }

    return <PODetailsClient slug={slug} initialPO={poRes.data} />;
}
