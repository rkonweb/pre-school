import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, Trash2, CreditCard, Layout, Layers, ShieldCheck, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateListClient } from "./TemplateListClient";
import { CreateTemplateButton } from "./CreateTemplateButton";

export default async function IDCardTemplatesPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const school = await prisma.school.findUnique({
        where: { slug: slug },
        include: {
            idCardTemplates: true,
            idCardSettings: true
        }
    });

    if (!school) return <div>School not found</div>;

    const templates = await prisma.iDCardTemplate.findMany({
        where: {
            OR: [
                { schoolId: school.id },
                { isSystem: true, schoolId: null }
            ]
        },
        include: {
            childTemplates: {
                where: { schoolId: school.id }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex flex-col gap-6 pb-20">
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#06B6D4,#3B82F6))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 6, 182, 212), 0.25)", flexShrink: 0 }}>
                        <CreditCard size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>ID Card Templates</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Create and manage reusable ID card templates for students and staff.</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <CreateTemplateButton slug={slug} />
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Active Templates", value: templates.length.toString(), color: "#10B981", bg: "#D1FAE5", icon: Layers },
                    { label: "System Presets", value: templates.filter(t => t.isSystem).length.toString(), color: "#8B5CF6", bg: "#EDE9FE", icon: ShieldCheck },
                    { label: "Global Standard", value: "CR80 (86x54mm)", color: "#3B82F6", bg: "#DBEAFE", icon: FileType },
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

            <TemplateListClient
                slug={slug}
                schoolId={school.id}
                initialTemplates={templates}
            />
        </div>
    );
}
