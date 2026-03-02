import { getPayrollSettingsAction } from "@/app/actions/payroll-settings-actions";
import { PayrollSettingsManager } from "@/components/dashboard/settings/PayrollSettingsManager";
import { notFound } from "next/navigation";

export default async function PayrollSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const res = await getPayrollSettingsAction(slug);

    // We don't notFound here because it might be the first time setup (upsert handles it)
    // But we need the slug and initial data

    return (
        <div className="mx-auto max-w-6xl p-8">
            <PayrollSettingsManager
                schoolSlug={slug}
                initialData={res.success ? res.data : null}
            />
        </div>
    );
}
