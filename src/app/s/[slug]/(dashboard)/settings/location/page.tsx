"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { LocationForm } from "@/components/dashboard/settings/LocationForm";
import { SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";
import { MapPin } from "lucide-react";

export default function LocationSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSchoolSettingsAction(slug).then(res => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, [slug]);

    if (loading) return <SettingsLoader message="Loading location settings..." />;
    if (!data) return null;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both", maxWidth: 1000 }}>
            {/* v3 Page Header */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                    background: "linear-gradient(135deg,#3B82F6,#6366F1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 6px 20px #3B82F645",
                }}>
                    <MapPin size={24} color="white" strokeWidth={2} />
                </div>
                <div style={{ paddingTop: 3 }}>
                    <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>
                        Location &amp; Physicality
                    </h1>
                    <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        Manage branch addresses, contact details, and map coordinates.
                    </p>
                </div>
            </div>

            <LocationForm slug={slug} initialData={data} />
        </div>
    );
}
