"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getIdentifierConfigsAction } from "@/app/actions/identifier-actions";
import { IdentifierConfigForm } from "@/components/dashboard/settings/IdentifierConfigForm";
import { SettingsPageHeader, SettingsLoader, SettingsError } from "@/components/dashboard/settings/SettingsPageHeader";
import { Hash } from "lucide-react";

export default function IdentifiersSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getIdentifierConfigsAction(slug).then(res => {
            if (res.success) setData(res.data);
            else setError(res.error || "Failed to load identifier configurations.");
            setLoading(false);
        });
    }, [slug]);

    if (loading) return <SettingsLoader message="Loading identifiers..." />;
    if (error) return <SettingsError message={error} />;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both" }}>
            <SettingsPageHeader
                icon={Hash}
                title="Auto-Identifier Formats"
                description="Define custom prefixes, suffixes, and numbering sequences for various documents and records."
                color="#F97316"
                bg="#FFEDD5"
            />
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #F3F4F6" }}>
                <IdentifierConfigForm slug={slug} initialConfigs={data} />
            </div>
        </div>
    );
}
