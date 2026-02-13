import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SchoolTheme } from "@/components/dashboard/SchoolTheme";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "37, 99, 235"; // fallback to blue-600
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
            name: true,
            logo: true,
            brandColor: true,
            modulesConfig: true,
            timezone: true,
            dateFormat: true
        } as any
    })) as any;

    if (!school) {
        notFound();
    }

    const brandColor = school.brandColor || "#2563eb";
    const brandColorRgb = hexToRgb(brandColor);

    return (
        <div
            className="flex min-h-screen flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-900"
            style={{
                "--brand-color": brandColor,
                "--brand-color-rgb": brandColorRgb
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
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header schoolTimezone={school.timezone} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
