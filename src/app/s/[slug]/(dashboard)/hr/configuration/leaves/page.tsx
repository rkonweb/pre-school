"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getLeavePoliciesAction } from "@/app/actions/leave-policy-actions";
import { LeavePolicyManager } from "@/components/dashboard/settings/LeavePolicyManager";
import { SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";
import { CalendarDays } from "lucide-react";

export default function LeavesSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [policies, setPolicies] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await getLeavePoliciesAction(slug);
            if (res.success) setPolicies(res.data || []);
            setIsLoading(false);
        }
        load();
    }, [slug]);

    if (isLoading) return <SettingsLoader message="Loading leave policies..." />;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both", maxWidth: 1100 }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                        <CalendarDays size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>Leave &amp; Attendance Policy</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Define entitlements, punctuality grace periods, and permissions for each role.</p>
                    </div>
                </div>
            </div>

            <LeavePolicyManager schoolSlug={slug} initialPolicies={policies} />
        </div>
    );
}
