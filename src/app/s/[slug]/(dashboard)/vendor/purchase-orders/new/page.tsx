import { getVendorsAction } from "@/app/actions/vendor-actions";
import { getStoreCatalogAction } from "@/app/actions/store-actions";
import CreatePOClient from "./CreatePOClient";

export default async function CreatePOPage({ params }: { params: { slug: string } }) {
    const { slug } = params;

    const [vendorRes, catalogRes] = await Promise.all([
        getVendorsAction(slug),
        getStoreCatalogAction(slug),
    ]);

    const vendors = vendorRes.success ? vendorRes.data!.filter((v: any) => v.status === "ACTIVE") : [];
    const catalogItems = catalogRes.success ? catalogRes.data! : [];

    return <CreatePOClient slug={slug} vendors={vendors} catalogItems={catalogItems} />;
}

