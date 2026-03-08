"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getIdentifierConfigsAction } from "@/app/actions/identifier-actions";
import { IdentifierConfigForm } from "@/components/dashboard/settings/IdentifierConfigForm";
import { SettingsLoader, SettingsError } from "@/components/dashboard/settings/SettingsPageHeader";
import { Hash, Settings2, RefreshCw, Layers } from "lucide-react";

// ─── DESIGN TOKENS ──────────────────────────────────────────
const C = {
    amber: "var(--brand-color, #F59E0B)", amberD: "var(--brand-color, #D97706)", amberL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.12)",
    navy: "#1E1B4B",
    green: "#10B981", greenL: "#D1FAE5",
    red: "#EF4444", redL: "#FEE2E2",
    blue: "#3B82F6", blueL: "#DBEAFE",
    orange: "#F97316", orangeL: "#FFEDD5",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g400: "#9CA3AF", g600: "#4B5563",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
};

function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick }: any) {
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 } };
    const v = vs[variant] || vs.primary; const s = ss[size];
    const dis = disabled || loading;
    return (
        <button disabled={dis} onClick={onClick}
            onMouseEnter={e => { if (!dis) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1 }}>
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTopColor: v.color, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

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
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                        <Hash size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, lineHeight: 1.2 }}>Record Formats</h1>
                        <p style={{ fontSize: 13.5, color: C.g400, margin: "5px 0 0", fontWeight: 500 }}>Define custom prefixes, suffixes, and sequences for generated documents.</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn icon={RefreshCw} variant="secondary" size="md" onClick={() => window.location.reload()}>
                        Refresh
                    </Btn>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Active Configurations", value: "4 Formats", color: C.blue, bg: C.blueL, icon: Layers },
                    { label: "Pattern Health", value: data ? "Valid" : "Needs Sync", color: data ? C.green : C.orange, bg: data ? C.greenL : C.orangeL, icon: Hash },
                    { label: "System Status", value: "Operational", color: C.green, bg: C.greenL, icon: Settings2 },
                ].map((stat: any, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 16, padding: "16px 20px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <stat.icon size={20} color={stat.color} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: C.g400, fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: "white", borderRadius: 24, padding: "32px", boxShadow: C.sh, border: `1px solid ${C.g100}`, animation: "fadeUp 0.45s ease 0.14s both" }}>
                <IdentifierConfigForm slug={slug} initialConfigs={data} />
            </div>
        </div>
    );
}
