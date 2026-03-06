"use client";

import { useState, useEffect, useRef } from "react";
import { getRolesAction } from "@/app/actions/role-actions";
import {
    Calendar, Plus, Trash2, Clock, FileText, Timer, Zap,
    AlertCircle, Edit3, Check, X, Users, ShieldCheck,
    ChevronDown, AlertTriangle,
} from "lucide-react";
import { createLeavePolicyAction, deleteLeavePolicyAction, updateLeavePolicyAction } from "@/app/actions/leave-policy-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { useConfirm } from "@/contexts/ConfirmContext";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redD: "#DC2626", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE", blueXL: "#EFF6FF",
    purple: "#8B5CF6", purpleL: "#EDE9FE",
    orange: "#F97316",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, fullWidth, type = "button" }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", sh: `0 4px 16px ${C.amber}45` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},${C.redD})`, color: "white", sh: `0 4px 14px ${C.red}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", sh: `0 4px 14px ${C.navy}40` },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 }, lg: { p: "13px 28px", fs: 15, r: 14 } };
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
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? "100%" : "auto", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

// ─── LABEL ──────────────────────────────────────────────────
function Lbl({ children, required }: any) {
    return (
        <label style={{ fontSize: 11, fontWeight: 700, color: C.g500, display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.9 }}>
            {children}{required && <span style={{ color: C.red }}> *</span>}
        </label>
    );
}

// ─── NUMBER FIELD WITH SUFFIX ───────────────────────────────
function NumField({ label, value, onChange, suffix, step }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            {label && <Lbl>{label}</Lbl>}
            <div style={{ display: "flex", alignItems: "center", background: focused ? C.amberXL : "white", border: `1.5px solid ${focused ? C.amber : C.g200}`, borderRadius: 12, transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.amber}20` : "none" }}>
                <input type="number" step={step || 1} value={value} onChange={onChange}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "10px 12px", fontSize: 14, fontWeight: 700, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", minWidth: 0 }} />
                {suffix && <span style={{ paddingRight: 12, fontSize: 10, fontWeight: 800, color: C.g400, textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>{suffix}</span>}
            </div>
        </div>
    );
}

// ─── TOGGLE ─────────────────────────────────────────────────
function Toggle({ checked, onChange, label, sub }: any) {
    const w = 46, h = 26, d = 20, g = 3;
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            {(label || sub) && (
                <div>
                    {label && <div style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{label}</div>}
                    {sub && <div style={{ fontSize: 11.5, color: C.g400, marginTop: 2 }}>{sub}</div>}
                </div>
            )}
            <div onClick={() => onChange(!checked)}
                style={{ width: w, height: h, borderRadius: h / 2, background: checked ? C.green : C.g200, position: "relative", cursor: "pointer", transition: `background 0.4s ${C.spring}`, flexShrink: 0, boxShadow: checked ? `0 3px 12px ${C.green}55` : "inset 0 2px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ position: "absolute", top: g, left: checked ? w - d - g : g, width: d, height: d, borderRadius: "50%", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.25)", transition: `left 0.4s ${C.spring}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checked && <Check size={d * 0.45} color={C.green} strokeWidth={3} />}
                </div>
            </div>
        </div>
    );
}

// ─── MINI CHECKBOX ──────────────────────────────────────────
function MiniCheck({ checked, onChange, label }: any) {
    return (
        <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? C.green : C.g300}`, background: checked ? C.green : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: `all 0.3s ${C.spring}`, flexShrink: 0 }}>
                {checked && <Check size={10} color="white" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.g700, textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</span>
        </div>
    );
}

// ─── CARD ───────────────────────────────────────────────────
function Card({ children, style = {} }: any) {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "24px 26px", boxShadow: C.sh, border: `1px solid ${C.g100}`, ...style }}>
            {children}
        </div>
    );
}

// ─── SECTION HEADER ─────────────────────────────────────────
function SHdr({ icon: Icon, title, color = C.amber }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={color} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: color, textTransform: "uppercase", letterSpacing: 1.1 }}>{title}</span>
        </div>
    );
}

// ─── DIVIDER ─────────────────────────────────────────────────
function Divider() {
    return <div style={{ height: 1, background: `linear-gradient(90deg,${C.amber}30,${C.g200},transparent)`, margin: "22px 0" }} />;
}

// ─── TYPES ──────────────────────────────────────────────────
interface LeaveType {
    name: string; code: string; totalDays: number; isPaid: boolean;
    allowHalfDay: boolean; minNoticePeriod: number; requiresApproval: boolean; gender: string;
}
interface LeavePolicy {
    id: string; name: string; description: string | null; effectiveFrom: string | Date;
    isDefault: boolean; leaveTypes: LeaveType[]; roleId?: string | null;
    lateComingGrace: number; lateComingMax: number; earlyLeavingGrace: number; earlyLeavingMax: number;
    minFullDayHours: number; minHalfDayHours: number; maxDailyPunchEvents: number;
    permissionAllowed: boolean; permissionMaxMins: number; permissionMaxOccur: number; minPunchGapMins: number;
}
interface LeavePolicyManagerProps { schoolSlug: string; initialPolicies: LeavePolicy[]; }

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
    { name: "Casual Leave", code: "CL", totalDays: 12, isPaid: true, allowHalfDay: true, minNoticePeriod: 1, requiresApproval: true, gender: "ALL" },
    { name: "Sick Leave", code: "SL", totalDays: 10, isPaid: true, allowHalfDay: true, minNoticePeriod: 0, requiresApproval: true, gender: "ALL" },
    { name: "Loss of Pay", code: "LOP", totalDays: 99, isPaid: false, allowHalfDay: true, minNoticePeriod: 0, requiresApproval: true, gender: "ALL" },
];

const INITIAL_FORM: any = {
    id: "", name: "", description: "", effectiveFrom: new Date().toISOString().split("T")[0],
    isDefault: false, roleId: null,
    lateComingGrace: 15, lateComingMax: 60, earlyLeavingGrace: 15, earlyLeavingMax: 60,
    minFullDayHours: 8, minHalfDayHours: 4, maxDailyPunchEvents: 10,
    permissionAllowed: true, permissionMaxMins: 120, permissionMaxOccur: 2, minPunchGapMins: 0,
    leaveTypes: [...DEFAULT_LEAVE_TYPES],
};

const LEAVE_COLORS = [C.green, C.blue, C.amber, C.purple, C.orange, "#EC4899"];

// ─── MAIN COMPONENT ─────────────────────────────────────────
export function LeavePolicyManager({ schoolSlug, initialPolicies }: LeavePolicyManagerProps) {
    const { confirm: confirmDialog } = useConfirm();
    const [policies, setPolicies] = useState<LeavePolicy[]>(initialPolicies);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newPolicy, setNewPolicy] = useState(INITIAL_FORM);

    useEffect(() => {
        setMounted(true);
        getRolesAction(schoolSlug).then(res => { if (res.success && res.roles) setRoles(res.roles); });
    }, [schoolSlug]);

    if (!mounted) return null;

    const resetForm = () => { setIsCreating(false); setEditingId(null); setNewPolicy(INITIAL_FORM); };

    const handleSavePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const res = editingId
            ? await updateLeavePolicyAction(schoolSlug, editingId, newPolicy)
            : await createLeavePolicyAction(schoolSlug, newPolicy);
        if (res.success) {
            toast.success(editingId ? "Policy updated successfully" : "Leave policy created");
            setPolicies(editingId ? policies.map(p => p.id === editingId ? res.data as any : p) : [...policies, res.data as any]);
            resetForm();
        } else toast.error(res.error || "Failed to save policy");
        setIsLoading(false);
    };

    const handleEdit = (policy: LeavePolicy) => {
        setEditingId(policy.id);
        setIsCreating(true);
        setNewPolicy({
            id: policy.id, name: policy.name, description: policy.description || "",
            effectiveFrom: new Date(policy.effectiveFrom).toISOString().split("T")[0],
            isDefault: policy.isDefault, roleId: policy.roleId || null,
            lateComingGrace: policy.lateComingGrace, lateComingMax: policy.lateComingMax,
            earlyLeavingGrace: policy.earlyLeavingGrace, earlyLeavingMax: policy.earlyLeavingMax,
            minFullDayHours: policy.minFullDayHours || 8, minHalfDayHours: policy.minHalfDayHours || 4,
            maxDailyPunchEvents: policy.maxDailyPunchEvents || 10,
            permissionAllowed: policy.permissionAllowed,
            permissionMaxMins: policy.permissionMaxMins || 120, permissionMaxOccur: policy.permissionMaxOccur || 2,
            minPunchGapMins: policy.minPunchGapMins || 0,
            leaveTypes: (policy.leaveTypes || []).map((lt: any) => ({ ...lt })),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({ title: "Delete Leave Policy", message: "Are you sure? This will affect staff attendance rules.", variant: "danger", confirmText: "Delete", cancelText: "Cancel" });
        if (!confirmed) return;
        const res = await deleteLeavePolicyAction(schoolSlug, id);
        if (res.success) { toast.success("Policy removed"); setPolicies(policies.filter(p => p.id !== id)); }
    };

    const updateLeaveType = (index: number, field: keyof LeaveType, value: any) => {
        const updated = [...newPolicy.leaveTypes];
        updated[index] = { ...updated[index], [field]: value };
        setNewPolicy({ ...newPolicy, leaveTypes: updated });
    };

    const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = e.target.value;
        if (roleId === "") setNewPolicy({ ...newPolicy, roleId: null, isDefault: true, name: "Default Global Policy" });
        else { const role = roles.find(r => r.id === roleId); setNewPolicy({ ...newPolicy, roleId, isDefault: false, name: role ? role.name : "" }); }
    };

    const set = (field: string, value: any) => setNewPolicy((p: any) => ({ ...p, [field]: value }));

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            `}</style>

            {/* Top bar: summary + Add button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 12 }}>
                    {[
                        { label: "Total Policies", value: policies.length, color: C.navy, bg: "#EDE9FE" },
                        { label: "Default Active", value: policies.filter(p => p.isDefault).length, color: C.green, bg: C.greenL },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "white", borderRadius: 14, padding: "10px 18px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.g500 }}>{s.label}</span>
                        </div>
                    ))}
                </div>
                {!isCreating && (
                    <Btn icon={Plus} variant="navy" size="md" onClick={() => setIsCreating(true)}>
                        New Policy
                    </Btn>
                )}
            </div>

            {/* ── POLICY FORM ── */}
            {isCreating && (
                <form onSubmit={handleSavePolicy}>
                    <Card style={{ marginBottom: 20, animation: "slideDown 0.3s ease" }}>
                        {/* Form Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${C.navy},${C.navyM})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${C.navy}40` }}>
                                    <FileText size={19} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy }}>
                                        {editingId ? "Update Leave Policy" : "Define New Leave Policy"}
                                    </div>
                                    <div style={{ fontSize: 12.5, color: C.g400, marginTop: 2 }}>Fill in all sections and save</div>
                                </div>
                            </div>
                            <button type="button" onClick={resetForm}
                                style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={15} color={C.g500} />
                            </button>
                        </div>

                        {/* ── IDENTITY & SCHEDULE ── */}
                        <SHdr icon={FileText} title="Identity & Schedule" color={C.navy} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                            {/* Role selector */}
                            <div>
                                <Lbl>Applicable Role (Policy Name)</Lbl>
                                <div style={{ position: "relative" }}>
                                    <select value={newPolicy.roleId || ""} onChange={handleRoleSelect}
                                        style={{ width: "100%", padding: "11px 36px 11px 14px", borderRadius: 12, border: `1.5px solid ${C.g200}`, background: C.g50, fontSize: 13.5, fontWeight: 600, color: C.g800, outline: "none", cursor: "pointer", appearance: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                        <option value="">Default Global Policy</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} color={C.g400} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                                {newPolicy.name && (
                                    <div style={{ fontSize: 11.5, color: C.blue, fontWeight: 700, marginTop: 5 }}>
                                        Policy: <span style={{ color: C.navy }}>{newPolicy.name}</span>
                                    </div>
                                )}
                            </div>
                            {/* Effective Date */}
                            <div>
                                <Lbl required>Effective Date</Lbl>
                                <input type="date" required value={newPolicy.effectiveFrom} onChange={e => set("effectiveFrom", e.target.value)}
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.g200}`, background: C.g50, fontSize: 13.5, fontWeight: 600, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
                            </div>
                        </div>

                        <Divider />

                        {/* ── ATTENDANCE CALCULATIONS ── */}
                        <SHdr icon={Clock} title="Calculations & Limits" color={C.green} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
                            <NumField label="Min Hrs Full Day" value={newPolicy.minFullDayHours} step={0.5} suffix="hrs" onChange={(e: any) => set("minFullDayHours", Number(e.target.value))} />
                            <NumField label="Min Hrs Half Day" value={newPolicy.minHalfDayHours} step={0.5} suffix="hrs" onChange={(e: any) => set("minHalfDayHours", Number(e.target.value))} />
                            <NumField label="Max Punches/Day" value={newPolicy.maxDailyPunchEvents} suffix="events" onChange={(e: any) => set("maxDailyPunchEvents", Number(e.target.value))} />
                            <NumField label="Punch Gap" value={newPolicy.minPunchGapMins} suffix="mins" onChange={(e: any) => set("minPunchGapMins", Number(e.target.value))} />
                        </div>
                        <div style={{ background: C.greenXL, border: `1px solid ${C.greenL}`, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: C.greenD, fontWeight: 600, marginBottom: 24 }}>
                            Staff working less than {newPolicy.minHalfDayHours} hrs → ABSENT · Max {newPolicy.maxDailyPunchEvents} punch events per day
                        </div>

                        <Divider />

                        {/* ── PUNCTUALITY ── */}
                        <SHdr icon={Timer} title="Punctuality & Grace Periods" color={C.amber} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
                            <NumField label="Late Coming Grace" value={newPolicy.lateComingGrace} suffix="mins" onChange={(e: any) => set("lateComingGrace", Number(e.target.value))} />
                            <NumField label="Max Late/Month" value={newPolicy.lateComingMax} suffix="mins" onChange={(e: any) => set("lateComingMax", Number(e.target.value))} />
                            <NumField label="Early Exit Grace" value={newPolicy.earlyLeavingGrace} suffix="mins" onChange={(e: any) => set("earlyLeavingGrace", Number(e.target.value))} />
                            <NumField label="Max Early/Month" value={newPolicy.earlyLeavingMax} suffix="mins" onChange={(e: any) => set("earlyLeavingMax", Number(e.target.value))} />
                        </div>
                        <div style={{ background: C.amberXL, border: `1px solid ${C.amberL}`, borderLeft: `4px solid ${C.amber}`, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: C.amberD, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                            <AlertCircle size={14} color={C.amber} />
                            Attendance flagged if late exceeds {newPolicy.lateComingMax} mins in a calendar month.
                        </div>

                        <Divider />

                        {/* ── SHORT-LEAVE PERMISSIONS ── */}
                        <SHdr icon={Zap} title="Short-Leave Permissions" color={C.blue} />
                        <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 18, padding: "22px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, opacity: 0.06 }}>
                                <Zap size={100} color="white" />
                            </div>
                            <div style={{ position: "relative", zIndex: 1 }}>
                                <div style={{ marginBottom: 18 }}>
                                    <Toggle
                                        checked={newPolicy.permissionAllowed}
                                        onChange={(v: boolean) => set("permissionAllowed", v)}
                                        label={<span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Short-Leave Permissions Enabled</span>}
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    {/* Max Minutes */}
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Max Permission Mins / Month</label>
                                        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                                            <input type="number" value={newPolicy.permissionMaxMins} onChange={e => set("permissionMaxMins", Number(e.target.value))}
                                                style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "12px 14px", color: "white", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800 }} />
                                            <span style={{ paddingRight: 14, fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>MINS</span>
                                        </div>
                                    </div>
                                    {/* Max Occurrences */}
                                    <div>
                                        <label style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Max Occurrences / Month</label>
                                        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center" }}>
                                            <input type="number" value={newPolicy.permissionMaxOccur} onChange={e => set("permissionMaxOccur", Number(e.target.value))}
                                                style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "12px 14px", color: "white", fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800 }} />
                                            <span style={{ paddingRight: 14, fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>TIMES</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.5)", borderLeft: `3px solid ${C.blue}`, paddingLeft: 12 }}>
                                    Short-leave permissions are breaks (e.g. 1 hr) that don't count as half-day leaves.
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* ── LEAVE TYPE ENTITLEMENTS ── */}
                        <SHdr icon={ShieldCheck} title="Leave Type Entitlements" color={C.purple} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                            {newPolicy.leaveTypes.map((lt: LeaveType, idx: number) => {
                                const lColor = LEAVE_COLORS[idx % LEAVE_COLORS.length];
                                return (
                                    <div key={idx} style={{ background: C.g50, borderRadius: 16, padding: "16px 18px", border: `1.5px solid ${C.g200}`, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: 14, alignItems: "center" }}>
                                        {/* Name + Code */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${lColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 800, color: lColor }}>{lt.code}</span>
                                            </div>
                                            <input value={lt.name} onChange={e => updateLeaveType(idx, "name", e.target.value)}
                                                style={{ flex: 1, background: "white", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "8px 12px", fontSize: 13, fontWeight: 700, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
                                        </div>
                                        {/* Days */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "8px 12px" }}>
                                            <input type="number" value={lt.totalDays} onChange={e => updateLeaveType(idx, "totalDays", Number(e.target.value))}
                                                style={{ width: 50, border: "none", background: "transparent", fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, outline: "none" }} />
                                            <span style={{ fontSize: 10, fontWeight: 800, color: C.g400, textTransform: "uppercase" }}>days</span>
                                        </div>
                                        {/* Toggles */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            <MiniCheck checked={lt.isPaid} onChange={(v: boolean) => updateLeaveType(idx, "isPaid", v)} label="Paid" />
                                            <MiniCheck checked={lt.requiresApproval} onChange={(v: boolean) => updateLeaveType(idx, "requiresApproval", v)} label="Needs Approval" />
                                        </div>
                                        {/* Paid badge */}
                                        <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: lt.isPaid ? C.greenL : C.redL, color: lt.isPaid ? C.greenD : C.redD, whiteSpace: "nowrap" }}>
                                            {lt.isPaid ? "Paid" : "LOP"}
                                        </div>
                                    </div>
                                );
                            })}
                            <Btn icon={Plus} variant="ghost" size="sm" onClick={() => setNewPolicy({ ...newPolicy, leaveTypes: [...newPolicy.leaveTypes, { name: "New Leave", code: "NL", totalDays: 5, isPaid: true, allowHalfDay: true, minNoticePeriod: 1, requiresApproval: true, gender: "ALL" }] })}>
                                Add Leave Type
                            </Btn>
                        </div>

                        {/* Form Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
                            <Btn variant="secondary" onClick={resetForm}>Discard</Btn>
                            <Btn variant="navy" icon={Check} loading={isLoading} type="submit">
                                {editingId ? "Save Changes" : "Create Policy"}
                            </Btn>
                        </div>
                    </Card>
                </form>
            )}

            {/* ── POLICY CARDS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {policies.length === 0 && !isCreating && (
                    <div style={{ background: "white", borderRadius: 20, padding: "60px 40px", textAlign: "center", boxShadow: C.sh, border: `2px dashed ${C.g200}` }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.g100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "float 3s ease-in-out infinite" }}>
                            <Calendar size={28} color={C.g300} />
                        </div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }}>No Leave Policies Defined</div>
                        <p style={{ fontSize: 13.5, color: C.g400, marginBottom: 20 }}>Create your first leave policy to manage staff entitlements and attendance rules.</p>
                        <Btn icon={Plus} variant="navy" onClick={() => setIsCreating(true)}>Define First Policy</Btn>
                    </div>
                )}

                {policies.map((policy, pi) => (
                    <Card key={policy.id} style={{ animation: `fadeUp 0.35s ease ${pi * 0.07}s both` }}>
                        {/* Policy Header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: `linear-gradient(135deg,${C.green},${C.greenD})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${C.green}40` }}>
                                    <FileText size={22} color="white" />
                                </div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy }}>{policy.name}</span>
                                        {policy.isDefault && (
                                            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.greenL, color: C.greenD, display: "inline-flex", alignItems: "center", gap: 5 }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                                                Default Policy
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.g500, fontWeight: 600 }}>
                                            <Calendar size={12} color={C.g400} />
                                            From {format(new Date(policy.effectiveFrom), "dd MMM yyyy")}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.amberD, fontWeight: 700 }}>
                                            <Timer size={12} color={C.amber} />
                                            Late Grace: {policy.lateComingGrace}m / {policy.lateComingMax}m cap
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleEdit(policy)}
                                    onMouseEnter={e => { (e.currentTarget as any).style.background = C.amberL; (e.currentTarget as any).style.borderColor = C.amber; }}
                                    onMouseLeave={e => { (e.currentTarget as any).style.background = "white"; (e.currentTarget as any).style.borderColor = C.g200; }}
                                    style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: C.tr }}>
                                    <Edit3 size={14} color={C.amber} />
                                </button>
                                <button onClick={() => handleDelete(policy.id)}
                                    onMouseEnter={e => { (e.currentTarget as any).style.background = C.redL; (e.currentTarget as any).style.borderColor = C.red; }}
                                    onMouseLeave={e => { (e.currentTarget as any).style.background = "white"; (e.currentTarget as any).style.borderColor = C.g200; }}
                                    style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: C.tr }}>
                                    <Trash2 size={14} color={C.red} />
                                </button>
                            </div>
                        </div>

                        {/* Summary Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
                            {/* Punctuality */}
                            <div style={{ background: C.amberXL, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.amberL}` }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: C.amberD, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Punctuality</div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.g700, marginBottom: 5 }}>
                                    <span>Late Grace</span><span style={{ fontWeight: 800 }}>{policy.lateComingGrace}m</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.g700 }}>
                                    <span>Early Grace</span><span style={{ fontWeight: 800 }}>{policy.earlyLeavingGrace}m</span>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div style={{ background: C.blueXL, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.blueL}` }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Permissions</div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.g700, marginBottom: 5 }}>
                                    <span>Allowed</span><span style={{ fontWeight: 800, color: policy.permissionAllowed ? C.greenD : C.red }}>{policy.permissionAllowed ? "YES" : "NO"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.g700 }}>
                                    <span>Cap</span><span style={{ fontWeight: 800 }}>{policy.permissionMaxMins}m ({policy.permissionMaxOccur}x)</span>
                                </div>
                            </div>

                            {/* Leave Type Cards */}
                            {policy.leaveTypes?.map((lt: LeaveType, lidx: number) => {
                                const lColor = LEAVE_COLORS[lidx % LEAVE_COLORS.length];
                                return (
                                    <div key={lidx} style={{ borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.g100}`, background: `${lColor}08`, position: "relative" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 800, color: lColor }}>{lt.code}</span>
                                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: lt.isPaid ? C.greenL : C.redL, color: lt.isPaid ? C.greenD : C.redD }}>
                                                {lt.isPaid ? "Paid" : "LOP"}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.g800, marginBottom: 6 }}>{lt.name}</div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: lColor }}>
                                            {lt.totalDays} <span style={{ fontSize: 10, color: C.g400, fontWeight: 800 }}>days</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
