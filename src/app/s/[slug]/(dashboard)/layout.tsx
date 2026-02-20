import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SchoolTheme } from "@/components/dashboard/SchoolTheme";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { SidebarProvider } from "@/context/SidebarContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";
import { GlobalAuraWrapper } from "@/components/dashboard/GlobalAuraWrapper";
import { SessionTimeoutListener } from "@/components/dashboard/session/SessionTimeoutListener";

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : "174 123 100"; // fallback to #AE7B64
}

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // ============================================
    // AUTHENTICATION CHECK
    // ============================================
    const userRes = await getCurrentUserAction();

    if (!userRes.success || !userRes.data) {
        // Not authenticated - redirect to school login
        redirect(`/school-login`);
    }

    const user = userRes.data as any;

    // ============================================
    // AUTHORIZATION CHECK - Verify user belongs to this school
    // ============================================
    if (user.role !== "SUPER_ADMIN" && user.school?.slug !== slug) {
        // User doesn't belong to this school
        redirect(`/school-login`);
    }

    // ============================================
    // LOAD SCHOOL DATA
    // ============================================
    const school = (await prisma.school.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            logo: true,
            brandColor: true,
            secondaryColor: true,
            modulesConfig: true,
            timezone: true,
            dateFormat: true
        } as any
    })) as any;

    if (!school) {
        notFound();
    }

    // ============================================
    // SUBSCRIPTION CHECK - Block access if expired/suspended
    // ============================================
    if (user.role !== "SUPER_ADMIN") {
        try {
            const subscription = await prisma.subscription.findFirst({
                where: { schoolId: school.id },
                select: { status: true, endDate: true }
            });

            // Check if subscription is expired or inactive
            const now = new Date();
            const isExpired = subscription?.endDate && new Date(subscription.endDate) < now;
            const isInactive = subscription?.status === 'SUSPENDED' || subscription?.status === 'CANCELLED';

            if (isExpired || isInactive || !subscription) {
                redirect(`/s/${slug}/upgrade`);
            }
        } catch (subError) {
            console.error("Subscription check error:", subError);
            // On error, allow access rather than blocking the user
        }
    }

    const brandColor = school.brandColor || "#AE7B64";
    const brandColorRgb = hexToRgb(brandColor);

    const branches = await prisma.branch.findMany({
        where: { schoolId: school.id },
        select: { id: true, name: true }
    });

    const currentBranchId = user.currentBranchId || (branches.length > 0 ? branches[0].id : "");

    return (
        <SidebarProvider>
            <ConfirmProvider>
                <div
                    className="flex min-h-screen flex-row bg-zinc-50 dark:bg-zinc-900"
                    style={{
                        "--brand-color": brandColor,
                        "--brand-color-rgb": brandColorRgb,
                        "--secondary-color": school.secondaryColor || "#ffffff"
                    } as any}
                >
                    <SchoolTheme brandColor={brandColor} />
                    <Sidebar
                        schoolName={school.name}
                        logo={school.logo}
                        user={user}
                        enabledModules={(() => {
                            try {
                                return school.modulesConfig ? JSON.parse(school.modulesConfig) : [];
                            } catch (e) {
                                console.error("Layout Config Parse Error:", e);
                                return [];
                            }
                        })()}
                    />

                    <DashboardLayoutWrapper>
                        <Header
                            schoolName={school.name}
                            schoolTimezone={school.timezone}
                            branches={branches}
                            currentBranchId={currentBranchId}
                        />
                        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>
                        {/* Global AI Assistant */}
                        <GlobalAuraWrapper slug={slug} staffId={user.id} />

                        {/* STRICT SESSION TIMEOUT: 15 Minutes Idle */}
                        <SessionTimeoutListener timeoutMinutes={15} />
                    </DashboardLayoutWrapper>
                </div>
            </ConfirmProvider>
        </SidebarProvider>
    );
}
