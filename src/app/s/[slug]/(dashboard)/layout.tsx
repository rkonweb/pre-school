import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SchoolTheme } from "@/components/dashboard/SchoolTheme";
import { prisma, withReconnect } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { SidebarProvider } from "@/context/SidebarContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ClassTeacherProvider } from "@/contexts/ClassTeacherContext";
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";
import { GlobalAuraWrapper } from "@/components/dashboard/GlobalAuraWrapper";
import { AuraProvider } from "@/context/AuraContext";
import { SessionTimeoutListener } from "@/components/dashboard/session/SessionTimeoutListener";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const school = await withReconnect(() =>
        prisma.school.findUnique({ where: { slug }, select: { name: true, motto: true } })
    );

    if (!school) return { title: "School Portal | Bodhi Board" };

    return {
        title: `${school.name} | Staff Portal`,
        description: school.motto || `Official staff and administration portal for ${school.name}. Powered by Bodhi Board.`
    };
}

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
        redirect(`/school-login`);
    }

    const user = userRes.data as any;

    // ============================================
    // AUTHORIZATION CHECK - Verify user belongs to this school
    // ============================================
    if (user.role !== "SUPER_ADMIN" && user.school?.slug !== slug) {
        redirect(`/school-login`);
    }

    // ============================================
    // LOAD SCHOOL DATA
    // ============================================
    const school = (await withReconnect(() => prisma.school.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            logo: true,
            brandColor: true,
            secondaryColor: true,
            gradientConfig: true,
            modulesConfig: true,
            timezone: true,
            dateFormat: true,
            currency: true
        } as any
    }))) as any;

    if (!school) {
        notFound();
    }

    // ============================================
    // SUBSCRIPTION CHECK - Block access if expired/suspended
    // ============================================
    if (user.role !== "SUPER_ADMIN") {
        try {
            const subscription = await withReconnect(() => prisma.subscription.findFirst({
                where: { schoolId: school.id },
                select: { status: true, endDate: true }
            }));

            const now = new Date();
            const isExpired = subscription?.endDate && new Date(subscription.endDate) < now;
            const isInactive = subscription?.status === 'SUSPENDED' || subscription?.status === 'CANCELLED';

            if (isExpired || isInactive || !subscription) {
                if (process.env.NODE_ENV !== "development") {
                    redirect(`/s/${slug}/upgrade`);
                } else {
                    console.log("Development Mode: Skipped subscription redirect.");
                }
            }
        } catch (subError) {
            console.error("Subscription check error:", subError);
        }
    }

    const brandColor = school.brandColor || "#AE7B64";
    const brandColorRgb = hexToRgb(brandColor);

    // Parse gradient config and build the CSS gradient string
    let schoolGradient = `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`;
    try {
        const gc = school.gradientConfig ? JSON.parse(school.gradientConfig) : {};
        if (gc.from && gc.to) {
            const angle = gc.angle ?? 135;
            const style = gc.style || "linear";
            schoolGradient = style === "radial"
                ? `radial-gradient(circle, ${gc.from}, ${gc.to})`
                : `linear-gradient(${angle}deg, ${gc.from}, ${gc.to})`;
        }
    } catch (e) { /* keep default */ }

    const branches = await withReconnect(() => prisma.branch.findMany({
        where: { schoolId: school.id },
        select: { id: true, name: true }
    }));

    const currentBranchId = user.currentBranchId || (branches.length > 0 ? branches[0].id : "");

    return (
        <AdminAuthProvider>
            <AuraProvider>
            <SidebarProvider currency={school.currency || "INR"}>
                <ConfirmProvider>
                    <div
                        className="flex h-screen overflow-hidden flex-row bg-zinc-50 dark:bg-zinc-900"
                        style={{
                            "--brand-color": brandColor,
                            "--brand-color-rgb": brandColorRgb,
                            "--secondary-color": school.secondaryColor || "#ffffff",
                            "--school-gradient": schoolGradient,
                        } as any}
                    >
                        {/* Propagate CSS variables to document.documentElement for portals/dialogs */}
                        <SchoolTheme brandColor={brandColor} schoolGradient={schoolGradient} />

                        {/* Accessibility: Skip to main content link */}
                        <a 
                            href="#main-content" 
                            className="absolute left-[-9999px] top-4 z-[10000] rounded-lg bg-white px-4 py-2 text-rose-600 font-bold focus:left-4 focus:outline-none focus:ring-4 focus:ring-rose-500/20 shadow-xl border border-zinc-100"
                        >
                            Skip to main content
                        </a>

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

                        <ClassTeacherProvider schoolSlug={slug}>
                        <DashboardLayoutWrapper>
                            <Header
                                schoolName={school.name}
                                schoolTimezone={school.timezone}
                                branches={branches}
                                currentBranchId={currentBranchId}
                            />
                            <main id="main-content" className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
                                {children}
                            </main>
                            {/* Global AI Assistant */}
                            <GlobalAuraWrapper slug={slug} staffId={user.id} />

                            {/* STRICT SESSION TIMEOUT: 15 Minutes Idle */}
                            <SessionTimeoutListener timeoutMinutes={15} />
                        </DashboardLayoutWrapper>
                        </ClassTeacherProvider>
                    </div>
                </ConfirmProvider>
            </SidebarProvider>
            </AuraProvider>
        </AdminAuthProvider>
    );
}
