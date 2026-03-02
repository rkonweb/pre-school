import { getVendorAction } from "@/app/actions/vendor-actions";
import VendorProfileClient from "./VendorProfileClient";
import { redirect } from "next/navigation";

export default async function VendorProfilePage({ params }: { params: { slug: string; id: string } }) {
    const { slug, id } = params;

    const vendorRes = await getVendorAction(slug, id);
    if (!vendorRes.success || !vendorRes.data) {
        redirect(`/s/${slug}/vendor/vendors`);
    }

    return <VendorProfileClient slug={slug} initialVendor={vendorRes.data} />;
}
