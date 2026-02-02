import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { LocationForm } from "@/components/dashboard/settings/LocationForm";
import { notFound } from "next/navigation";

export default async function LocationSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await getSchoolSettingsAction(slug);

    if (!res.success || !res.data) {
        return notFound();
    }

    return <LocationForm slug={slug} initialData={res.data} />;
}
