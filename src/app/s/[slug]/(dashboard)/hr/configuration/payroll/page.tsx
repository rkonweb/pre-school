import { getPayrollSettingsAction } from "@/app/actions/payroll-settings-actions";
import { PayrollSettingsManager } from "@/components/dashboard/settings/PayrollSettingsManager";

export default async function PayrollSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await getPayrollSettingsAction(slug);

    return (
        <div style={{ maxWidth: 1000 }}>
            <PayrollSettingsManager
                schoolSlug={slug}
                initialData={res.success ? res.data : null}
            />
        </div>
    );
}
