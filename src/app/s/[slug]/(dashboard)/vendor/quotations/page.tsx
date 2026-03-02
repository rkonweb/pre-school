import { getQuotationsAction } from "@/app/actions/vendor-actions";
import StoreQuotationsClient from "./StoreQuotationsClient";

export default async function QuotationsPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // Fetch all quotes across all vendors
    const quoteRes = await getQuotationsAction(slug);
    const quotations = quoteRes.success ? quoteRes.data : [];

    return <StoreQuotationsClient slug={slug} initialQuotations={quotations} />;
}
