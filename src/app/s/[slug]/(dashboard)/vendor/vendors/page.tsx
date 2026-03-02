import { getVendorsAction } from "@/app/actions/vendor-actions";
import VendorDirectoryClient from "./VendorDirectoryClient";

export default async function VendorsPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const vendorsRes = await getVendorsAction(slug);
    const vendors = vendorsRes.success ? vendorsRes.data : [];

    return <VendorDirectoryClient slug={slug} initialVendors={vendors} />;
}
