import { StudentAnalyticsPage } from "@/components/analytics/StudentAnalyticsPage";
import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";

interface PageProps {
    params: Promise<{ slug: string; studentId: string }>;
}

export default async function StudentProgressPage({ params }: PageProps) {
    const { slug, studentId } = await params;

    // Check authentication
    const userRes = await getCurrentUserAction();
    if (!userRes.success || !userRes.data) {
        redirect(`/${slug}/login`);
    }

    return <StudentAnalyticsPage studentId={studentId} />;
}
