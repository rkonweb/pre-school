"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Brain, MessageCircle, Heart, Activity, Palette,
    Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
    Loader2, Settings, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    getDevelopmentDomainsAction,
    seedDefaultDomainsAction,
    createDevelopmentDomainAction,
    updateDevelopmentDomainAction,
    deleteDevelopmentDomainAction,
    createMilestoneAction,
    updateMilestoneAction,
    deleteMilestoneAction,
    createSkillItemAction,
    deleteSkillItemAction,
} from "@/app/actions/development-actions";
import { getSchoolBySlugAction } from "@/app/actions/parent-actions";
import { SettingsPageHeader, SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";

const DOMAIN_ICONS: Record<string, any> = {
    Brain, MessageCircle, Heart, Activity, Palette,
};

const ICON_OPTIONS = ["Brain", "MessageCircle", "Heart", "Activity", "Palette"];
const COLOR_OPTIONS = [
    "#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899",
    "#8b5cf6", "#f97316", "#14b8a6", "#ef4444", "#64748b",
];

export default function DevelopmentSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [schoolId, setSchoolId] = useState<string>("");
    const [domains, setDomains] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

    // Domain form
    const [showAddDomain, setShowAddDomain] = useState(false);
    const [domainForm, setDomainForm] = useState({ name: "", description: "", color: "#6366f1", icon: "Brain" });
    const [savingDomain, setSavingDomain] = useState(false);
    const [editingDomainId, setEditingDomainId] = useState<string | null>(null);

    // Milestone form
    const [milestoneInputs, setMilestoneInputs] = useState<Record<string, { title: string; ageGroup: string }>>({});
    const [addingMilestone, setAddingMilestone] = useState<string | null>(null);

    // Skill form
    const [skillInputs, setSkillInputs] = useState<Record<string, string>>({});
    const [addingSkill, setAddingSkill] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setLoading(true);
        const schoolRes = await getSchoolBySlugAction(slug);
        if (schoolRes.success && schoolRes.school) {
            const sid = schoolRes.school.id;
            setSchoolId(sid);
            await seedDefaultDomainsAction(sid);
            const domainsRes = await getDevelopmentDomainsAction(sid);
            if (domainsRes.success) setDomains(domainsRes.data || []);
        }
        setLoading(false);
    }

    const handleAddDomain = async () => {
        if (!domainForm.name.trim()) return toast.error("Domain name required");
        setSavingDomain(true);
        const res = await createDevelopmentDomainAction(schoolId, domainForm);
        if (res.success) {
            toast.success("Domain created");
            setShowAddDomain(false);
            setDomainForm({ name: "", description: "", color: "#6366f1", icon: "Brain" });
            loadData();
        } else toast.error("Failed to create domain");
        setSavingDomain(false);
    };

    const handleUpdateDomain = async (domainId: string, data: any) => {
        const res = await updateDevelopmentDomainAction(domainId, data);
        if (res.success) { toast.success("Updated"); loadData(); setEditingDomainId(null); }
        else toast.error("Failed to update");
    };

    const handleDeleteDomain = async (domainId: string) => {
        if (!confirm("Delete this domain and all its milestones/skills?")) return;
        const res = await deleteDevelopmentDomainAction(domainId);
        if (res.success) { toast.success("Deleted"); loadData(); }
        else toast.error("Failed to delete");
    };

    const handleAddMilestone = async (domainId: string) => {
        const input = milestoneInputs[domainId];
        if (!input?.title?.trim()) return toast.error("Milestone title required");
        setAddingMilestone(domainId);
        const res = await createMilestoneAction(domainId, { title: input.title, ageGroup: input.ageGroup || "3-5 years" });
        if (res.success) {
            toast.success("Milestone added");
            setMilestoneInputs(prev => ({ ...prev, [domainId]: { title: "", ageGroup: "" } }));
            loadData();
        } else toast.error("Failed to add milestone");
        setAddingMilestone(null);
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        const res = await deleteMilestoneAction(milestoneId);
        if (res.success) { toast.success("Deleted"); loadData(); }
        else toast.error("Failed to delete");
    };

    const handleAddSkill = async (domainId: string) => {
        const name = skillInputs[domainId];
        if (!name?.trim()) return toast.error("Skill name required");
        setAddingSkill(domainId);
        const res = await createSkillItemAction(domainId, { name });
        if (res.success) {
            toast.success("Skill added");
            setSkillInputs(prev => ({ ...prev, [domainId]: "" }));
            loadData();
        } else toast.error("Failed to add skill");
        setAddingSkill(null);
    };

    const handleDeleteSkill = async (skillId: string) => {
        const res = await deleteSkillItemAction(skillId);
        if (res.success) { toast.success("Deleted"); loadData(); }
        else toast.error("Failed to delete");
    };

    if (loading) return <SettingsLoader message="Loading tracking configurations..." />;

    // Calculate totals for stats bar
    const totalDomains = domains.length;
    const totalMilestones = domains.reduce((acc, curr) => acc + (curr.milestones?.length || 0), 0);
    const totalSkills = domains.reduce((acc, curr) => acc + (curr.skills?.length || 0), 0);

    return (
        <div className="max-w-4xl mx-auto pb-20 mt-6" style={{ animation: "fadeUp 0.45s ease both" }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#06B6D4,#3B82F6))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 6, 182, 212), 0.25)", flexShrink: 0 }}>
                        <Activity size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "#1E1B4B", margin: 0, lineHeight: 1.2 }}>Development Domains</h1>
                        <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: "5px 0 0", fontWeight: 500 }}>Manage developmental tracking domains, milestones, and skills.</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => setShowAddDomain(true)}
                        style={{ padding: "10px 22px", borderRadius: 12, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.4)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
                    >
                        <Plus className="h-4 w-4" /> Add Domain
                    </button>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Active Domains", value: totalDomains.toString(), color: "#10B981", bg: "#D1FAE5", icon: Brain },
                    { label: "Total Milestones", value: totalMilestones.toString(), color: "#8B5CF6", bg: "#EDE9FE", icon: CheckCircle2 },
                    { label: "Tracked Skills", value: totalSkills.toString(), color: "#3B82F6", bg: "#DBEAFE", icon: Settings },
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

            {/* Add Domain Form */}
            {showAddDomain && (
                <div className="bg-white rounded-[24px] border border-zinc-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-zinc-900">New Development Domain</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name *</label>
                            <input
                                value={domainForm.name}
                                onChange={(e) => setDomainForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Cognitive"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</label>
                            <input
                                value={domainForm.description}
                                onChange={(e) => setDomainForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Brief description..."
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Icon</label>
                            <div className="flex gap-2 flex-wrap">
                                {ICON_OPTIONS.map((icon) => {
                                    const Icon = DOMAIN_ICONS[icon];
                                    return (
                                        <button
                                            key={icon}
                                            onClick={() => setDomainForm(p => ({ ...p, icon }))}
                                            className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all border",
                                                domainForm.icon === icon ? "border-transparent" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-400"
                                            )}
                                            style={domainForm.icon === icon ? { backgroundColor: "var(--brand-color, #F59E0B)", color: "var(--secondary-color, white)" } : undefined}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setDomainForm(p => ({ ...p, color }))}
                                        className={cn(
                                            "h-8 w-8 rounded-lg transition-all border-2",
                                            domainForm.color === color ? "border-zinc-900 scale-110" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAddDomain} disabled={savingDomain}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                            style={{ background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", border: "none" }}
                            onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                            onMouseLeave={e => e.currentTarget.style.filter = "none"}
                        >
                            {savingDomain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Create Domain
                        </button>
                        <button onClick={() => setShowAddDomain(false)}
                            className="px-5 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-black hover:bg-zinc-200 transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Domains List */}
            <div className="space-y-4">
                {domains.map((domain) => {
                    const Icon = DOMAIN_ICONS[domain.icon] || Brain;
                    const isOpen = expandedDomain === domain.id;
                    const isEditing = editingDomainId === domain.id;

                    return (
                        <div key={domain.id} className="bg-white rounded-[24px] border border-zinc-100 shadow-sm overflow-hidden">
                            {/* Domain Header */}
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: domain.color + "20" }}>
                                        <Icon className="h-5 w-5" style={{ color: domain.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-zinc-900">{domain.name}</h3>
                                        <p className="text-xs text-zinc-500">{domain.description}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-[10px] text-zinc-400 font-bold">{domain.milestones?.length || 0} milestones</span>
                                            <span className="text-[10px] text-zinc-400 font-bold">{domain.skills?.length || 0} skills</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setExpandedDomain(isOpen ? null : domain.id)}
                                        className="h-9 w-9 rounded-xl bg-zinc-50 text-zinc-500 flex items-center justify-center hover:bg-zinc-100 transition-all"
                                    >
                                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDomain(domain.id)}
                                        className="h-9 w-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isOpen && (
                                <div className="border-t border-zinc-100 p-5 space-y-6">
                                    {/* Milestones */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Milestones</h4>
                                        <div className="space-y-2 mb-3">
                                            {domain.milestones?.map((m: any) => (
                                                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 group">
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-800">{m.title}</p>
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{m.ageGroup}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMilestone(m.id)}
                                                        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Add Milestone */}
                                        <div className="flex gap-2">
                                            <input
                                                value={milestoneInputs[domain.id]?.title || ""}
                                                onChange={(e) => setMilestoneInputs(prev => ({
                                                    ...prev,
                                                    [domain.id]: { ...prev[domain.id] || { ageGroup: "3-5 years" }, title: e.target.value }
                                                }))}
                                                placeholder="New milestone title..."
                                                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-1 transition-all"
                                                style={{ "--tw-ring-color": "rgba(var(--brand-color-rgb, 245, 158, 11), 0.3)" } as React.CSSProperties}
                                            />
                                            <input
                                                value={milestoneInputs[domain.id]?.ageGroup || ""}
                                                onChange={(e) => setMilestoneInputs(prev => ({
                                                    ...prev,
                                                    [domain.id]: { ...prev[domain.id] || { title: "" }, ageGroup: e.target.value }
                                                }))}
                                                placeholder="Age group"
                                                className="w-28 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleAddMilestone(domain.id)}
                                                disabled={addingMilestone === domain.id}
                                                className="px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                                                style={{ backgroundColor: "var(--brand-color, #F59E0B)", color: "var(--secondary-color, white)" }}
                                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                                                onMouseLeave={e => e.currentTarget.style.filter = "none"}
                                            >
                                                {addingMilestone === domain.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Skill Items</h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {domain.skills?.map((s: any) => (
                                                <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 group">
                                                    <span className="text-sm font-bold text-zinc-700">{s.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteSkill(s.id)}
                                                        className="opacity-0 group-hover:opacity-100 h-4 w-4 rounded text-red-400 hover:text-red-600 transition-all"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Add Skill */}
                                        <div className="flex gap-2">
                                            <input
                                                value={skillInputs[domain.id] || ""}
                                                onChange={(e) => setSkillInputs(prev => ({ ...prev, [domain.id]: e.target.value }))}
                                                placeholder="New skill name..."
                                                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-1 transition-all"
                                                style={{ "--tw-ring-color": "rgba(var(--brand-color-rgb, 245, 158, 11), 0.3)" } as React.CSSProperties}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddSkill(domain.id)}
                                            />
                                            <button
                                                onClick={() => handleAddSkill(domain.id)}
                                                disabled={addingSkill === domain.id}
                                                className="px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                                                style={{ backgroundColor: "var(--brand-color, #F59E0B)", color: "var(--secondary-color, white)" }}
                                                onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                                                onMouseLeave={e => e.currentTarget.style.filter = "none"}
                                            >
                                                {addingSkill === domain.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
