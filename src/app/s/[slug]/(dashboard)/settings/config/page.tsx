"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { RegionalConfig } from "@/components/dashboard/settings/RegionalConfig";
import { SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";
import { Globe, Clock, CreditCard, Calendar } from "lucide-react";

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
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#06B6D4,#3B82F6))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 6, 182, 212), 0.25)", flexShrink: 0 }}>
                        <Globe size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>Regional Configuration</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Configure language, timezone, currency and regional settings.</p>
                    </div>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Base Currency", value: schoolData?.currency || "INR", color: "#10B981", bg: "#D1FAE5", icon: CreditCard },
                    { label: "System Timezone", value: (schoolData?.timezone || "Asia/Kolkata").split('/').pop()?.replace('_', ' ') || schoolData?.timezone, color: "#8B5CF6", bg: "#EDE9FE", icon: Clock },
                    { label: "Date Layout", value: schoolData?.dateFormat || "DD/MM/YYYY", color: "#3B82F6", bg: "#DBEAFE", icon: Calendar },
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
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #F3F4F6" }}>
                <RegionalConfig slug={slug} initialData={schoolData} />
            </div>
        </div>
    );
}
