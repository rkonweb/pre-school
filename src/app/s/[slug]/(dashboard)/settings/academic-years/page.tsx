"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    CalendarDays, Plus, CheckCircle2, Edit2, Archive,
    Calendar, Settings2, RefreshCw, X, Check,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAcademicYearsAction, createAcademicYearAction, updateAcademicYearAction } from "@/app/actions/academic-year-actions";
import { SettingsPageHeader, SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";

// ─── DESIGN TOKENS ──────────────────────────────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redL: "#FEE2E2",
    blue: "#3B82F6", blueL: "#DBEAFE",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    orange: "#F97316",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
};

function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, fullWidth }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<any>();
    const vs: any = {
        primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", sh: `0 4px 16px ${C.amber}45` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},#DC2626)`, color: "white", sh: `0 4px 14px ${C.red}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 }, lg: { p: "13px 26px", fs: 15, r: 14 } };
    const v = vs[variant] || vs.primary; const s = ss[size];
    const dis = disabled || loading;
    const handleClick = (e: any) => {
        if (dis) return;
        const rect = ref.current.getBoundingClientRect();
        const id = Date.now();
        setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.();
    };
    return (
        <button ref={ref} disabled={dis} onClick={handleClick}
            onMouseEnter={e => { if (!dis) { (e.currentTarget as any).style.filter = "brightness(1.08)"; (e.currentTarget as any).style.transform = "translateY(-2px) scale(1.02)"; } }}
            onMouseLeave={e => { (e.currentTarget as any).style.filter = "none"; (e.currentTarget as any).style.transform = "none"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? "100%" : "auto", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

function FInput({ label, type = "text", value, onChange, placeholder, required }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6 }}>
                {label}{required && <span style={{ color: C.red }}> *</span>}
            </label>
            <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ width: "100%", border: `1.5px solid ${focused ? C.amber : C.g200}`, borderRadius: 11, padding: "10px 14px", fontSize: 13.5, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, background: focused ? C.amberXL : C.g50, transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.amber}20` : "none" }} />
        </div>
    );
}

export default function AcademicYearsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [years, setYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingYear, setEditingYear] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "", isCurrent: false });

    useEffect(() => { loadData(); }, [slug]);

    async function loadData() {
        setIsLoading(true);
        try {
            const res = await getAcademicYearsAction(slug);
            if (res.success) setYears(res.data || []);
        } catch { toast.error("Failed to load academic years"); }
        finally { setIsLoading(false); }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                isCurrent: formData.isCurrent,
            };
            const res = editingYear
                ? await updateAcademicYearAction(slug, editingYear.id, payload)
                : await createAcademicYearAction(slug, payload);
            if (res.success) {
                toast.success(editingYear ? "Year updated" : "Year created");
                setShowForm(false); setEditingYear(null);
                setFormData({ name: "", startDate: "", endDate: "", isCurrent: false });
                loadData();
            } else toast.error(res.error || "Operation failed");
        } catch { toast.error("An error occurred"); }
        finally { setIsSubmitting(false); }
    }

    function handleEdit(year: any) {
        setEditingYear(year);
        setFormData({
            name: year.name,
            startDate: format(new Date(year.startDate), "yyyy-MM-dd"),
            endDate: format(new Date(year.endDate), "yyyy-MM-dd"),
            isCurrent: year.isCurrent,
        });
        setShowForm(true);
    }

    async function handleSetCurrent(id: string) {
        try {
            const res = await updateAcademicYearAction(slug, id, { isCurrent: true });
            if (res.success) { toast.success("Current academic year updated"); loadData(); }
        } catch { toast.error("Failed to update"); }
    }

    if (isLoading) return <SettingsLoader message="Loading academic years..." />;

    const currentYear = years.find(y => y.isCurrent);

    return (
        <div style={{ animation: "fadeUp 0.45s ease both" }}>
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
                @keyframes slideRight{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
                @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
            `}</style>

            <SettingsPageHeader
                icon={CalendarDays}
                title="Academic Years"
                description="Manage and define institutional calendar cycles and active periods."
                color={C.green}
                bg={C.greenL}
                action={
                    <div style={{ display: "flex", gap: 10 }}>
                        <Btn icon={RefreshCw} variant="secondary" size="sm" onClick={loadData}>Refresh</Btn>
                        <Btn icon={Plus} variant="primary" size="md" onClick={() => { setEditingYear(null); setFormData({ name: "", startDate: "", endDate: "", isCurrent: false }); setShowForm(true); }}>
                            Add Year
                        </Btn>
                    </div>
                }
            />

            {/* Add/Edit Modal */}
            {showForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.6)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", animation: "scaleIn 0.2s ease" }}
                    onClick={() => setShowForm(false)}>
                    <div style={{ background: "white", borderRadius: 28, padding: 36, width: "90%", maxWidth: 520, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", animation: "scaleIn 0.3s ease" }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.green},${C.greenD})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Calendar size={18} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.navy, margin: 0 }}>
                                        {editingYear ? "Edit Year" : "Add Academic Year"}
                                    </h2>
                                    <p style={{ fontSize: 12.5, color: C.g400, margin: 0, marginTop: 2 }}>Define the institutional period</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={14} color={C.g500} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <FInput label="Year Name" placeholder="e.g. 2024-2025" value={formData.name} required onChange={(e: any) => setFormData(f => ({ ...f, name: e.target.value }))} />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <FInput label="Start Date" type="date" value={formData.startDate} required onChange={(e: any) => setFormData(f => ({ ...f, startDate: e.target.value }))} />
                                <FInput label="End Date" type="date" value={formData.endDate} required onChange={(e: any) => setFormData(f => ({ ...f, endDate: e.target.value }))} />
                            </div>

                            {/* Current Session Toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: C.g50, borderRadius: 12, border: `1.5px solid ${C.g200}` }}>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.g800 }}>Mark as Current Session</div>
                                    <div style={{ fontSize: 11.5, color: C.g400 }}>Sets as the active institutional period</div>
                                </div>
                                <div onClick={() => setFormData(f => ({ ...f, isCurrent: !f.isCurrent }))}
                                    style={{ width: 46, height: 26, borderRadius: 13, background: formData.isCurrent ? C.green : C.g200, position: "relative", cursor: "pointer", transition: `background 0.4s ${C.spring}`, boxShadow: formData.isCurrent ? `0 3px 12px ${C.green}55` : "none", flexShrink: 0 }}>
                                    <div style={{ position: "absolute", top: 3, left: formData.isCurrent ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.25)", transition: `left 0.4s ${C.spring}` }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                                <Btn variant="primary" icon={Check} loading={isSubmitting} fullWidth onClick={() => { }}>
                                    {editingYear ? "Update Year" : "Create Year"}
                                </Btn>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
                {/* Years List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {years.length === 0 ? (
                        <div style={{ background: "white", borderRadius: 20, padding: "60px 40px", textAlign: "center", boxShadow: C.sh, border: `2px dashed ${C.g200}` }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: C.greenL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "float 3s ease-in-out infinite" }}>
                                <Calendar size={28} color={C.green} />
                            </div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 6 }}>No Academic Years Found</div>
                            <p style={{ fontSize: 13.5, color: C.g400, marginBottom: 20 }}>Add your first academic year to organize institutional records.</p>
                            <Btn icon={Plus} variant="primary" onClick={() => setShowForm(true)}>Add First Year</Btn>
                        </div>
                    ) : (
                        years.map((year, i) => (
                            <div key={year.id} className="group" style={{
                                background: "white", borderRadius: 18,
                                border: `1.5px solid ${year.isCurrent ? C.green + "50" : C.g100}`,
                                padding: "18px 22px",
                                boxShadow: year.isCurrent ? `0 6px 24px ${C.green}20` : C.sh,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: C.tr, animation: `slideRight 0.3s ease ${i * 0.07}s both`,
                                position: "relative", overflow: "hidden",
                            }}
                                onMouseEnter={e => { (e.currentTarget as any).style.transform = "translateX(3px)"; }}
                                onMouseLeave={e => { (e.currentTarget as any).style.transform = "none"; }}>

                                {year.isCurrent && (
                                    <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at top right,${C.green}10,transparent)`, pointerEvents: "none" }} />
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                        background: year.isCurrent ? `linear-gradient(135deg,${C.green},${C.greenD})` : C.g100,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: year.isCurrent ? `0 4px 12px ${C.green}40` : "none",
                                    }}>
                                        <Calendar size={20} color={year.isCurrent ? "white" : C.g400} />
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy, margin: 0 }}>
                                                {year.name}
                                            </h3>
                                            {year.isCurrent && (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.greenL, color: C.greenD, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                                                    <CheckCircle2 size={11} /> Current Session
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.g500 }}>
                                            <CalendarDays size={12} color={C.g400} />
                                            {format(new Date(year.startDate), "MMM d, yyyy")}
                                            <span style={{ fontSize: 10, color: C.g300 }}>—</span>
                                            {format(new Date(year.endDate), "MMM d, yyyy")}
                                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.g300 }} />
                                            <span style={{ textTransform: "capitalize" }}>{year.status?.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    {!year.isCurrent && (
                                        <button onClick={() => handleSetCurrent(year.id)}
                                            style={{ padding: "6px 14px", borderRadius: 9, border: `1.5px solid ${C.green}40`, background: C.greenXL, color: C.greenD, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: C.tr }}
                                            onMouseEnter={e => { (e.currentTarget as any).style.background = C.green; (e.currentTarget as any).style.color = "white"; }}
                                            onMouseLeave={e => { (e.currentTarget as any).style.background = C.greenXL; (e.currentTarget as any).style.color = C.greenD; }}>
                                            Set Current
                                        </button>
                                    )}
                                    <button onClick={() => handleEdit(year)}
                                        style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: C.tr }}
                                        onMouseEnter={e => { (e.currentTarget as any).style.background = C.amberL; (e.currentTarget as any).style.borderColor = C.amber; }}
                                        onMouseLeave={e => { (e.currentTarget as any).style.background = "white"; (e.currentTarget as any).style.borderColor = C.g200; }}>
                                        <Edit2 size={13} color={C.amber} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Info Sidebar */}
                <div style={{
                    background: `linear-gradient(135deg,${C.navy},${C.navyM})`,
                    borderRadius: 20, padding: 28, color: "white",
                    boxShadow: `0 8px 32px ${C.navy}30`, position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.07 }}>
                        <Settings2 size={120} />
                    </div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
                            Operational Context
                        </div>
                        <p style={{ fontSize: 12.5, opacity: 0.65, lineHeight: 1.65, marginBottom: 24 }}>
                            Academic Years serve as the primary partition for all institutional records. The &quot;Current&quot; year filters dashboard analytics, attendance, and fee reports.
                        </p>

                        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />

                        {[
                            { icon: CheckCircle2, title: "Automated Archival", sub: "Data from previous sessions is preserved." },
                            { icon: Archive, title: "Unified Reporting", sub: "Generate reports across year boundaries." },
                        ].map(({ icon: Icon, title, sub }, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <Icon size={16} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                                    <div style={{ fontSize: 11.5, opacity: 0.5 }}>{sub}</div>
                                </div>
                            </div>
                        ))}

                        {currentYear && (
                            <>
                                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "20px 0" }} />
                                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Active Session</div>
                                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800 }}>{currentYear.name}</div>
                                    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>
                                        {format(new Date(currentYear.startDate), "MMM yyyy")} — {format(new Date(currentYear.endDate), "MMM yyyy")}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
