import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { ensureNextYearAction } from "@/app/actions/academic-year-actions";

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;

    // Auto-create next academic year if needed
    await ensureNextYearAction(slug);

    return <DashboardClient />;
}
