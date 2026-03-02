import { getPurchaseOrdersAction } from "@/app/actions/vendor-actions";
import StorePOClient from "./StorePOClient";

export default async function PurchaseOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const poRes = await getPurchaseOrdersAction(slug);
    const purchaseOrders = poRes.success && poRes.data ? poRes.data : [];

    return <StorePOClient slug={slug} initialPurchaseOrders={purchaseOrders} />;
}
