"use client";

import { useState, useRef } from "react";
import {
    CreditCard, Save, Zap, Clock, Calendar, TrendingUp,
    ShieldCheck, AlertCircle, Info, Check, DollarSign,
    Activity, Sparkles,
} from "lucide-react";
import { updatePayrollSettingsAction } from "@/app/actions/payroll-settings-actions";
import { toast } from "sonner";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redD: "#DC2626", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE", blueXL: "#EFF6FF",
    purple: "#8B5CF6", purpleL: "#EDE9FE",
    orange: "#F97316", orangeL: "#FFEDD5",
    teal: "#14B8A6", tealL: "#CCFBF1",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, type = "button", onClick }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", sh: `0 4px 16px ${C.amber}45` },
        navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", sh: `0 4px 14px ${C.navy}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "11px 22px", fs: 13.5, r: 12 }, lg: { p: "14px 30px", fs: 15, r: 14 } };
    const v = vs[variant] || vs.primary; const s = ss[size];
    const dis = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (dis) return;
        const rect = ref.current!.getBoundingClientRect();
        const id = Date.now();
        setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.();
    };

    return (
        <button ref={ref} type={type} disabled={dis} onClick={handleClick}
            onMouseEnter={e => { if (!dis) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

// ─── AMOUNT FIELD ──────────────────────────────────────────
function AmountField({ label, hint, name, value, onChange, color = C.green }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: 0.9 }}>{label}</label>
                {hint && <span style={{ fontSize: 11, color: color, fontWeight: 700 }}>{hint}</span>}
            </div>
            <div style={{
                display: "flex", alignItems: "center",
                background: focused ? `${color}10` : "white",
                border: `1.5px solid ${focused ? color : C.g200}`,
                borderRadius: 14, transition: C.tr,
                boxShadow: focused ? `0 0 0 4px ${color}20, 0 2px 8px ${color}15` : C.sh,
                transform: focused ? "translateY(-1px)" : "none",
                overflow: "hidden",
            }}>
                <div style={{ padding: "0 14px 0 16px", borderRight: `1.5px solid ${focused ? color + "40" : C.g100}`, display: "flex", alignItems: "center", transition: C.tr }}>
                    <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: focused ? color : C.g300 }}>₹</span>
                </div>
                <input type="number" name={name} value={value} onChange={onChange}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "14px 16px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: focused ? color : C.g700, outline: "none" }} />
            </div>
        </div>
    );
}

// ─── NUM FIELD ─────────────────────────────────────────────
function NumField({ label, hint, name, value, onChange, suffix, color = C.blue, dark = false }: any) {
    const [focused, setFocused] = useState(false);
    const bg = dark ? (focused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)") : (focused ? `${color}10` : "white");
    const border = dark ? `1.5px solid ${focused ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)"}` : `1.5px solid ${focused ? color : C.g200}`;
    const textColor = dark ? "white" : (focused ? color : C.g700);
    const labelColor = dark ? "rgba(255,255,255,0.5)" : C.g500;

    return (
        <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>{label}</label>
            {hint && <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.35)" : C.g400, marginBottom: 8, fontWeight: 600 }}>{hint}</div>}
            <div style={{ display: "flex", alignItems: "center", background: bg, border, borderRadius: 12, transition: C.tr, boxShadow: focused && !dark ? `0 0 0 4px ${color}20` : "none" }}>
                <input type="number" name={name} value={value} onChange={onChange}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "13px 14px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: textColor, outline: "none" }} />
                {suffix && <span style={{ paddingRight: 14, fontSize: 10, fontWeight: 800, color: dark ? "rgba(255,255,255,0.3)" : C.g400, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{suffix}</span>}
            </div>
        </div>
    );
}

// ─── CARD ──────────────────────────────────────────────────
function Card({ children, style = {} }: any) {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "28px 28px", boxShadow: C.sh, border: `1px solid ${C.g100}`, ...style }}>
            {children}
        </div>
    );
}

// ─── SECTION HEADER ────────────────────────────────────────
function CardHdr({ icon: Icon, title, sub, color = C.amber, dark = false }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: dark ? "rgba(255,255,255,0.12)" : `linear-gradient(135deg,${color},${color}bb)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: dark ? "none" : `0 4px 14px ${color}40` }}>
                <Icon size={22} color={dark ? color : "white"} strokeWidth={2} />
            </div>
            <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: dark ? "white" : C.navy, lineHeight: 1.2 }}>{title}</div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.4)" : C.g400, marginTop: 3, fontWeight: 600 }}>{sub}</div>
            </div>
        </div>
    );
}

// ─── PROPS ─────────────────────────────────────────────────
interface PayrollSettingsManagerProps {
    schoolSlug: string;
    initialData: any;
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export function PayrollSettingsManager({ schoolSlug, initialData }: PayrollSettingsManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullAttendanceBonus: initialData?.fullAttendanceBonus || 0,
        punctualityBonus: initialData?.punctualityBonus || 0,
        lateThreshold: initialData?.lateThreshold || 3,
        latePenalty: initialData?.latePenalty || 0,
        overtimeRate: initialData?.overtimeRate || 0,
        workDaysPerWeek: initialData?.workDaysPerWeek || 6,
        standardWorkHours: initialData?.standardWorkHours || 8,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await updatePayrollSettingsAction(schoolSlug, formData);
        if (res.success) toast.success("Payroll rules updated successfully");
        else toast.error(res.error || "Failed to update settings");
        setIsLoading(false);
    };

    // Live preview stats
    const monthlyWorkDays = formData.workDaysPerWeek * 4;
    const penaltyAfterThreshold = formData.lateThreshold;
    const maxPossibleBonus = Number(formData.fullAttendanceBonus) + Number(formData.punctualityBonus);

    return (
        <form onSubmit={handleSave} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
                @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg,${C.amber},${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${C.amber}45`, flexShrink: 0, animation: "fadeUp 0.3s ease" }}>
                        <CreditCard size={24} color="white" strokeWidth={2} />
                    </div>
                    <div style={{ animation: "fadeUp 0.35s ease 0.05s both" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0 }}>Payroll Architect</h1>
                            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.blueL, color: C.blue, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.blue, animation: "pulse 2s ease-in-out infinite" }} />
                                Engine Online
                            </span>
                        </div>
                        <p style={{ fontSize: 13.5, color: C.g400, margin: 0, fontWeight: 500 }}>
                            Configure incentives, late thresholds, and salary calculation logic.
                        </p>
                    </div>
                </div>
                <div style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
                    <Btn type="submit" variant="primary" icon={Save} loading={isLoading} size="md">
                        {isLoading ? "Saving..." : "Publish Rules"}
                    </Btn>
                </div>
            </div>

            {/* ── LIVE PREVIEW STAT CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "Max Monthly Bonus", value: `₹${maxPossibleBonus.toLocaleString()}`, sub: "Attendance + Punctuality", color: C.green, bg: C.greenL, icon: TrendingUp },
                    { label: "Monthly Work Days", value: `${monthlyWorkDays} days`, sub: `${formData.workDaysPerWeek} days/week × 4 weeks`, color: C.blue, bg: C.blueL, icon: Calendar },
                    { label: "Late Threshold", value: `${penaltyAfterThreshold} days`, sub: "Before penalty initiates", color: C.red, bg: C.redL, icon: AlertCircle },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 18, padding: "18px 20px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 14, animation: `fadeUp 0.35s ease ${i * 0.08}s both` }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <stat.icon size={20} color={stat.color} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: C.g400, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                            <div style={{ fontSize: 11, color: C.g300, fontWeight: 500 }}>{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── INCENTIVES CARD ── */}
            <Card style={{ marginBottom: 16, animation: "fadeUp 0.4s ease 0.15s both", position: "relative", overflow: "hidden" }}>
                {/* Watermark */}
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.04 }}>
                    <Sparkles size={140} color={C.green} />
                </div>
                <CardHdr icon={TrendingUp} title="Automated Incentives" sub="Monthly rewards for attendance and punctuality excellence" color={C.green} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, position: "relative", zIndex: 1 }}>
                    <AmountField
                        label="Perfect Attendance Bonus"
                        hint="✓ Applied if 0 absences"
                        name="fullAttendanceBonus"
                        value={formData.fullAttendanceBonus}
                        onChange={handleInputChange}
                        color={C.green}
                    />
                    <AmountField
                        label="Punctuality Incentive"
                        hint="✓ Applied if 0 late comings"
                        name="punctualityBonus"
                        value={formData.punctualityBonus}
                        onChange={handleInputChange}
                        color={C.amber}
                    />
                </div>

                {/* Combined bonus preview */}
                <div style={{ marginTop: 18, padding: "12px 18px", borderRadius: 14, background: C.greenXL, border: `1px solid ${C.greenL}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.greenD }}>
                        Max combined monthly bonus for a perfect employee
                    </div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.greenD }}>
                        ₹{maxPossibleBonus.toLocaleString()}
                    </div>
                </div>
            </Card>

            {/* ── PUNCTUALITY ENFORCEMENT ── (dark navy card) */}
            <div style={{
                borderRadius: 20, padding: "28px 28px", marginBottom: 16,
                background: `linear-gradient(145deg,${C.navy},${C.navyM})`,
                boxShadow: `0 8px 32px ${C.navy}50`,
                position: "relative", overflow: "hidden",
                animation: "fadeUp 0.45s ease 0.22s both",
            }}>
                {/* Watermark */}
                <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.06 }}>
                    <Clock size={180} color="white" />
                </div>

                <CardHdr icon={AlertCircle} title="Punctuality Enforcement" sub="Deduction & late threshold engine" color={C.red} dark />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20, position: "relative", zIndex: 1 }}>
                    <NumField label="Grace Threshold" hint="Max 'LATE' days before penalty starts" name="lateThreshold" value={formData.lateThreshold} onChange={handleInputChange} suffix="days" color={C.red} dark />
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>Late Penalty</label>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 600 }}>Per 'LATE' day after threshold</div>
                        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: `1.5px solid rgba(255,255,255,0.12)`, borderRadius: 12, transition: C.tr }}>
                            <span style={{ padding: "0 10px 0 16px", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>₹</span>
                            <input type="number" name="latePenalty" value={formData.latePenalty} onChange={handleInputChange}
                                style={{ flex: 1, border: "none", background: "transparent", padding: "13px 14px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.red, outline: "none" }} />
                        </div>
                    </div>
                </div>

                {/* Info banner */}
                <div style={{ padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "flex-start", gap: 12, position: "relative", zIndex: 1 }}>
                    <Info size={16} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.7)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.7 }}>Automated Logic</div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                            If a staff member has <strong style={{ color: "rgba(255,255,255,0.6)" }}>5 LATE days</strong> and threshold is <strong style={{ color: "rgba(255,255,255,0.6)" }}>{formData.lateThreshold}</strong>, a penalty of <strong style={{ color: C.red }}>₹{(2 * formData.latePenalty).toLocaleString()}</strong> ({2} × ₹{Number(formData.latePenalty).toLocaleString()}) is applied.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── OPERATION STANDARDS ── */}
            <Card style={{ marginBottom: 16, animation: "fadeUp 0.5s ease 0.3s both", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.04 }}>
                    <Calendar size={140} color={C.purple} />
                </div>
                <CardHdr icon={Calendar} title="Operation Standards" sub="Institutional baseline values for payroll calculation" color={C.purple} />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, position: "relative", zIndex: 1 }}>
                    {/* Work Days / Week */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>Working Days / Week</label>
                        <div style={{ position: "relative" }}>
                            <input type="number" name="workDaysPerWeek" value={formData.workDaysPerWeek} onChange={handleInputChange}
                                style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, outline: "none", background: C.g50, boxSizing: "border-box" }}
                                onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = `0 0 0 4px ${C.purple}20`; e.currentTarget.style.background = C.purpleL; }}
                                onBlur={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = C.g50; }} />
                            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: C.g400, textTransform: "uppercase" }}>days</span>
                        </div>
                    </div>
                    {/* Standard Work Hours */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>Standard Work Hours</label>
                        <div style={{ position: "relative" }}>
                            <input type="number" name="standardWorkHours" value={formData.standardWorkHours} onChange={handleInputChange}
                                style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, outline: "none", background: C.g50, boxSizing: "border-box" }}
                                onFocus={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.boxShadow = `0 0 0 4px ${C.purple}20`; e.currentTarget.style.background = C.purpleL; }}
                                onBlur={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = C.g50; }} />
                            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 800, color: C.g400, textTransform: "uppercase" }}>hrs</span>
                        </div>
                    </div>
                    {/* Overtime Rate */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>Overtime Rate (Per Hour)</label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.teal, opacity: 0.5 }}>₹</span>
                            <input type="number" name="overtimeRate" value={formData.overtimeRate} onChange={handleInputChange}
                                style={{ width: "100%", border: `1.5px solid ${C.teal}40`, borderRadius: 12, padding: "12px 14px 12px 34px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.teal, outline: "none", background: C.tealL, boxSizing: "border-box" }}
                                onFocus={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 0 0 4px ${C.teal}25`; }}
                                onBlur={e => { e.currentTarget.style.borderColor = `${C.teal}40`; e.currentTarget.style.boxShadow = "none"; }} />
                        </div>
                    </div>
                </div>

                {/* Monthly hours info */}
                <div style={{ marginTop: 18, padding: "11px 18px", borderRadius: 12, background: C.purpleL, border: `1px solid ${C.purple}20`, display: "flex", alignItems: "center", gap: 10 }}>
                    <Activity size={15} color={C.purple} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.purple }}>
                        Monthly standard: <strong>{monthlyWorkDays} days × {formData.standardWorkHours} hrs = {monthlyWorkDays * formData.standardWorkHours} hrs total</strong>
                    </span>
                </div>
            </Card>

            {/* ── FOOTER STATUS BAR ── */}
            <div style={{ background: "white", borderRadius: 18, padding: "16px 22px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeUp 0.55s ease 0.38s both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: C.g100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={17} color={C.g400} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.g500 }}>
                        Rules are applied globally to current and future payroll cycles upon recalculation.
                    </span>
                </div>
                <Btn type="submit" variant="primary" icon={Save} loading={isLoading} size="md">
                    {isLoading ? "Saving..." : "Publish Rules"}
                </Btn>
            </div>
        </form>
    );
}
