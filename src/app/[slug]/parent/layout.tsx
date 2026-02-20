import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import MobileShell from "@/components/mobile/MobileShell";

async function getSchoolBySlug(slug: string) {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                brandColor: true,
                primaryColor: true,
                secondaryColor: true
            }
        });
        return school;
    } catch (error) {
        console.error("Error fetching school:", error);
        return null;
    }
}

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "37, 99, 235"; // Default blue
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export default async function ParentPortalLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const school = await getSchoolBySlug(slug) as any;

    if (!school) {
        notFound();
    }

    // AUTH CHECK
    const userRes = await getCurrentUserAction();
    if (!userRes.success || !userRes.data || (userRes.data.role !== "PARENT" && userRes.data.role !== "ADMIN")) {
        redirect("/parent-login");
    }

    const brandColor = school.brandColor || school.primaryColor || "#2563eb";
    const brandColorRgb = hexToRgb(brandColor);

    return (
        <div
            className="min-h-screen bg-[#F8FAFC]"
            style={{
                "--brand-color": brandColor,
                "--brand-color-rgb": brandColorRgb,
                "--secondary-color": school.secondaryColor || "#ffffff"
            } as any}
        >
            <MobileShell slug={school.slug} hideFooter={false}>
                {children}
            </MobileShell>
        </div>
    );
}
