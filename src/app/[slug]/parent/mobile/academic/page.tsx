import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getParentDashboardDataAction } from "@/app/actions/parent-actions";
import { AcademicDashboardClient } from "@/components/mobile/academic/AcademicDashboardClient";

export default async function AcademicPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ studentId?: string }>; // Optional studentId if multiple children
}) {
    const { slug } = await params;
    const { studentId } = await searchParams;

    const userRes = await getCurrentUserAction();
    if (!userRes.success || !userRes.data) {
        redirect("/parent-login");
    }

    const phone = userRes.data.mobile;
    const dashboardRes = await getParentDashboardDataAction(slug, phone) as any;

    if (!dashboardRes.success || !dashboardRes.students.length) {
        redirect(`/${slug}/parent/mobile/dashboard`);
    }

    // Default to first student if none selected
    const activeStudent = studentId
        ? dashboardRes.students.find((s: any) => s.id === studentId)
        : dashboardRes.students[0];

    if (!activeStudent) {
        redirect(`/${slug}/parent/mobile/dashboard`);
    }

    return (
        <div className="max-w-md mx-auto relative shadow-2xl overflow-x-hidden min-h-screen">
            <AcademicDashboardClient
                slug={slug}
                studentId={activeStudent.id}
                studentName={activeStudent.firstName}
            />
        </div>
    );
}
