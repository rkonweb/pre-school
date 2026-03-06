import { OTPLogin } from "@/components/figma/login/OTPLogin";
import { Suspense } from "react";
import { getTenantsAction } from "@/app/actions/tenant-actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface SlugVerifyOtpPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: SlugVerifyOtpPageProps): Promise<Metadata> {
    const { slug } = await params;
    const tenants = await getTenantsAction();
    const tenant = tenants.find(t => t.subdomain === slug || t.customDomain === slug || t.id.toLowerCase() === slug.toLowerCase());

    if (tenant) {
        return { title: `Verify OTP | ${tenant.name}` };
    }

    return { title: 'Page Not Found' };
}

export default async function SlugVerifyOtpPage({ params }: SlugVerifyOtpPageProps) {
    const { slug } = await params;

    const tenants = await getTenantsAction();
    const tenant = tenants.find(t => t.subdomain === slug || t.customDomain === slug || t.id.toLowerCase() === slug.toLowerCase());

    if (!tenant) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OTPLogin type="school" tenantName={tenant.name} brandColor={tenant.brandColor} />
        </Suspense>
    );
}
