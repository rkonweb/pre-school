"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { IdentityForm } from "@/components/dashboard/settings/IdentityForm";
import { SettingsPageHeader, SettingsLoader, SettingsError } from "@/components/dashboard/settings/SettingsPageHeader";
import { Building2 } from "lucide-react";

export default function IdentitySettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getSchoolSettingsAction(slug);
            if (res.success) setSchoolData(res.data);
            else setError(res.error || "Failed to load institutional identity.");
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, [slug]);

    if (isLoading) return <SettingsLoader message="Loading identity..." />;
    if (error || !schoolData) return <SettingsError message={error || "School profile could not be loaded."} onRetry={load} />;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both" }}>
            <SettingsPageHeader
                icon={Building2}
                title="Institutional Identity"
                description="Branding, logos, mission statement, theme colors and registered phone."
                color="#F59E0B"
                bg="#FEF3C7"
            />
            <IdentityForm slug={slug} initialData={schoolData} />
        </div>
    );
}
