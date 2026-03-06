"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { RegionalConfig } from "@/components/dashboard/settings/RegionalConfig";
import { SettingsPageHeader, SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";
import { Globe } from "lucide-react";

export default function ConfigSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const res = await getSchoolSettingsAction(slug);
            if (res.success) setSchoolData(res.data);
            setIsLoading(false);
        }
        load();
    }, [slug]);

    if (isLoading) return <SettingsLoader message="Loading configuration..." />;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both" }}>
            <SettingsPageHeader
                icon={Globe}
                title="Regional Configuration"
                description="Configure language, timezone, currency and regional settings."
                color="#1E1B4B"
                bg="#EDE9FE"
            />
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #F3F4F6" }}>
                <RegionalConfig slug={slug} initialData={schoolData} />
            </div>
        </div>
    );
}
