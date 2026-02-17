import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { LocationForm } from "@/components/dashboard/settings/LocationForm";
import { notFound } from "next/navigation";

export default async function LocationSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await getSchoolSettingsAction(slug);

    if (!res.success || !res.data) {
        return notFound();
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Location & Physicality
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage branch addresses, contact details, and map coordinates.
                    </p>
                </div>
            </div>

            <LocationForm slug={slug} initialData={res.data} />
        </div>
    );
}
