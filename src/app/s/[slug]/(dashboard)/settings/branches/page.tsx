import { BranchList } from "@/components/dashboard/settings/BranchList";
import { getBranchesAction } from "@/app/actions/branch-actions";
import { validateUserSchoolAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function BranchSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const auth = await validateUserSchoolAction(slug);
    if (!auth.success || !auth.user) {
        redirect("/school-login");
    }

    if (auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN") {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    const { data: branches, error } = await getBranchesAction(slug);

    if (error || !branches) {
        return <div className="p-8 text-center text-red-500">Failed to load branches: {error}</div>;
    }

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
    };

    const maxBranches = auth.user.school?.maxBranches ?? 1;
    const isAtLimit = branches.length >= maxBranches;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both", paddingBottom: 80 }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                        <Building2 size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, lineHeight: 1.2 }}>Branch Network</h1>
                        <p style={{ fontSize: 13.5, color: C.g400, margin: "5px 0 0", fontWeight: 500 }}>Manage physical campuses, locations, and branch-specific configurations.</p>
                    </div>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Active Branches", value: branches.length.toString(), color: C.blue, bg: C.blueL, icon: Building2 },
                    { label: "Branch Limit", value: `${branches.length} / ${maxBranches}`, color: isAtLimit ? C.orange : C.green, bg: isAtLimit ? C.orangeL : C.greenL, icon: ShieldCheck },
                    { label: "System Status", value: "Operational", color: C.green, bg: C.greenL, icon: CheckCircle2 },
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

            <BranchList branches={branches} slug={slug} maxBranches={maxBranches} />
        </div>
    );
}
