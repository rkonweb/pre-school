import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getParentDashboardDataAction } from "@/app/actions/parent-actions";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";

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
                    {/* Persistent Bottom Nav */}
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 pointer-events-none z-50">
                        <div className="bg-summer-navy rounded-[32px] p-2 flex justify-between items-center shadow-2xl pointer-events-auto">
                            <div className="w-14 h-14 bg-summer-teal rounded-full flex items-center justify-center text-white shadow-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            </div>
                            <div className="p-4 text-white/40">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div className="p-4 text-white/40">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                        </div>
                    </div>
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

            {/* Unified Bottom Nav */}
            <MobileBottomNav slug={slug} activeTab="HOME" preview={preview === "true"} />
        </div>
    );
}
