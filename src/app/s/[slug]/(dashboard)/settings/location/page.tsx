"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { LocationForm } from "@/components/dashboard/settings/LocationForm";
import { MapPin, Building2, Map as MapIcon, Globe } from "lucide-react";

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

    if (loading) return null;
    if (!data) return null;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both", maxWidth: 1000 }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#3B82F6,#6366F1))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 59, 130, 246), 0.25)", flexShrink: 0 }}>
                        <MapPin size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>Location &amp; Maps</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Manage physical addresses, contact details, and precise geographic coordinates.</p>
                    </div>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Physical Address", value: data.address ? "Configured" : "None", color: data.address ? "#10B981" : "#F59E0B", bg: data.address ? "#D1FAE5" : "#FEF3C7", icon: Building2 },
                    { label: "Google Maps API", value: data.googleMapsApiKey ? "Active" : "Missing", color: data.googleMapsApiKey ? "#3B82F6" : "#EF4444", bg: data.googleMapsApiKey ? "#DBEAFE" : "#FEE2E2", icon: MapIcon },
                    { label: "Geo-Coordinates", value: data.latitude ? "Synced" : "Pending", color: data.latitude ? "#10B981" : "#F59E0B", bg: data.latitude ? "#D1FAE5" : "#FEF3C7", icon: Globe },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 16, padding: "16px 20px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <stat.icon size={20} color={stat.color} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <LocationForm slug={slug} initialData={data} />
        </div>
    );
}
