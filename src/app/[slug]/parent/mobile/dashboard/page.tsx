import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getParentDashboardDataAction } from "@/app/actions/parent-actions";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";

export default async function ParentDashboardPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ preview?: string }>;
}) {
    const { slug } = await params;
    const { preview } = await searchParams;

    const userRes = await getCurrentUserAction();

    // PREVIEW BYPASS: Allow access if preview param is set
    if (preview === "true") {
        // Use the demo student's phone
        const phone = "9999999999";
        const dashboardRes = await getParentDashboardDataAction(slug, phone) as any;
        if (dashboardRes.success) {
            const studentStats = dashboardRes.students.reduce((acc: any, s: any) => {
                acc[s.id] = s.stats;
                return acc;
            }, {});

            return (
                <div className="min-h-screen bg-slate-50/50 max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
                    <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-summer-teal/10 to-transparent -z-10" />
                    <MobileDashboard
                        parentProfile={dashboardRes.profile || { firstName: "Demo Parent" }}
                        students={dashboardRes.students}
                        studentStats={studentStats}
                        slug={slug}
                        parentId="demo-parent-id"
                        phone={phone}
                    />
                </div>
            );
        }
    }

    if (!userRes.success || !userRes.data) {
        redirect("/parent-login");
    }

    const phone = userRes.data.mobile;
    const dashboardRes = await getParentDashboardDataAction(slug, phone);

    if (!dashboardRes.success) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
                <h1 className="text-2xl font-black text-summer-navy mb-2">Sync Error</h1>
                <p className="text-gray-500 mb-6">We couldn't load your family dashboard. Please try again later.</p>
                <button className="px-8 py-3 bg-summer-navy text-white rounded-2xl font-bold">Retry</button>
            </div>
        );
    }

    const { profile: parentProfile, students } = dashboardRes as any;

    // Transform students array into the stats mapping expected by the component
    const studentStats = students.reduce((acc: any, s: any) => {
        acc[s.id] = s.stats;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50/50 max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-summer-teal/10 to-transparent -z-10" />

            <MobileDashboard
                parentProfile={parentProfile}
                students={students}
                studentStats={studentStats}
                slug={slug}
                parentId={userRes.data?.id || "demo-id"}
                phone={phone}
            />

        </div>
    );
}
