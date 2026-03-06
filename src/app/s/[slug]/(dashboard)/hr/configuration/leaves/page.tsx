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
            {/* v3 Page Header */}
            <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 15,
                    background: "linear-gradient(135deg,#10B981,#059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 6px 20px #10B98145", flexShrink: 0,
                }}>
                    <CalendarDays size={24} color="white" strokeWidth={2} />
                </div>
                <div style={{ paddingTop: 3 }}>
                    <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>
                        Leave &amp; Attendance Policy
                    </h1>
                    <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        Define entitlements, punctuality grace periods, and short-leave permissions for each staff role.
                    </p>
                </div>
            </div>

            <LeavePolicyManager schoolSlug={slug} initialPolicies={policies} />
        </div>
    );
}
