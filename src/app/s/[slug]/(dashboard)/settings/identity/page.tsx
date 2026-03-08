"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { IdentityForm } from "@/components/dashboard/settings/IdentityForm";
import { SettingsLoader, SettingsError } from "@/components/dashboard/settings/SettingsPageHeader";
import { 
    Building2, Palette, Shield, Sparkles, RefreshCcw, Save 
} from "lucide-react";

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

    const hasLogo = !!schoolData.logo;
    const hasColors = !!(schoolData.brandColor && schoolData.secondaryColor);
    const isPhoneVerified = !!schoolData.mobile; // Simplified check for stats

    return (
        <div style={{ animation: "fadeUp 0.45s ease both", paddingBottom: 60 }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                        <Building2 size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>Institutional Identity</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Branding, logos, mission statement, theme colors and registered phone.</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", color: "#1E1B4B", fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "none"; }}
                    >
                        <RefreshCcw size={16} /> Discard
                    </button>
                    <button 
                        id="save-identity-btn"
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
                    >
                        <Save size={16} /> Save Identity
                    </button>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Theme Status", value: hasColors ? "Configured" : "Pending", color: hasColors ? "#10B981" : "#F59E0B", bg: hasColors ? "#D1FAE5" : "rgba(245, 158, 11, 0.1)", icon: Palette },
                    { label: "Phone Security", value: isPhoneVerified ? "Verified" : "Unverified", color: isPhoneVerified ? "#10B981" : "#EF4444", bg: isPhoneVerified ? "#D1FAE5" : "#FEE2E2", icon: Shield },
                    { label: "Brand Status", value: hasLogo ? "Active" : "Incomplete", color: hasLogo ? "#3B82F6" : "#F59E0B", bg: hasLogo ? "#DBEAFE" : "rgba(245, 158, 11, 0.12)", icon: Sparkles },
                ].map((stat: any, i) => (
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

            <IdentityForm slug={slug} initialData={schoolData} />
        </div>
    );
}
